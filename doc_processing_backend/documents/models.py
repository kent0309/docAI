from django.db import models

class ProcessingLog(models.Model):
    document = models.ForeignKey('api.Document', on_delete=models.CASCADE, related_name='processing_logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=100)
    details = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.action} on {self.document.id} at {self.timestamp}"