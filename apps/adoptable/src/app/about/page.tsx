export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-[#333333] mb-8 text-center">
        About Yellow Book
      </h1>
      
      <div className="prose prose-lg mx-auto text-gray-600 space-y-6">
        <p>
          Yellow Book is your premier business directory, connecting communities with local 
          companies, services, and organizations. Since our founding, we&apos;ve been dedicated 
          to making it easy for people to discover and connect with businesses in their area.
        </p>
        
        <p>
          Our mission is to create a comprehensive, user-friendly platform that benefits 
          both consumers looking for services and businesses seeking to reach new customers. 
          We believe in the power of local commerce and the importance of strong community connections.
        </p>
        
        <p>
          Whether you're searching for a restaurant, need professional services, or looking 
          to promote your own business, Yellow Book is here to help you make those important connections.
        </p>

        <h2 className="text-2xl font-bold text-[#333333] mt-12 mb-4">Our Values</h2>
        
        <ul className="space-y-3 list-disc pl-6">
          <li>
            <strong>Community First:</strong> We prioritize building strong local connections 
            and supporting neighborhood businesses.
          </li>
          <li>
            <strong>Trust & Transparency:</strong> All listings are verified to ensure 
            accurate and reliable information.
          </li>
          <li>
            <strong>Easy Access:</strong> Our platform is designed to be intuitive and 
            accessible for everyone.
          </li>
          <li>
            <strong>Growth Together:</strong> We grow when our local businesses grow, 
            creating a thriving ecosystem.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-[#333333] mt-12 mb-4">Contact Us</h2>
        
        <p>
          Have questions or want to list your business?{' '}
          <a href="/contact" className="text-[#FFD700] hover:underline font-semibold">
            Get in touch
          </a>{' '}
          with our team today!
        </p>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'About Us | Yellow Book',
  description: 'Learn about Yellow Book - your premier business directory connecting communities with local companies and services.',
};