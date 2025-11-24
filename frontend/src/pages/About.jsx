// frontend/src/pages/About.jsx
import React from 'react';

export default function About() {
  const handleWhatsAppClick = () => {
    const phoneNumber = '919747333006'; // WhatsApp number without + or spaces
    const message = encodeURIComponent('Hello, I would like to know more about 6XO BAGS.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Content Section */}
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 lg:px-8">
        {/* About Us Heading */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            <span className="text-[#ff6600]">ABOUT</span>{' '}
            <span className="text-charcoal">US</span>
          </h1>
        </div>

        {/* Description */}
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-gray-700 text-base md:text-lg leading-relaxed text-center">
            6XO BAGS is dedicated to creating a distinctive brand of travel bags that are designed and crafted by our own hands. Since our inception in December 2024, we have focused on creating high-quality, durable bags that meet the needs of modern travelers. Each bag is carefully stitched with precision, ensuring both functionality and style. Our vision is to offer travelers the perfect companion for their adventures, combining innovative designs with premium craftsmanship.
          </p>
        </div>

        {/* Contact Details and WhatsApp Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto mt-16">
          {/* Contact Details */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-charcoal mb-6">Contact Details</h2>
            <div className="space-y-4">
              <div>
                <span className="text-gray-700">Email: </span>
                <a
                  href="mailto:6xobags@gmail.com"
                  className="text-green-600 hover:text-green-700 hover:underline"
                >
                  6xobags@gmail.com
                </a>
              </div>
              <div>
                <span className="text-gray-700">Phone: </span>
                <a
                  href="tel:+919747333006"
                  className="text-green-600 hover:text-green-700 hover:underline"
                >
                  +91 9747333006
                </a>
              </div>
              <div>
                <span className="text-gray-700">Address: </span>
                <span className="text-charcoal">
                  KR Tower, Near High School, Thrithala - 679534, Kerala, India
                </span>
              </div>
            </div>
          </div>

          {/* WhatsApp Section */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-charcoal mb-6">Contact Us on WhatsApp</h2>
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Message on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



