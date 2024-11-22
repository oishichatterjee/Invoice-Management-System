from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import LimitOffsetPagination
from django.shortcuts import render

from .models import Invoice, InvoiceDetail
from .serializers import InvoiceSerializer
import django_filters

class InvoicePagination(LimitOffsetPagination):
    default_limit = 10
    max_limit = 50

# Filter class to add advanced filtering capabilities
class InvoiceFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Invoice.STATUS_CHOICES)  # Status filter
    invoice_number = django_filters.CharFilter(lookup_expr='icontains')  # Filter by invoice number (case-insensitive)
    customer_name = django_filters.CharFilter(lookup_expr='icontains')  # Filter by customer name (case-insensitive)
    date = django_filters.DateFromToRangeFilter()  # Filter by date range
    amount_due = django_filters.NumberFilter(lookup_expr='gte')  # Filter by amount due (greater than or equal to)
    
    class Meta:
        model = Invoice
        fields = ['invoice_number', 'customer_name', 'date', 'amount_due', 'status']


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [AllowAny]  # Adjust permission as per your requirements
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = InvoiceFilter  # Apply custom filter class
    search_fields = ['customer_name', 'invoice_number']  # Fields to search on
    ordering_fields = ['date', 'customer_name', 'invoice_number', 'amount_due']
    ordering = ['date']  # Default ordering by date

    pagination_class = InvoicePagination  # Pagination for the results

    def perform_create(self, serializer):
        # Handles invoice creation along with invoice details
        details_data = self.request.data.get('details', [])
        invoice = serializer.save()

        for detail_data in details_data:
            InvoiceDetail.objects.create(invoice=invoice, **detail_data)

    @action(detail=False, methods=['post'])
    def batch_delete(self, request):
        # Handles batch deletion of invoices
        ids = request.data.get('ids', [])
        if not ids:
            return Response({"error": "No IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        deleted, _ = Invoice.objects.filter(id__in=ids).delete()
        return Response({"message": f"{deleted} invoices deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

