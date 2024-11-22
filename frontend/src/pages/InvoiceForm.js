import React, { useState } from 'react';
import axios from 'axios';

export default function InvoiceForm() {
  const [formData, setFormData] = useState({
    invoice_number: '',
    customer_name: '',
    date: '',
    details: [{ description: '', quantity: '', unit_price: '' }],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDetails = [...formData.details];
    updatedDetails[index][name] = value;
    setFormData({ ...formData, details: updatedDetails });
  };

  const addDetail = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { description: '', quantity: '', unit_price: '' }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/invoices/', formData);
      alert('Invoice created successfully!');
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-xl font-semibold mb-4">Create Invoice</h2>
      <input
        type="text"
        name="invoice_number"
        value={formData.invoice_number}
        onChange={handleInputChange}
        placeholder="Invoice Number"
        className="w-full mb-2 p-2 border"
        required
      />
      <input
        type="text"
        name="customer_name"
        value={formData.customer_name}
        onChange={handleInputChange}
        placeholder="Customer Name"
        className="w-full mb-2 p-2 border"
        required
      />
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleInputChange}
        className="w-full mb-2 p-2 border"
        required
      />
      <h3 className="text-lg font-semibold mb-2">Details</h3>
      {formData.details.map((detail, index) => (
        <div key={index} className="mb-2">
          <input
            type="text"
            name="description"
            value={detail.description}
            onChange={(e) => handleDetailChange(index, e)}
            placeholder="Description"
            className="w-full mb-2 p-2 border"
            required
          />
          <input
            type="number"
            name="quantity"
            value={detail.quantity}
            onChange={(e) => handleDetailChange(index, e)}
            placeholder="Quantity"
            className="w-full mb-2 p-2 border"
            required
          />
          <input
            type="number"
            name="unit_price"
            value={detail.unit_price}
            onChange={(e) => handleDetailChange(index, e)}
            placeholder="Unit Price"
            className="w-full mb-2 p-2 border"
            required
          />
        </div>
      ))}
      <button type="button" onClick={addDetail} className="bg-blue-600 text-white p-2 rounded">
        Add Line Item
      </button>
      <button type="submit" className="bg-green-600 text-white p-2 rounded mt-4">
        Submit
      </button>
    </form>
  );
}
