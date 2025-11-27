import { YellowBookEntry } from '@adoptable/shared-contract';
import Link from 'next/link';
import { Monitor, Building2, UtensilsCrossed, GraduationCap, Heart, Home } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const iconMap = {
  Monitor,
  Building2,
  UtensilsCrossed,
  GraduationCap,
  Heart,
  Home
};

interface Category {
  name: string;
  icon: keyof typeof iconMap;
  color: string;
  count: number;
}

interface CategoriesServerProps {
  entries: YellowBookEntry[];
}

const MAIN_CATEGORIES: Omit<Category, 'count'>[] = [
  { name: 'IT Companies', icon: 'Monitor', color: 'bg-blue-100' },
  { name: 'Banks', icon: 'Building2', color: 'bg-green-100' },
  { name: 'Restaurants', icon: 'UtensilsCrossed', color: 'bg-orange-100' },
  { name: 'Education', icon: 'GraduationCap', color: 'bg-purple-100' },
  { name: 'Health', icon: 'Heart', color: 'bg-red-100' },
  { name: 'Real Estate', icon: 'Home', color: 'bg-yellow-100' }
];

const getCategoriesWithCount = (entries: YellowBookEntry[]): Category[] => {
  const categoryCountMap = new Map<string, number>();
  
  entries.forEach(entry => {
    entry.categories.forEach(cat => {
      const normalized = cat.toLowerCase();
      categoryCountMap.set(normalized, (categoryCountMap.get(normalized) || 0) + 1);
    });
  });

  return MAIN_CATEGORIES.map(category => {
    const categoryName = category.name.toLowerCase();
    let count = 0;
    
    categoryCountMap.forEach((value, key) => {
      if (key.includes(categoryName.split(' ')[0].toLowerCase()) || 
          categoryName.includes(key)) {
        count += value;
      }
    });

    return { ...category, count };
  });
};

export function CategoriesServer({ entries }: CategoriesServerProps) {
  const categories = getCategoriesWithCount(entries);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#333333] mb-4">
            Browse by Category
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore businesses and services organized by industry categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon];
            
            return (
              <Link
                key={category.name}
                href={`/yellow-books/search?category=${encodeURIComponent(category.name)}`}
              >
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6 text-[#333333]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#333333] group-hover:text-[#FFD700] transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {category.count} {category.count === 1 ? 'listing' : 'listings'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
