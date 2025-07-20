from django.urls import path

from .views import (
    CustomTokenObtainPairView, CustomRefreshToken, 
    logout, is_authenticated, register,
    TestViewSet, AttemptViewSet,
    SubmissionViewSet, profile
)

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'tests', TestViewSet)
router.register(r'attempts', AttemptViewSet, basename='attempt')
router.register(r'submissions', SubmissionViewSet, basename='submission')

urlpatterns = [
    # Авторизация
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomRefreshToken.as_view(), name='token_refresh'),
    path('logout/', logout),
    path('authenticated/', is_authenticated),
    path('register/', register),
    path('profile/', profile),
]

urlpatterns += router.urls