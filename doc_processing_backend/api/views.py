from django.contrib.auth.models import User
from django.db.models import Count
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Document, ExtractedData, UserProfile
from .serializers import (
    DocumentSerializer, 
    ExtractedDataSerializer, 
    UserSerializer,
    LoginSerializer
)

# Authentication views
class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Document views
class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

class DocumentUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        file = request.FILES.get('file')
        title = request.data.get('title', file.name)
        
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        document = Document.objects.create(
            user=request.user,
            file=file,
            document_type=request.data.get('document_type', 'unknown'),
            status='pending'
        )
        
        return Response(DocumentSerializer(document).data, status=status.HTTP_201_CREATED)

class DocumentProcessView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            document = Document.objects.get(pk=pk, user=request.user)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # This is where you'd implement the AI processing logic
        # For now, we'll just update the status and add some mock extracted data
        document.status = 'completed'
        document.save()
        
        # Add some mock extracted data
        mock_data = {
            'name': 'John Doe',
            'date': '2023-05-15',
            'id_number': 'ABC123456',
            'address': '123 Main St, Anytown, USA'
        }
        
        for key, value in mock_data.items():
            ExtractedData.objects.create(
                document=document,
                key=key,
                value=value
            )
        
        return Response(DocumentSerializer(document).data)

# ExtractedData views
class ExtractedDataListView(generics.ListAPIView):
    serializer_class = ExtractedDataSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        document_id = self.kwargs.get('document_id')
        return ExtractedData.objects.filter(document_id=document_id, document__user=self.request.user)

# Stats view
class StatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user_docs = Document.objects.filter(user=request.user)
        
        # Get document counts by status
        status_counts = user_docs.values('status').annotate(count=Count('status'))
        status_dict = {item['status']: item['count'] for item in status_counts}
        
        # Calculate total
        total_docs = user_docs.count()
        
        return Response({
            'total_documents': total_docs,
            'pending': status_dict.get('pending', 0),
            'processing': status_dict.get('processing', 0),
            'completed': status_dict.get('completed', 0),
            'error': status_dict.get('error', 0)
        }) 