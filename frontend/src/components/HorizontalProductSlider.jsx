import { motion } from 'framer-motion';
import { useRef } from 'react';
import ProductCard from './ProductCard';

export default function HorizontalProductSlider({ products = [], title }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const scrollTo = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: scrollTo,
      behavior: 'smooth',
    });
  };

  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Products are on their way.</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Navigation Buttons */}
      <motion.button
        onClick={() => scroll('left')}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4 hidden lg:flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-soft-lg border border-gray-200 hover:bg-gray-50 hover:shadow-card transition-all"
        aria-label="Scroll left"
      >
        <svg className="h-6 w-6 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>
      
      <motion.button
        onClick={() => scroll('right')}
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 hidden lg:flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-soft-lg border border-gray-200 hover:bg-gray-50 hover:shadow-card transition-all"
        aria-label="Scroll right"
      >
        <svg className="h-6 w-6 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 -mx-4 px-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex-shrink-0 snap-start w-[280px] sm:w-[320px] lg:w-[350px]"
          >
            <ProductCard product={product} index={index} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
