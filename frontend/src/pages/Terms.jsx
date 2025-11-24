// frontend/src/pages/Terms.jsx
import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#f7f6fb] pb-16">
      <div className="mx-auto max-w-4xl px-4 pt-12 md:px-6 lg:px-0">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl text-charcoal">Terms and Conditions</h1>
        </header>

        <div className="rounded-[32px] bg-white p-8 shadow-sm lg:p-12">
          <div className="prose prose-sm max-w-none space-y-6 text-gray-600">
            <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Agreement to Terms</h2>
              <p>
                By accessing and using the 6XO BAGS website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our website.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Products and Pricing</h2>
              <p>We reserve the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modify product descriptions, images, and prices at any time</li>
                <li>Limit quantities available for purchase</li>
                <li>Refuse or cancel orders that appear to be placed by dealers or resellers</li>
                <li>Correct pricing errors, even after an order has been placed</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Orders and Payment</h2>
              <p>
                All orders are subject to product availability and acceptance. We accept various payment methods as indicated on our checkout page. By placing an order, you agree to provide current, complete, and accurate purchase and account information.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Shipping and Returns</h2>
              <p>
                Shipping terms, delivery times, and return policies are detailed on our Shipping & Returns page. We are not responsible for delays caused by shipping carriers or customs.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, images, and software, is the property of 6XO BAGS and is protected by copyright and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, 6XO BAGS shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the website or products.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of the website after any changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Contact Information</h2>
              <p>
                For questions about these Terms and Conditions, please contact us at{' '}
                <a href="mailto:legal@6xobags.com" className="text-[#ff0000] hover:underline">
                  legal@6xobags.com
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




