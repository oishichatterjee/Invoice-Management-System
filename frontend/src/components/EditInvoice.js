// EditInvoice.js
import React, { useState, useEffect } from 'react';

function EditInvoice({ invoiceId, onInvoiceUpdated }) {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the existing invoice data to prefill the form
    fetch(`http://127.0.0.1:8000/invoices/${invoiceId}/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }
        return response.json();
      })
      .then((data) => setFormData(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDetailChange = (index, event) => {
    const { name, value } = event.target;
    const updatedDetails = [...formData.details];
    updatedDetails[index][name] = value;
    if (name === 'quantity' || name === 'unit_price') {
      updatedDetails[index].line_total =
        updatedDetails[index].quantity * updatedDetails[index].unit_price;
    }
    setFormData({ ...formData, details: updatedDetails });
  };

  const handleAddDetail = () => {
    setFormData({
      ...formData,
      details: [
        ...formData.details,
        { description: '', quantity: 1, unit_price: 0.0, line_total: 0.0 },
      ],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSend = {
      invoice_number: formData.invoice_number,
      customer_name: formData.customer_name,
      date: formData.date,
      details: formData.details.map(({ description, quantity, unit_price }) => ({
        description,
        quantity: Number(quantity),
        unit_price: Number(unit_price),
      })),
    };

    fetch(`http://127.0.0.1:8000/invoices/${invoiceId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update invoice');
        }
        return response.json();
      })
      .then((data) => {
        onInvoiceUpdated(data); // Notify parent about the updated invoice
        alert('Invoice updated successfully!');
      })
      .catch((error) => {
        console.error('Error updating invoice:', error);
        alert('Error updating invoice. Please check your inputs.');
      });
  };

  if (loading) return <p>Loading invoice...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Invoice Number:</label>
        <input
          type="text"
          name="invoice_number"
          value={formData.invoice_number}
          onChange={handleInputChange}
          required
          className="border p-2"
        />
      </div>
      <div>
        <label>Customer Name:</label>
        <input
          type="text"
          name="customer_name"
          value={formData.customer_name}
          onChange={handleInputChange}
          required
          className="border p-2"
        />
      </div>
      <div>
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
          className="border p-2"
        />
      </div>
      <div>
        <label>Invoice Details:</label>
        {formData.details.map((detail, index) => (
          <div key={index} className="space-y-2">
            <div>
              <label>Description:</label>
              <input
                type="text"
                name="description"
                value={detail.description}
                onChange={(e) => handleDetailChange(index, e)}
                required
                className="border p-2"
              />
            </div>
            <div>
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={detail.quantity}
                onChange={(e) => handleDetailChange(index, e)}
                min="1"
                required
                className="border p-2"
              />
            </div>
            <div>
              <label>Unit Price:</label>
              <input
                type="number"
                name="unit_price"
                value={detail.unit_price}
                onChange={(e) => handleDetailChange(index, e)}
                step="0.01"
                min="0.01"
                required
                className="border p-2"
              />
            </div>
            <div>
              <label>Line Total: ${(Number(detail.line_total) || 0).toFixed(2)}</label>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddDetail}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Add Line Item
        </button>
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Update Invoice
      </button>
    </form>
  );
}

export default EditInvoice;
