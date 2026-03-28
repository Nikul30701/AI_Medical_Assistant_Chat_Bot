from rest_framework.pagination import PageNumberPagination, CursorPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    page_size = 10 #default items per page
    page_size_query_param = 'page_size'  #client can override
    max_page_size = 50
    page_query_param = 'page'
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total': self.page.paginator.num_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'result': data,
        })
    
    def get_paginated_response_schema(self, schema):
        return {
            'type': 'object',
            'properties': {
                'count': {'type': 'integer'},
                'total_pages': {'type': 'integer'},
                'next': {'type': 'string', 'nullable':True},
                'previous': {'type': 'string', 'nullable':True},
                'result': 'schema'
            }
        }
    

class ChatMessageCursorPagination(CursorPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    ordering = 'created_at'  # Oldest first within a page
    cursor_query_param = 'cursor'
    
    def get_paginated_response(self, data):
        return Response({
            'next': self.get_next_link(),  # Link to older messages
            'previous': self.get_previous_link(),  # Link to newer messages
            'results': data,
        })

