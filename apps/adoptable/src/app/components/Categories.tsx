import { Monitor, Building2, UtensilsCrossed, GraduationCap, Heart, Home } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { categories } from '../data/mockData';

const iconMap = {
  Monitor,
  Building2,
  UtensilsCrossed,
  GraduationCap,
  Heart,
  Home
};

interface CategoriesProps {
  onCategoryClick: (category: string) => void;
}

export function Categories({ onCategoryClick }: CategoriesProps) {
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
            const IconComponent = iconMap[category.icon as keyof typeof iconMap];
            
            return (
              <Card
                key={category.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105"
                onClick={() => onCategoryClick(category.name)}
              >
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
                        Explore {category.name.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}