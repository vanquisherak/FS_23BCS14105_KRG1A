import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

export default function AdvancedSearch({ onSearch, onReset }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    author: '',
    tag: '',
    minRating: '',
    maxRating: '',
    sort: 'newest'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
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
    onReset();
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <form onSubmit={handleSubmit}>
        {/* Basic Search */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Books
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or description..."
                value={filters.q}
                onChange={(e) => updateFilter('q', e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn-secondary flex items-center gap-2"
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
            </button>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  placeholder="Author name..."
                  value={filters.author}
                  onChange={(e) => updateFilter('author', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag
                </label>
                <input
                  type="text"
                  placeholder="Tag..."
                  value={filters.tag}
                  onChange={(e) => updateFilter('tag', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating Range
                </label>
                <div className="flex gap-2">
                  <select
                    value={filters.minRating}
                    onChange={(e) => updateFilter('minRating', e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="">Min</option>
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}+</option>
                    ))}
                  </select>
                  <select
                    value={filters.maxRating}
                    onChange={(e) => updateFilter('maxRating', e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="">Max</option>
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="input-field"
                >
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="title">Title A-Z</option>
                  <option value="author">Author A-Z</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary flex items-center gap-2"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export function RatingStars({ rating, size = 'sm' }) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">
        {rating ? rating.toFixed(1) : '—'}
      </span>
    </div>
  );
}
