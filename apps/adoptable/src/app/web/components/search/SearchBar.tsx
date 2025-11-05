'use client';

import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      router.push(`/yellow-books/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/yellow-books/search');
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search companies, industries, or locations..."
          className="pl-12 pr-20 py-4 text-lg w-full border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-[#FFD700] bg-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button 
          type="submit"
          className="absolute right-2 top-2 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#333333] px-6 rounded-lg"
        >
          Search
        </Button>
      </div>
    </form>
  );
}