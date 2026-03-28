from django.core.validators import FileExtensionValidator
from django.db import models
from django.conf import settings


class Document(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ANALYZING = 'analyzing', 'Analyzing'
        DONE = 'done', "Done"
        FAILED = 'failed', 'Failed'
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    file = models.FileField(
        upload_to='documents/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'docx', 'jpg', 'jpeg', 'png'])]
    )
    file_type = models.CharField(max_length=10)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-uploaded_at"]
    
    def __str__(self):
        return f"{self.user} - {self.title}"


class DocumentAnalysis(models.Model):
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='analysis')
    summary = models.TextField()
    key_findings = models.JSONField(default=list, blank=True)
    medications = models.JSONField(default=list, blank=True)
    warnings = models.JSONField(default=list, blank=True)
    raw_response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Document Analyses"
    
    def __str__(self):
        return f"Analysis: {self.document.title}"