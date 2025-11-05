'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Search, X, MapPin, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchFiltersProps {
  categories: string[];
  cities: string[];
  currentParams: {
    q?: string;
    category?: string;
    city?: string;
    sort?: string;
  };
}

export function SearchFilters({
  categories,
  cities,
  currentParams,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(currentParams.q || '');
  const [selectedCategory, setSelectedCategory] = useState(
    currentParams.category || ''
  );
  const [selectedCity, setSelectedCity] = useState(currentParams.city || '');
  const [sortBy, setSortBy] = useState(currentParams.sort || '');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl();
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const updateUrl = () => {
    const params = new URLSearchParams();

    if (query) params.set('q', query);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedCity) params.set('city', selectedCity);
    if (sortBy) params.set('sort', sortBy);

    const url = params.toString()
      ? `/yellow-books/search?${params.toString()}`
      : '/yellow-books/search';

    router.push(url);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat === selectedCategory ? '' : cat);
    setTimeout(updateUrl, 100);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city === selectedCity ? '' : city);
    setTimeout(updateUrl, 100);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setTimeout(updateUrl, 100);
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedCity('');
    setSortBy('');
    router.push('/yellow-books/search');
  };

  const hasActiveFilters =
    query || selectedCategory || selectedCity || sortBy;

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-[#FFD700]" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search companies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#FFD700]" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#FFD700] text-[#333333] font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Cities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FFD700]" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => handleCityChange(city)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCity === city
                  ? 'bg-[#FFD700] text-[#333333] font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {city}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Sort */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sort By</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {['name', 'city'].map((sort) => (
            <button
              key={sort}
              onClick={() => handleSortChange(sort)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
                sortBy === sort
                  ? 'bg-[#FFD700] text-[#333333] font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sort}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          onClick={clearFilters}
          variant="outline"
          className="w-full"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}