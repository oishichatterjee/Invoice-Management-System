import React, { useState, useEffect } from 'react';
import CreateInvoice from './components/CreateInvoice';
import EditInvoice from './components/EditInvoice';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date'); // Default sort by date
  const [filterOption, setFilterOption] = useState('all');
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 10,
    total: 0,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch invoices with filters and sorting
  const fetchInvoices = () => {
    setLoading(true);
    fetch(
      `http://127.0.0.1:8000/invoices/?offset=${pagination.offset}&limit=${pagination.limit}&search=${searchQuery}&sort=${sortOption}&filter=${filterOption}`
    )
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch invoices');
        return response.json();
      })
      .then((data) => {
        setInvoices(data.results || []);
        setPagination((prev) => ({ ...prev, total: data.count }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, [pagination.offset, pagination.limit, searchQuery, sortOption, filterOption]);

  // Handle invoice creation
  const handleInvoiceCreated = (newInvoice) => {
    setInvoices([newInvoice, ...invoices]);
  };

  // Handle editing
  const handleInvoiceUpdated = (updatedInvoice) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
      )
    );
    setEditingInvoiceId(null);
  };

  // Search input handler
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Sort option handler
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Filter option handler
  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-500 text-white p-4">
        <h1 className="text-2xl">Invoice Management</h1>
      </header>
      <main className="p-4">
        <CreateInvoice onInvoiceCreated={handleInvoiceCreated} />

        {editingInvoiceId && (
          <EditInvoice
            invoiceId={editingInvoiceId}
            onClose={() => setEditingInvoiceId(null)}
            onInvoiceUpdated={handleInvoiceUpdated}
          />
        )}

        <div className="flex flex-wrap gap-4 mb-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={handleSearch}
            className="border p-2 rounded"
          />

          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="border p-2 rounded"
          >
            <option value="date">Sort by Date</option>
            <option value="total_amount">Sort by Total Amount</option>
          </select>

          {/* Filter Dropdown */}
          <select
            value={filterOption}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          >
            <option value="all">All Invoices</option>
            <option value="paid">Paid Invoices</option>
            <option value="unpaid">Unpaid Invoices</option>
          </select>
        </div>

        {/* Loading and error handling */}
        {error && <p className="text-red-500">{error}</p>}
        {loading ? (
          <p>Loading invoices...</p>
        ) : (
          <>
            <ul className="space-y-4">
              {invoices.map((invoice) => (
                <li
                  key={invoice.id}
                  className="bg-white p-4 border rounded shadow-md hover:shadow-lg transition hover:bg-blue-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{invoice.invoice_number}</h3>
                      <p className="text-sm text-gray-700">
                        Customer: {invoice.customer_name}
                      </p>
                      <p className="text-sm text-gray-500">Date: {invoice.date}</p>
                      <p className="text-green-600 font-semibold">
                        Total Amount: $
                        {invoice.total_amount
                          ? parseFloat(invoice.total_amount).toFixed(2)
                          : 'Calculating...'}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingInvoiceId(invoice.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination Controls */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    offset: Math.max(prev.offset - prev.limit, 0),
                  }))
                }
                disabled={pagination.offset === 0}
                className="bg-gray-500 text-white px-4 py-2"
              >
                Previous
              </button>
              <span>
                Page {Math.floor(pagination.offset / pagination.limit) + 1} of{' '}
                {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    offset: prev.offset + prev.limit,
                  }))
                }
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="bg-gray-500 text-white px-4 py-2"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
