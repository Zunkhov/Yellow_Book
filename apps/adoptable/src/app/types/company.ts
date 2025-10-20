export interface Company {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  founded: number;
  history: string;
  services: string[];
  contact: {
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  images: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  color: string;
}