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
    const newCategory = cat === selectedCategory ? '' : cat;
    setSelectedCategory(newCategory);
    
    // Шууд URL шинэчлэх
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (newCategory) params.set('category', newCategory);
    if (selectedCity) params.set('city', selectedCity);
    if (sortBy) params.set('sort', sortBy);
    
    const url = params.toString()
      ? `/yellow-books/search?${params.toString()}`
      : '/yellow-books/search';
    router.push(url);
  };

  const handleCityChange = (city: string) => {
    const newCity = city === selectedCity ? '' : city;
    setSelectedCity(newCity);
    
    // Шууд URL шинэчлэх
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory) params.set('category', selectedCategory);
    if (newCity) params.set('city', newCity);
    if (sortBy) params.set('sort', sortBy);
    
    const url = params.toString()
      ? `/yellow-books/search?${params.toString()}`
      : '/yellow-books/search';
    router.push(url);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    
    // Шууд URL шинэчлэх
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedCity) params.set('city', selectedCity);
    if (sort) params.set('sort', sort);
    
    const url = params.toString()
      ? `/yellow-books/search?${params.toString()}`
      : '/yellow-books/search';
    router.push(url);
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
      <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="bg-gradient-to-r from-[#FFD700]/10 to-transparent">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-[#FFD700]" />
            Хайх
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Компани хайх..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 border-2 focus:border-[#FFD700] transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="bg-gradient-to-r from-[#FFD700]/10 to-transparent">
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#FFD700]" />
            Категори
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-4 max-h-80 overflow-y-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all transform hover:scale-102 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white font-semibold shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Cities */}
      <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="bg-gradient-to-r from-[#FFD700]/10 to-transparent">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FFD700]" />
            Байршил
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-4 max-h-60 overflow-y-auto">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => handleCityChange(city)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all transform hover:scale-102 ${
                selectedCity === city
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white font-semibold shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {city}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Sort */}
      <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="bg-gradient-to-r from-[#FFD700]/10 to-transparent">
          <CardTitle className="text-lg">Эрэмбэлэх</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          {[
            { value: 'name', label: 'Нэрээр' },
            { value: 'city', label: 'Хотоор' }
          ].map((sort) => (
            <button
              key={sort.value}
              onClick={() => handleSortChange(sort.value)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all transform hover:scale-102 ${
                sortBy === sort.value
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white font-semibold shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {sort.label}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          onClick={clearFilters}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <X className="w-4 h-4 mr-2" />
          Бүх шүүлтийг арилгах
        </Button>
      )}
    </div>
  );
}
