from rest_framework import serializers
from .models import Invoice, InvoiceDetail
from rest_framework.exceptions import ValidationError

class InvoiceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceDetail
        fields = ['id', 'description', 'quantity', 'unit_price', 'line_total']
        read_only_fields = ['line_total']

class InvoiceSerializer(serializers.ModelSerializer):
    details = InvoiceDetailSerializer(many=True)
    total_amount = serializers.SerializerMethodField()  # Add this field to serialize total_amount

    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'customer_name', 'date', 'details', 'total_amount']

    def get_total_amount(self, obj):
        """Calculate and return the total amount for the invoice."""
        return obj.total_amount  # This uses the @property defined in the Invoice model

    def validate_invoice_number(self, value):
        request = self.context.get('request')
        instance = getattr(self, 'instance', None)
        if instance is not None and instance.invoice_number == value:
            # If the invoice_number hasn't changed, allow it
            return value

        if Invoice.objects.filter(invoice_number=value).exists():
            raise serializers.ValidationError("Invoice number must be unique.")
        return value

    def validate(self, data):
        if not data.get('details'):
            raise ValidationError("At least one detail is required for an invoice.")
        return data

    def create(self, validated_data):
        details_data = validated_data.pop('details')
        invoice = Invoice.objects.create(**validated_data)
        for detail_data in details_data:
            InvoiceDetail.objects.create(invoice=invoice, **detail_data)
        return invoice

    def update(self, instance, validated_data):
        details_data = validated_data.pop('details')
        instance.invoice_number = validated_data.get('invoice_number', instance.invoice_number)
        instance.customer_name = validated_data.get('customer_name', instance.customer_name)
        instance.date = validated_data.get('date', instance.date)
        instance.save()

        # Update or create invoice details
        for detail_data in details_data:
            detail_id = detail_data.get('id')
            if detail_id:
                detail = InvoiceDetail.objects.get(id=detail_id, invoice=instance)
                detail.description = detail_data.get('description', detail.description)
                detail.quantity = detail_data.get('quantity', detail.quantity)
                detail.unit_price = detail_data.get('unit_price', detail.unit_price)
                detail.save()
            else:
                InvoiceDetail.objects.create(invoice=instance, **detail_data)

        return instance
