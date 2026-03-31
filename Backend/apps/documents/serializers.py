from rest_framework import serializers
from .models import *


class DocumentAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentAnalysis
        fields = ["id", "summary", "key_findings", "medications", "warnings", "raw_response", "created_at"]
        

class DocumentSerializer(serializers.ModelSerializer):
    analysis = DocumentAnalysisSerializer(read_only = True)
    class Meta:
        model = Document
        fields = ["id", "title", "file", "file_type", "status", "uploaded_at", "analysis"]
        read_only_fields = ["status", "uploaded_at", "analysis"]
        

class DocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["title", "file"]
        
    def get_file_type(self, file):
        """Get file type from file extension"""
        extension = file.name.lower().split('.')[-1]
        if extension in ['jpg', 'jpeg', 'png']:
            return 'image'
        elif extension == 'pdf':
            return 'pdf'
        elif extension == 'docx':
            return 'docx'
        return extension
        
    def validate_file(self, file):
        name = file.name.lower()
        if not name.endswith(('.pdf', '.jpg', ".jpeg", ".png", ".docx")):
            raise serializers.ValidationError("Only PDF, JPG, JPEG, PNG and DOCX files are allowed.")
        
        if file.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size must be under 5MB.")
        return file
    
    def create(self, validated_data):
        # Automatically determine file_type before saving to the DB
        file = validated_data['file']
        validated_data['file_type'] = self.get_file_type(file)
        
        return super().create(validated_data)
