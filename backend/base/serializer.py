from rest_framework import serializers
from django.db import transaction
from .models import (User, Test, Question, Answer, Attempt, 
                     GivenAnswer, ProgrammingQuestion, 
                     TestCase, Submission)

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model=User
        fields=['username', 'email', 'password', 'last_name', 'first_name']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    login = serializers.CharField(source='username', read_only=True)

    class Meta:
        model = User
        fields = ['login', 'first_name', 'last_name']
        read_only_fields = fields

# ТЕСТЫ

class AnswerSerializer(serializers.ModelSerializer):  # Ответы
    id_answer = serializers.IntegerField(source='id', read_only=True)
    class Meta:
        model=Answer
        fields=['id_answer','text']

class QuestionSerializer(serializers.ModelSerializer): # Вопросы
    answers = AnswerSerializer(many=True, read_only=True)
    id_question = serializers.IntegerField(source='id', read_only=True)
    class Meta:
        model=Question
        fields=['id_question','text', 'answers']

class TestListSerializer(serializers.ModelSerializer): # Все тесты
    id_tests = serializers.IntegerField(source='id', read_only=True)
    class Meta:
        model = Test
        fields = ['id_tests', 'title']
    

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['stdin', 'expected_out', 'weight']


class ProgrammingQuestionSerializer(serializers.ModelSerializer):
    id_question = serializers.IntegerField(source='id', read_only=True)
    testcases = TestCaseSerializer(many=True, read_only=True)

    class Meta:
        model = ProgrammingQuestion
        fields = ['id_question', 'title', 'description', 'language', 'time_limit', 'testcases']


class TestDetailSerializer(serializers.ModelSerializer): # Определённый тест
    questions = QuestionSerializer(many=True, read_only=True)
    id_test = serializers.IntegerField(source='id', read_only=True)

    code_tasks = ProgrammingQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Test
        fields = ['id_test', 'title', 'questions', 'code_tasks']

class SubmissionSerializer(serializers.ModelSerializer):
    attempt = serializers.PrimaryKeyRelatedField(queryset=Attempt.objects.all(), write_only=True)
    question = serializers.PrimaryKeyRelatedField(queryset=ProgrammingQuestion.objects.all())

    class Meta:
        model = Submission
        fields =['id', 'attempt', 'question', 'code', 'status', 'score', 'stdout', 'stderr',
                 'created_at', 'finished_at']
        read_only_fields=['status', 'score', 'stdout', 'stderr', 'created_at', 'finished_at']


class GivenAnswerCreateSerializer(serializers.ModelSerializer): # Вопрос/Выбранный ответ
    
    class Meta:
        model = GivenAnswer
        fields = ['question', 'selected']

    def validate(self, attrs):
        if attrs['selected'].question_id != attrs['question'].id:
            raise serializers.ValidationError('Вариант не принадлежит вопросу.')
        return attrs

    def create(self, validated_data):
        attempt = self.context['attempt']
        answer = validated_data['selected']
        obj = GivenAnswer.objects.update_or_create(
            attempt = attempt,
            question = validated_data['question'],
            defaults={
                'selected':answer,
                'is_correct':answer.is_correct,
            }
        )
        return obj

class GivenAnswerSerializer(serializers.ModelSerializer): 
    question = serializers.StringRelatedField()
    selected = AnswerSerializer(read_only=True)

    class Meta:
        model = GivenAnswer
        fields = ['id', 'question', 'selected', 'is_correct']
        read_only_fields = fields

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.attempt.finished_at is None:
            rep.pop('is_correct', None)
        return rep



class AttemptSerializer(serializers.ModelSerializer):
    answers = GivenAnswerSerializer(many=True, read_only=True)
    score = serializers.SerializerMethodField()
    submissions = SubmissionSerializer(many=True, read_only=True)

    max_score = serializers.IntegerField(read_only=True)
    grade = serializers.IntegerField(read_only=True)

    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Attempt
        fields = ['id','test','started_at','finished_at','score',
                  'max_score', 'grade', 'first_name','last_name', 
                  'answers', 'submissions',]

    def get_score(self,obj):
        answer_score = obj.answers.filter(is_correct=True).count()
        code_scores = {}
        for sub in obj.submissions.all():
            qid = sub.question_id
            code_scores[qid] = max(code_scores.get(qid,0), sub.score)
        code_score = sum(code_scores.values())
        return answer_score + code_score
    
class AttemptSolvedMinimalSerializer(AttemptSerializer):
    id_attempt = serializers.IntegerField(source='id', read_only=True)
    id_test = serializers.IntegerField(source='test.id', read_only=True)
    title = serializers.CharField(source = 'test.title', read_only=True)

    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    grade = serializers.IntegerField(read_only=True)

    class Meta:
        model = Attempt
        fields = ['id_attempt', 'id_test','title','grade', 'first_name','last_name']

# создание тестов


class AnswerWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['text', 'is_correct']

class QuestionWriteSerializer(serializers.ModelSerializer):
    answers = AnswerWriteSerializer(many=True)

    class Meta:
        model = Question
        fields = ['text','answers']

class TestCaseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['stdin','expected_out', 'weight']

class ProgrammingQuestionWriteSerializer(serializers.ModelSerializer):
    testcases = TestCaseWriteSerializer(many=True)

    class Meta:
        model = ProgrammingQuestion
        fields = ['title', 'description', 'language', 'time_limit','memory_limit', 'docker_image', 'testcases']


class TestCreateSerializer(serializers.ModelSerializer):
    questions = QuestionWriteSerializer(many=True, required=False)
    code_tasks = ProgrammingQuestionWriteSerializer(many=True, required=False)
    
    class Meta:
        model = Test
        fields = ['id','title','questions', 'code_tasks']
        
    @transaction.atomic
    def create(self, validated_data):
        questions = validated_data.pop('questions', [])
        code_tasks = validated_data.pop('code_tasks', [])

        test = Test.objects.create(**validated_data)

        for q in questions:
            answers = q.pop('answers', [])
            question_obj = Question.objects.create(test=test, **q)
            Answer.objects.bulk_create(
                [Answer(question=question_obj, **a) for a in answers]
            )

        for task in code_tasks:
            tcs = task.pop('testcases', [])
            task_obj = ProgrammingQuestion.objects.create(test=test, **task)
            TestCase.objects.bulk_create(
                [TestCase(question=task_obj, **tc) for tc in tcs]
            )
        
        return test
    