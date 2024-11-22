from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from invoices.models import Invoice, InvoiceDetail



class InvoiceAPITestCase(APITestCase):
    def setUp(self):
        self.invoice_data = {
            "invoice_number": "INV001",
            "customer_name": "John Doe",
            "date": "2024-11-12",
            "details": [
                {"description": "Product A", "quantity": 2, "unit_price": 50.00},
                {"description": "Product B", "quantity": 1, "unit_price": 75.00},
            ]
        }
        self.url = reverse('invoice-list')  # Automatically resolves the route

    def test_create_invoice(self):
        response = self.client.post(self.url, self.invoice_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Invoice.objects.count(), 1)
        self.assertEqual(InvoiceDetail.objects.count(), 2)

    def test_get_invoices(self):
        self.client.post(self.url, self.invoice_data, format='json')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)

    def test_update_invoice(self):
        create_response = self.client.post(self.url, self.invoice_data, format='json')
        invoice_id = create_response.data['id']
        update_data = {
            "invoice_number": "INV001",
            "customer_name": "Jane Smith",
            "date": "2024-11-15",
            "details": [
                {"description": "Product A Updated", "quantity": 3, "unit_price": 40.00},
            ]
        }
        response = self.client.put(f"{self.url}{invoice_id}/", update_data, format='json')
        
        if response.status_code != status.HTTP_200_OK:
            print("Response content:", response.content)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Invoice.objects.get(id=invoice_id).customer_name, "Jane Smith")

    def test_delete_invoice(self):
        create_response = self.client.post(self.url, self.invoice_data, format='json')
        invoice_id = create_response.data['id']
        response = self.client.delete(f"{self.url}{invoice_id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Invoice.objects.count(), 0)
