// frontend/src/components/CTA.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section className="rounded-[32px] bg-[#f2f0ed] p-3">
      <div className="flex flex-col gap-8 rounded-[28px] bg-white p-8 shadow-card md:flex-row md:p-12">
        <div className="flex-1 space-y-4">
          <h3 className="font-display text-3xl leading-snug text-charcoal">
            Take 15% off your first bespoke carry-all
          </h3>
          <p className="text-gray-500">
            Your welcome set includes a leather care kit, complimentary monogramming, and early previews of atelier-only
            releases.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="rounded-full bg-charcoal px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white"
            >
              Claim offer
            </Link>
            <Link to="/products" className="text-sm font-semibold text-clay">
              Discover more →
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <div className="overflow-hidden rounded-[24px] border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80&auto=format&fit=crop"
              alt="Gift packaging"
              className="h-64 w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
