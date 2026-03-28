from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import *
from .serializers import *
from .services import *
from django.db import transaction


class DocumentListView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.select_related('analysis').filter(
            user=self.request.user
        ).order_by('-uploaded_at')
    

class DocumentDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.select_related('analysis').filter(
            user=self.request.user
        )


from django.db import transaction


class DocumentUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = DocumentUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        file = serializer.validated_data['file']
        title = serializer.validated_data['title']
        file_type = serializer.get_file_type(file)
        
        try:
            with transaction.atomic():
                document = Document.objects.create(
                    user=request.user,
                    title=title,
                    file=file,
                    file_type=file_type,
                    status=Document.Status.ANALYZING
                )
                
                document.file.seek(0)
                text = extract_text_from_file(document.file, file_type)
                
                if not text:
                    raise ValueError('Could not extract text from document.')
                
                parsed, raw = analyze_document_with_groq(text)
                
                DocumentAnalysis.objects.create(
                    document=document,
                    summary=parsed.get('summary', ''),
                    key_findings=parsed.get('key_findings', []),
                    medications=parsed.get('medications', []),
                    warnings=parsed.get('warnings', []),
                    raw_response=raw,
                )
                document.status = Document.Status.DONE
                document.save()
        
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except Exception as e:
            return Response({'error': 'Document processing failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(DocumentSerializer(document).data, status=status.HTTP_201_CREATED)