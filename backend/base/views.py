from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from .tasks import grade_submission
from .models import User, Attempt, GivenAnswer, Test, Submission
from .serializer import (UserRegistrationSerializer, TestDetailSerializer,
                         TestListSerializer, GivenAnswerCreateSerializer, 
                         AttemptSerializer, GivenAnswerSerializer,
                         SubmissionSerializer, TestCreateSerializer,
                         AttemptSolvedMinimalSerializer,
                         UserProfileSerializer)

from .permissions import IsTeacher, IsTeacherOrReadOnly

from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from .security import (
    CodeSecurityService,
    DangerousCodeError,
    PlagiarismError,
)

security_service = CodeSecurityService() 

@method_decorator(
    ratelimit(key='ip', rate='5/m', method='POST', block=True),
    name='post',
)
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        
        code = request.data.get('code')
        if code is not None:
            try:
                user = User.objects.get(teacher_code=code, is_teacher=True)
            except User.DoesNotExist:
                return Response({'success': False, 'detail': 'Неправильный код'}, status=401)
            
            refresh_token = RefreshToken.for_user(user)
            access_token = str(refresh_token.access_token)

            res = Response({'success': True, 'is_teacher': True})
            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            return res
        
        try:
            response = super().post(request, *args, **kwargs)
            tokens = response.data

            access_token = tokens['access']
            refresh_token = tokens['refresh']

            res = Response()

            res.data = {'success':True, 'is_teacher':False}

            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            return res
        
        except:
            return Response({'success':False})

@method_decorator(
    ratelimit(key='ip', rate='10/m', method='POST', block=True),
    name='post',
)
class CustomRefreshToken(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')

            request.data['refresh'] = refresh_token

            responce = super().post(request, *args, **kwargs)

            tokens = responce.data
            access_token = tokens['access']

            res = Response()

            res.data = {'refreshed':True}

            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )


            return res

        except:
            return Response({'refreshed':False})


@api_view(['POST'])
def logout(request):
    try:
        res = Response()
        res.data = {'success':True}
        res.delete_cookie('access_token', path='/', samesite='None')
        res.delete_cookie('refresh_token', path='/', samesite='None')
        return res
    except:
        return Response({'success':False})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def is_authenticated(request):
    return Response({'authenticated':True, 'is_teacher': request.user.is_teacher})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    ser = UserProfileSerializer(request.user)
    return Response(ser.data)

@ratelimit(key='ip', rate='3/h', method='POST', block=True)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.error)



# api тесты

class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all().order_by('-created_at')
    permission_classes = [IsTeacherOrReadOnly] # Только авторизованные
    

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'patrial_update'):
            return TestCreateSerializer
        return TestDetailSerializer if self.action == 'retrieve' else TestListSerializer


    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def start(self, request, pk=None):
        test = self.get_object()
        
        attempt = Attempt.objects.filter(
            user = request.user,
            test=test,
            finished_at__isnull = True
        ).order_by('started_at').first()

        if attempt:
            data = AttemptSerializer(attempt).data
            data['is_start'] = True # Имеется незавершенная попытка
            return Response(data, status=status.HTTP_200_OK)
        
        attempt = Attempt.objects.create(user=request.user, test=test)
        data = AttemptSerializer(attempt).data
        data['is_start'] = False
        return Response(data, status=status.HTTP_201_CREATED)


class AttemptViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        return (
            AttemptSolvedMinimalSerializer
            if self.action in ['solved', 'filter']
            else AttemptSerializer
        )

    def get_queryset(self):
        qs = Attempt.objects.select_related('user', 'test').order_by('-started_at')
        if not getattr(self.request.user, 'is_teacher', False):
            qs = qs.filter(user=self.request.user)
        return qs
    
    @action(detail=False, methods=['get'])
    def solved(self, request):
        qs = self.get_queryset().filter(finished_at__isnull=False)
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page or qs, many = True)
        return self.get_paginated_response(ser.data) if page else Response(ser.data)

    @action(detail=False, methods=['post'], url_path='filter', permission_classes=[IsAuthenticated, IsTeacher])
    def filter(self, request):
        params = request.data
        qs = Attempt.objects.select_related('user','test').filter(finished_at__isnull=False)

        test_id = params.get('test')
        if test_id:
            qs = qs.filter(test_id=test_id)

        user_id = params.get('user')
        if user_id:
            qs = qs.filter(user_id=user_id)

        first = params.get('first_name')
        if first:
            qs = qs.filter(user__first_name__icontains=first)

        last = params.get('last_name')
        if last:
            qs = qs.filter(user__last_name__icontains=last)

        qs = qs.order_by('-finished_at')

        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page or qs, many=True)
        return self.get_paginated_response(ser.data) if page else Response(ser.data)


    @action(detail=True,methods=['post'])
    def finish(self, request, pk=None):
        attempt = self.get_object()
        if attempt.finished_at:
            return Response({'is_finished': True}, status=status.HTTP_400_BAD_REQUEST)
        
        attempt.finished_at = timezone.now()
        attempt.max_score = attempt.calc_max_score()
        attempt.grade = attempt.calc_grade()
        attempt.save(update_fields=['finished_at', 'grade', 'max_score'])
        return Response({'finish':True, 'max_score':attempt.max_score, 'grade': attempt.grade})
    

        
    @action(detail=True, methods=['post'])
    @method_decorator(ratelimit(key='ip', rate='60/m', method='POST', block=True))
    def answer(self, request, pk=None):
        attempt = self.get_object()
        if attempt.finished_at:
            return Response({'is_finished': True}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = GivenAnswerCreateSerializer(
            data=request.data,
            context={'attempt':attempt,'request':request}
        )
        serializer.is_valid(raise_exception=True)
        given, created = serializer.save()
        
        status_code = 201 if created else 200
        return Response(GivenAnswerSerializer(given).data, status=status_code)
    

@method_decorator(
    ratelimit(key='ip', rate='5/m', method='POST', block=True),
    name='create',
)
class SubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SubmissionSerializer

    def get_queryset(self):
        return Submission.objects.filter(attempt__user=self.request.user)
    
    def perform_create(self, serializer):
        attempt = get_object_or_404(
            Attempt,
            pk=self.request.data.get('attempt'),
            user=self.request.user,
            finished_at__isnull=True
        )
        if attempt.finished_at:
            return Response({'is_finished': True}, status=status.HTTP_400_BAD_REQUEST)
        
        code = self.request.data.get("code", "")
        ip = self.request.META.get("REMOTE_ADDR", "-")

        try:
            security_service.validate(code, ip)

        except DangerousCodeError:
            submission = serializer.save(
                attempt=attempt,
                status='DANGEROUS',
                finished_at=timezone.now()
            )
            return Response(SubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)

        except PlagiarismError:
            submission = serializer.save(
                attempt=attempt,
                status='PLAGIAT',
                finished_at=timezone.now()
            )
            return Response(SubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)
        
        submission = serializer.save(attempt=attempt, status='PENDING')
        grade_submission.delay(submission.id)