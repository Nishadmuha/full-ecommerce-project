// frontend/src/components/GiftingBanner.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function GiftingBanner() {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            The Art of <span className="text-[#FF4D4D] italic">Gifting</span>
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
            Discover our exquisite craftsmanship of genuine leathers, meticulously designed, perfectly handcrafted.
          </p>
          <Link
            to="/products?category=gifts"
            className="inline-block px-8 py-4 bg-black text-white text-sm font-semibold uppercase tracking-wide hover:bg-gray-900 transition-colors"
          >
            Shop Gift Guide
          </Link>
        </div>
      </div>
    </section>
  );
}




