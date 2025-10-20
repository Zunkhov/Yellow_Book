import { ArrowLeft, MapPin, Phone, Mail, Globe, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Company } from '../types/company';
import { ImageWithFallback } from './figma/ImageWithFallBack';

interface CompanyDetailsProps {
  company: Company;
  onBack: () => void;
}

export function CompanyDetails({ company, onBack }: CompanyDetailsProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 hover:bg-[#FFD700]/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Button>

          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <ImageWithFallback
                src={company.logo}
                alt={`${company.name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#333333] mb-2">
                {company.name}
              </h1>
              <p className="text-gray-600 text-lg mb-3">
                {company.description}
              </p>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-[#FFD700]/20 text-[#333333]">
                  {company.category}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  Founded {company.founded}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#333333]">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {company.history}
                </p>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#333333]">Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {company.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-[#FFD700] rounded-full mr-3"></div>
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Image Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#333333]">Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {company.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-video rounded-lg overflow-hidden bg-gray-100"
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`${company.name} image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#333333]">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#333333]">Address</p>
                    <p className="text-gray-600 text-sm">{company.contact.address}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#333333]">Phone</p>
                    <a
                      href={`tel:${company.contact.phone}`}
                      className="text-gray-600 text-sm hover:text-[#FFD700]"
                    >
                      {company.contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#333333]">Email</p>
                    <a
                      href={`mailto:${company.contact.email}`}
                      className="text-gray-600 text-sm hover:text-[#FFD700]"
                    >
                      {company.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#333333]">Website</p>
                    <a
                      href={company.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 text-sm hover:text-[#FFD700]"
                    >
                      {company.contact.website}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#333333]">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Interactive Map</p>
                    <p className="text-xs">Click to view location</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}