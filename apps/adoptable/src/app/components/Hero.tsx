import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function Hero() {
  return (
    <section 
      className="relative h-96 bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(51, 51, 51, 0.7), rgba(51, 51, 51, 0.7)), url('https://images.unsplash.com/photo-1759269105960-56813eda93ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidWlsZGluZ3MlMjBjaXR5c2NhcGV8ZW58MXx8fHwxNzU5OTAyOTYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
      }}
    >
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">
          Find the Right Business 
        </h1>
        <p className="text-white text-lg md:text-xl mb-8 opacity-90">
          Discover local companies, services, and organizations in your area
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search companies, industries, or locations..."
              className="pl-12 pr-20 py-4 text-lg w-full border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-[#FFD700] bg-white"
            />
            <Button 
              className="absolute right-2 top-2 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#333333] px-6 rounded-lg"
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}