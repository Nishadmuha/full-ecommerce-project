// frontend/src/pages/RefundPolicy.jsx
import React from 'react';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="mx-auto max-w-4xl px-4 pt-12 md:px-6 lg:px-0">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl text-charcoal">Refund Policy</h1>
        </header>

        <div className="rounded-[32px] bg-white p-8 shadow-sm lg:p-12 border border-gray-100">
          <div className="prose prose-sm max-w-none space-y-6 text-gray-600">
            <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Overview</h2>
              <p>
                At 6XO BAGS, we want you to be completely satisfied with your purchase. If you are not satisfied with your order, we offer a comprehensive refund policy to ensure your peace of mind.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Eligibility for Refunds</h2>
              <p>You may request a refund within 30 days of receiving your order, provided that:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>The item is unused, unworn, and in its original condition</li>
                <li>The item is in its original packaging with all tags attached</li>
                <li>The item has not been damaged, altered, or customized</li>
                <li>You have proof of purchase (order number or receipt)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Refund Process</h2>
              <p>To initiate a refund:</p>
              <ol className="list-decimal pl-6 space-y-2 mt-3">
                <li>Contact our customer service team at <a href="mailto:returns@6xobags.com" className="text-[#ff0000] hover:underline">returns@6xobags.com</a> or through your account dashboard</li>
                <li>Provide your order number and reason for return</li>
                <li>Receive a Return Authorization (RA) number</li>
                <li>Ship the item back to us using the provided return label</li>
                <li>Once we receive and inspect the item, we will process your refund</li>
              </ol>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Refund Timeline</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Processing Time:</strong> 5-7 business days after we receive your returned item</li>
                <li><strong>Refund Method:</strong> Refunds will be issued to the original payment method</li>
                <li><strong>Bank Processing:</strong> It may take 5-10 business days for the refund to appear in your account, depending on your bank or credit card company</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Non-Refundable Items</h2>
              <p>The following items are not eligible for refunds:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Items that have been used, worn, or damaged</li>
                <li>Items without original packaging or tags</li>
                <li>Customized or personalized items</li>
                <li>Items purchased during final sale or clearance events</li>
                <li>Gift cards</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Return Shipping</h2>
              <p>
                Return shipping costs are the responsibility of the customer unless the item is defective or we made an error in your order. We recommend using a trackable shipping service and retaining your shipping receipt until your refund is processed.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Exchanges</h2>
              <p>
                We currently do not offer direct exchanges. If you wish to exchange an item, please return the original item for a refund and place a new order for the desired item. This ensures you receive the correct item in a timely manner.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Defective or Damaged Items</h2>
              <p>
                If you receive a defective or damaged item, please contact us immediately at <a href="mailto:support@6xobags.com" className="text-[#ff0000] hover:underline">support@6xobags.com</a> with photos of the defect or damage. We will arrange for a free return and full refund or replacement at no additional cost to you.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">Contact Information</h2>
              <p>
                For questions about our refund policy or to initiate a return, please contact us at{' '}
                <a href="mailto:returns@6xobags.com" className="text-[#ff0000] hover:underline">
                  returns@6xobags.com
                </a>
                {' '}or call us at{' '}
                <a href="tel:+15551234567" className="text-[#ff0000] hover:underline">
                  +1 (555) 123-4567
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




