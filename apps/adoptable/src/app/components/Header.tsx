import { Search, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="w-8 h-8 bg-[#FFD700] rounded-lg flex items-center justify-center mr-2">
              <span className="text-[#333333] text-lg font-bold">YB</span>
            </div>
            <span className="text-xl font-bold text-[#333333]">Шар ном</span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search companies..."
                className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-[#FFD700] focus:border-[#FFD700]"
              />
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition-colors hover:text-[#FFD700] ${
                currentPage === 'home' ? 'text-[#FFD700]' : 'text-[#333333]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('companies')}
              className={`text-sm font-medium transition-colors hover:text-[#FFD700] ${
                currentPage === 'companies' ? 'text-[#FFD700]' : 'text-[#333333]'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`text-sm font-medium transition-colors hover:text-[#FFD700] ${
                currentPage === 'about' ? 'text-[#FFD700]' : 'text-[#333333]'
              }`}
            >
              About
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`text-sm font-medium transition-colors hover:text-[#FFD700] ${
                currentPage === 'contact' ? 'text-[#FFD700]' : 'text-[#333333]'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}