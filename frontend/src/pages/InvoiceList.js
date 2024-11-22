import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1); // Pagination state
  const [totalPages, setTotalPages] = useState(1); // Total number of pages for pagination

  // Fetch invoices based on the search query and current page
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get(`/invoices/?search=${searchQuery}&page=${page}`);
        setInvoices(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchInvoices();
  }, [searchQuery, page]);  // Re-fetch when search query or page changes

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // Update search query as the user types
  };

  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search invoices by customer, invoice number, etc."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Display the list of invoices */}
      <div className="invoice-list">
        <ul>
          {invoices.map((invoice) => (
            <li key={invoice.id}>
              <div>Invoice #: {invoice.invoice_number}</div>
              <div>Customer: {invoice.customer_name}</div>
              <div>Amount Due: {invoice.amount_due}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default InvoiceList;
