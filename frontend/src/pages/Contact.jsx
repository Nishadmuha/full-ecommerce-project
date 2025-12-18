// frontend/src/pages/Contact.jsx
import React, { useState } from 'react';
import SuccessAlert from '../components/SuccessAlert';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [alert, setAlert] = useState({ isOpen: false, message: '', type: 'success' });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    setAlert({ isOpen: true, message: 'Thank you for your message! We will get back to you soon.', type: 'success' });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#f7f6fb] pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-12 md:px-6 lg:px-0">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl text-charcoal">Contact Us</h1>
        </header>

        <div className="grid gap-10 rounded-[32px] bg-white p-8 shadow-sm lg:grid-cols-[1fr_400px] lg:p-12">
          <div>
            <h2 className="font-display text-2xl text-charcoal mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <label className="block">
                <span className="text-sm font-semibold text-gray-900">Your Name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-900">Your Email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-900">Subject</span>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Inquiry about custom bags"
                  className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-900">Your Message</span>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  rows={6}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm resize-none"
                  required
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-full bg-charcoal px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-charcoal/90 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          <div className="space-y-10">
            <div>
              <h3 className="font-display text-xl text-charcoal mb-6">Our Details</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <span className="text-[#ff0000] text-lg">📞</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#ff0000] text-lg">✉</span>
                  <span>info@6xobags.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#ff0000] text-lg">📍</span>
                  <span>123 Luxury Lane, Fashion City, LC 90210</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-display text-xl text-charcoal mb-6">Connect With Us</h3>
              <div className="flex gap-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 hover:scale-110 transition-transform"
                  aria-label="Facebook"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="#ff0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 hover:scale-110 transition-transform"
                  aria-label="Instagram"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="#ff0000" strokeWidth="1.5" fill="none"/>
                    <circle cx="12" cy="12" r="4" stroke="#ff0000" strokeWidth="1.5" fill="none"/>
                    <circle cx="17.5" cy="6.5" r="1.5" stroke="#ff0000" strokeWidth="1.5" fill="none"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 hover:scale-110 transition-transform"
                  aria-label="Twitter"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" stroke="#ff0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Alert Notification */}
      <SuccessAlert
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}




