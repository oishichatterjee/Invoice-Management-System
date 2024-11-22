import React, { useState, useEffect } from 'react';
import EditInvoice from './EditInvoice'; // Import EditInvoice

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  const handleInvoiceUpdated = (updatedInvoice) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
      )
    );
    setEditingInvoiceId(null); // Close the edit form
  };

  return (
    <div>
      {editingInvoiceId && (
        <EditInvoice
          invoiceId={editingInvoiceId}
          onClose={() => setEditingInvoiceId(null)}
          onInvoiceUpdated={handleInvoiceUpdated}
        />
      )}
      {/* Existing invoice list rendering */}
      {invoices.map((invoice) => (
        <button
          onClick={() => setEditingInvoiceId(invoice.id)}
          className="text-blue-500 underline"
        >
          Edit
        </button>
      ))}
    </div>
  );
}
