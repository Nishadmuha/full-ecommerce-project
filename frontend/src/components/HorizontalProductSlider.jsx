// frontend/src/components/HorizontalProductSlider.jsx
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

export default function HorizontalProductSlider({ products = [], title }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width
    const scrollTo = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: scrollTo,
      behavior: 'smooth',
    });
  };

  if (!products.length) {
    return <div className="text-gray-500 text-center">Products are on their way.</div>;
  }

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4 hidden lg:flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Scroll left"
      >
        <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 hidden lg:flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Scroll right"
      >
        <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {products.map((product) => (
          <div
            key={product._id}
            className="flex-shrink-0 snap-start w-[calc(66.666vw-1.25rem)] sm:w-[calc(50vw-1.25rem)] lg:w-[calc(25%-1rem)]"
          >
            <article className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <Link to={`/products/${product._id}`} className="block overflow-hidden bg-gray-100">
                <img
                  src={product.images?.[0] || product.image || 'https://via.placeholder.com/600'}
                  alt={product.title}
                  className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </Link>
              <div className="flex flex-col flex-1 p-4 text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{product.title}</h4>
                <span className="inline-block mb-2 text-xs font-semibold text-green-600">Free Delivery</span>
                <p className="text-xl font-semibold text-[#FF4D4D]">₹{product.price?.toLocaleString('en-IN') || product.price}</p>
              </div>
            </article>
          </div>
        ))}
      </div>

    </div>
  );
}

