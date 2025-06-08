from django.db import models
from django.contrib.auth.models import User

class Document(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='documents/')
    document_type = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=50, default='processing')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file.name} by {self.user.username}"

class ExtractedData(models.Model):
    document = models.ForeignKey(Document, related_name='extracted_data', on_delete=models.CASCADE)
    key = models.CharField(max_length=255)
    value = models.TextField()
    is_validated = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.key}: {self.value} for {self.document.id}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile" 