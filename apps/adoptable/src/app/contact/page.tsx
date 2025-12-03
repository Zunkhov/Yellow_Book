export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-[#333333] mb-8 text-center">
        Contact Us
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Get in Touch */}
        <div>
          <h2 className="text-2xl font-semibold text-[#333333] mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-600 mb-6">
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
          <div className="space-y-4">
            <div>
              <strong className="text-[#333333]">Address:</strong>
              <p className="text-gray-600">
                Peace Avenue 10<br />
                Ulaanbaatar, Mongolia
              </p>
            </div>
            <div>
              <strong className="text-[#333333]">Phone:</strong>
              <p className="text-gray-600">
                <a href="tel:+97611123456" className="text-[#FFD700] hover:underline">
                  +976-11-123456
                </a>
              </p>
            </div>
            <div>
              <strong className="text-[#333333]">Email:</strong>
              <p className="text-gray-600">
                <a href="mailto:info@yellowbook.mn" className="text-[#FFD700] hover:underline">
                  info@yellowbook.mn
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-[#333333] mb-4">
            Business Hours
          </h3>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Monday - Friday:</span>
              <span className="font-medium">9:00 AM - 6:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Saturday:</span>
              <span className="font-medium">10:00 AM - 4:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Sunday:</span>
              <span className="font-medium text-red-600">Closed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section (Optional) */}
      <div className="mt-12 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-[#333333] mb-6 text-center">
          Send us a Message
        </h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#FFD700] focus:border-[#FFD700]"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#FFD700] focus:border-[#FFD700]"
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#FFD700] focus:border-[#FFD700]"
              placeholder="What is this about?"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#FFD700] focus:border-[#FFD700]"
              placeholder="Your message..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#333333] font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Contact Us | Yellow Book',
  description: 'Get in touch with Yellow Book Mongolia. Address, phone, email, and business hours.',
};