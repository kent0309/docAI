from django.urls import path
from .views import (
    DocumentListCreateView,
    DocumentDetailView,
    DocumentProcessView,
    DocumentUploadView,
    ExtractedDataListView,
    UserLoginView,
    UserRegisterView,
    StatsView,
)

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', UserLoginView.as_view(), name='login'),
    path('auth/register/', UserRegisterView.as_view(), name='register'),
    
    # Document endpoints
    path('documents/', DocumentListCreateView.as_view(), name='document-list'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    path('documents/upload/', DocumentUploadView.as_view(), name='document-upload'),
    path('documents/<int:pk>/process/', DocumentProcessView.as_view(), name='document-process'),
    
    # Extracted data endpoints
    path('documents/<int:document_id>/data/', ExtractedDataListView.as_view(), name='extracted-data-list'),
    
    # Stats endpoint
    path('stats/', StatsView.as_view(), name='stats'),
] 