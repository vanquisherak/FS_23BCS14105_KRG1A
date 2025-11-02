import { useEffect, useState } from 'react';
import api from '../api';
import AdvancedSearch from '../components/AdvancedSearch';
import BookCard from '../components/BookCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function BooksList() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    q: '',
    author: '',
    tag: '',
    minRating: '',
    maxRating: '',
    sort: 'newest'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { 
    load(); 
  }, [page, filters]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit, ...filters };
      
      // Clean up empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const res = await api.get('/books', { params });
      setBooks(res.data.books);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { 
      setLoading(false); 
    }
  }

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    const resetFilters = {
      q: '',
      author: '',
      tag: '',
      minRating: '',
      maxRating: '',
      sort: 'newest'
    };
    setFilters(resetFilters);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Discover Books</h1>
        <p className="mt-2 text-gray-600">
          Explore our collection of {total.toLocaleString()} books and find your next great read
        </p>
      </div>

      {/* Advanced Search */}
      <AdvancedSearch onSearch={handleSearch} onReset={handleReset} />

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading books...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} of {total} results
            </p>
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
          </div>

          {/* Books Grid */}
          {books.length > 0 ? (
            <div className="grid gap-6">
              {books.map(book => (
                <BookCard 
                  key={book._id} 
                  book={book} 
                  onUpdate={load}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or browse all books
              </p>
              <button onClick={handleReset} className="btn-primary">
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
