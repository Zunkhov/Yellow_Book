import { Company, Category } from '../types/company';

export const categories: Category[] = [
  {
    id: '1',
    name: 'IT Companies',
    icon: 'Monitor',
    image: 'https://images.unsplash.com/photo-1662052955098-042b46e60c2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwY29tcGFueSUyMGxvZ298ZW58MXx8fHwxNzU5ODM2NDc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'bg-blue-100'
  },
  {
    id: '2',
    name: 'Banks',
    icon: 'Building2',
    image: 'https://images.unsplash.com/photo-1643258367012-1e1a983489e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5rJTIwZmluYW5jaWFsJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzU5ODYwMTk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'bg-green-100'
  },
  {
    id: '3',
    name: 'Restaurants',
    icon: 'UtensilsCrossed',
    image: 'https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwYnVzaW5lc3N8ZW58MXx8fHwxNzU5OTAyOTY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'bg-orange-100'
  },
  {
    id: '4',
    name: 'Education',
    icon: 'GraduationCap',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300',
    color: 'bg-purple-100'
  },
  {
    id: '5',
    name: 'Health',
    icon: 'Heart',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300',
    color: 'bg-red-100'
  },
  {
    id: '6',
    name: 'Real Estate',
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300',
    color: 'bg-yellow-100'
  }
];

export const companies: Company[] = [
  {
    id: '1',
    name: 'TechFlow Solutions',
    description: 'Leading software development company specializing in enterprise solutions and cloud computing.',
    category: 'IT Companies',
    logo: 'https://images.unsplash.com/photo-1662052955098-042b46e60c2b?w=100&h=100&fit=crop',
    founded: 2015,
    history: 'Founded in 2015, TechFlow Solutions has grown from a small startup to a leading technology company. We specialize in creating innovative software solutions that help businesses transform their operations and achieve their goals.',
    services: ['Web Development', 'Mobile Apps', 'Cloud Computing', 'AI Solutions', 'Data Analytics'],
    contact: {
      address: '123 Tech Street, Silicon Valley, CA 94102',
      phone: '+1 (555) 123-4567',
      email: 'contact@techflow.com',
      website: 'https://techflow.com'
    },
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'
    ]
  },
  {
    id: '2',
    name: 'Golden Gate Bank',
    description: 'Your trusted financial partner offering comprehensive banking and investment services.',
    category: 'Banks',
    logo: 'https://images.unsplash.com/photo-1643258367012-1e1a983489e5?w=100&h=100&fit=crop',
    founded: 1995,
    history: 'Golden Gate Bank has been serving the community for over 25 years. We pride ourselves on providing personalized banking services and building long-term relationships with our customers.',
    services: ['Personal Banking', 'Business Banking', 'Loans & Mortgages', 'Investment Services', 'Online Banking'],
    contact: {
      address: '456 Financial Plaza, Downtown, CA 94105',
      phone: '+1 (555) 234-5678',
      email: 'info@goldengate.bank',
      website: 'https://goldengate.bank'
    },
    images: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=400',
      'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=400'
    ]
  },
  {
    id: '3',
    name: 'Bella Vista Restaurant',
    description: 'Fine dining experience with authentic Italian cuisine and exceptional service.',
    category: 'Restaurants',
    logo: 'https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?w=100&h=100&fit=crop',
    founded: 2010,
    history: 'Bella Vista Restaurant opened its doors in 2010 with a vision to bring authentic Italian flavors to the city. Our chefs use traditional recipes passed down through generations, combined with the freshest local ingredients.',
    services: ['Fine Dining', 'Catering', 'Private Events', 'Wine Selection', 'Takeout'],
    contact: {
      address: '789 Culinary Lane, Food District, CA 94107',
      phone: '+1 (555) 345-6789',
      email: 'reservations@bellavista.com',
      website: 'https://bellavista.com'
    },
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400'
    ]
  },
  {
    id: '4',
    name: 'Prime Academy',
    description: 'Excellence in education with innovative learning approaches and experienced faculty.',
    category: 'Education',
    logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=100&h=100&fit=crop',
    founded: 2005,
    history: 'Prime Academy was established in 2005 with a mission to provide world-class education. We focus on developing critical thinking, creativity, and leadership skills in our students.',
    services: ['K-12 Education', 'Advanced Placement', 'STEM Programs', 'Arts & Culture', 'Sports Programs'],
    contact: {
      address: '321 Education Blvd, Academic District, CA 94110',
      phone: '+1 (555) 456-7890',
      email: 'admissions@primeacademy.edu',
      website: 'https://primeacademy.edu'
    },
    images: [
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400',
      'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400',
      'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400'
    ]
  }
];