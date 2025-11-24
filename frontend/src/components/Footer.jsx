// frontend/src/components/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Shop', href: '/products' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Refund Policy', href: '/refund-policy' },
];

const socialLinks = [
  { 
    name: 'Facebook', 
    href: '#',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="#ff0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    )
  },
  { 
    name: 'Instagram', 
    href: '#',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="#ff0000" strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="12" r="4" stroke="#ff0000" strokeWidth="1.5" fill="none"/>
        <circle cx="17.5" cy="6.5" r="1.5" stroke="#ff0000" strokeWidth="1.5" fill="none"/>
      </svg>
    )
  },
  { 
    name: 'Twitter', 
    href: '#',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" stroke="#ff0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    )
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribe:', email);
    setEmail('');
  };

  const handleLinkClick = () => {
    // Scroll to top when footer link is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <p className="font-display text-2xl uppercase tracking-[0.4em] text-charcoal">
              <span>6</span>
              <span className="text-[#ff0000]">XO BAGS</span>
            </p>
            <p className="text-sm text-gray-600">
              Luxury, durability, and timeless style.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={handleLinkClick}
                    className="text-sm text-gray-600 hover:text-charcoal transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social Media */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-4">Connect With Us</h3>
            <div className="flex flex-wrap gap-4 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex items-center justify-center w-10 h-10 hover:scale-110 transition-transform"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-4">Newsletter</h3>
            <p className="text-sm text-gray-600 mb-4">
              Subscribe to get updates on new arrivals and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-charcoal text-white text-sm font-semibold uppercase tracking-wide rounded-md hover:bg-gray-800 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
        <div>
              <p className="font-semibold text-gray-900 mb-1">Address</p>
              <p>123 Broadway, New York, NY 10001</p>
        </div>
        <div>
              <p className="font-semibold text-gray-900 mb-1">Email</p>
              <a href="mailto:info@6xobags.com" className="hover:text-charcoal transition-colors">
                info@6xobags.com
              </a>
        </div>
        <div>
              <p className="font-semibold text-gray-900 mb-1">Phone</p>
              <a href="tel:+15551234567" className="hover:text-charcoal transition-colors">
                +1 (555) 123-4567
              </a>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} 6XO BAGS. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
