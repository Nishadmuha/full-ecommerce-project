// frontend/src/pages/FAQ.jsx
import React, { useState } from 'react';

const faqData = [
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy on all items. Items must be in original condition with tags attached. Please contact us for return authorization.'
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping typically takes 5-7 business days. Express shipping (2-3 business days) is available at checkout for an additional fee.'
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. Please check at checkout for your specific country.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All payments are processed securely.'
  },
  {
    question: 'How do I track my order?',
    answer: 'Once your order ships, you will receive a tracking number via email. You can use this number to track your package on our website or the carrier\'s website.'
  },
  {
    question: 'Can I modify or cancel my order?',
    answer: 'Orders can be modified or cancelled within 24 hours of placement. After that, please contact our customer service team for assistance.'
  },
  {
    question: 'Do you offer gift wrapping?',
    answer: 'Yes, we offer complimentary gift wrapping for all orders. You can add this option at checkout and include a personalized message.'
  },
  {
    question: 'What if my item arrives damaged?',
    answer: 'If your item arrives damaged, please contact us immediately with photos. We will arrange for a replacement or full refund at no cost to you.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#f7f6fb] pb-16">
      <div className="mx-auto max-w-4xl px-4 pt-12 md:px-6 lg:px-0">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600">Find answers to common questions about our products and services</p>
        </header>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="/contact"
            className="inline-block rounded-full bg-charcoal px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-gray-800 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}



