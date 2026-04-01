import logging

from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import *
from .services import *
from django.db import transaction
from utils.pagination import StandardPagination

logger = logging.getLogger(__name__)


class DocumentListView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination
    
    def get_queryset(self):
        if not self.request.user or not self.request.user.is_authenticated:
            return Document.objects.none()
        queryset = Document.objects.select_related('analysis').filter(
            user=self.request.user
        ).order_by('-uploaded_at')
    
        #   filter by title search
        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(title__icontains=search)
            
        # filter by status
        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset
    

class DocumentDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.select_related('analysis').filter(
            user=self.request.user
        )


class DocumentUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
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
    
    def post(self, request):
        serializer = DocumentUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        file = serializer.validated_data['file']
        title = serializer.validated_data['title']
        file_type = self.get_file_type(file)
        
        # This gives us an audit trail and an ID to attach errors to.
        document = Document.objects.create(
            user=request.user,
            title=title,
            file=file,
            file_type=file_type,
            status=Document.Status.ANALYZING
        )
        
        try:
            document.file.seek(0)
            text = extract_text_from_file(document.file, file_type)
            
            if not text:
                raise ValueError('Could not extract text from document.')
            
            #  Perform the heavy lifting outside the DB transaction.
            parsed, raw = analyze_document_with_groq(text)
        
        except ValueError as e:
            # Update the document to reflect the failure
            document.status = Document.Status.FAILED  # Make sure FAILED is in your choices
            document.save(update_fields=['status'])
            return Response({'error': str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
        except Exception:
            logger.exception(
                "Document processing failed during extraction/analysis "
                "for user_id=%s doc_id=%s title=%r",
                request.user.id,
                document.id,
                title
            )
            # Update the document to reflect the failure
            document.status = Document.Status.FAILED
            document.save(update_fields=['status'])
            return Response(
                {'error': 'Document processing failed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Analysis succeeded. Save the results.
        try:
            with transaction.atomic():
                DocumentAnalysis.objects.create(
                    document=document,
                    summary=parsed.get('summary', ''),
                    key_findings=parsed.get('key_findings', []),
                    medications=parsed.get('medications', []),
                    warnings=parsed.get('warnings', []),
                    raw_response=raw,
                )
                document.status = Document.Status.DONE
                document.save(update_fields=['status'])
        
        except Exception as e:
            logger.exception("Failed to save analysis results to database for doc_id=%s", document.id)
            document.status = Document.Status.FAILED
            document.save(update_fields=['status'])
            return Response({'error': 'Failed to save document analysis.'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(DocumentSerializer(document).data, status=status.HTTP_201_CREATED)
