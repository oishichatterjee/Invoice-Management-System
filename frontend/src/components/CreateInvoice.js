// CreateInvoice.js
import React, { useState } from 'react';

function CreateInvoice({ onInvoiceCreated }) {
  const [formData, setFormData] = useState({
    invoice_number: '',
    customer_name: '',
    date: '',
    details: [
      { description: '', quantity: 1, unit_price: 0.00, line_total: 0.00 },
    ],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDetailChange = (index, event) => {
    const { name, value } = event.target;
    const updatedDetails = [...formData.details];
    updatedDetails[index][name] = value;
    if (name === 'quantity' || name === 'unit_price') {
      updatedDetails[index].line_total = updatedDetails[index].quantity * updatedDetails[index].unit_price;
    }
    setFormData({ ...formData, details: updatedDetails });
  };

  const handleAddDetail = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { description: '', quantity: 1, unit_price: 0.00, line_total: 0.00 }],
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

    fetch('http://127.0.0.1:8000/invoices/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to create invoice');
        }
        return response.json();
      })
      .then((data) => {
        onInvoiceCreated(data); // Notify parent about the new invoice
      })
      .catch((error) => {
        console.error('Error creating invoice:', error);
        alert('Error creating invoice. Please check your inputs.');
      });
  };

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
              <label>Line Total: ${detail.line_total.toFixed(2)}</label>
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
        Create Invoice
      </button>
    </form>
  );
}

export default CreateInvoice;
