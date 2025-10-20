import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { companies } from '../data/mockData';
import { ImageWithFallback } from './figma/ImageWithFallBack';

interface FeaturedCompaniesProps {
  onCompanyClick: (companyId: string) => void;
}

export function FeaturedCompanies({ onCompanyClick }: FeaturedCompaniesProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#333333] mb-4">
            Featured Companies
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover top-rated businesses and organizations in our directory
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-105"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <ImageWithFallback
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[#333333] group-hover:text-[#FFD700] transition-colors truncate">
                      {company.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {company.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {company.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="text-xs text-gray-500">
                    Founded: {company.founded}
                  </div>
                  <div className="text-xs text-gray-500">
                    {company.contact.address}
                  </div>
                </div>

                <Button
                  onClick={() => onCompanyClick(company.id)}
                  className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#333333]"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}