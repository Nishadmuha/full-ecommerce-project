// frontend/src/pages/Privacy.jsx
import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#f7f6fb] pb-16">
      <div className="mx-auto max-w-4xl px-4 pt-12 md:px-6 lg:px-0">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl text-charcoal">Privacy Policy</h1>
        </header>

        <div className="rounded-[32px] bg-white p-8 shadow-sm lg:p-12">
          <div className="prose prose-sm max-w-none space-y-6 text-gray-600">
            <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Introduction</h2>
              <p>
                At 6XO BAGS, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and make purchases.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Information We Collect</h2>
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, phone number, and shipping address</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Account credentials and preferences</li>
                <li>Communications with our customer service team</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Send you order confirmations and shipping updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate or incomplete data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@6xobags.com" className="text-[#ff0000] hover:underline">
                  privacy@6xobags.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}




