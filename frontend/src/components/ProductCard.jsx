import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const formatPrice = value => `₹${Number(value).toLocaleString('en-IN')}`;

export default function ProductCard({ product, index = 0 }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  const imageVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <motion.article
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-300"
    >
      {/* Image Container */}
      <Link to={`/products/${product._id}`} className="block relative overflow-hidden bg-gray-100 aspect-square">
        <motion.img
          src={product.image || product.images?.[0] || 'https://via.placeholder.com/600'}
          alt={product.title}
          variants={imageVariants}
          initial="rest"
          animate={isHovered ? 'hover' : 'rest'}
          className="w-full h-full object-cover"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:1000px_100%]" />
        )}

        {/* Badge */}
        {(product.isBestseller || product.isNew) && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-4 left-4 z-10"
          >
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
              product.isBestseller 
                ? 'bg-primary-500 text-white' 
                : 'bg-accent-500 text-white'
            }`}>
              {product.isBestseller ? 'Bestseller' : 'New'}
            </span>
          </motion.div>
        )}

        {/* Quick View Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <motion.span
            initial={{ y: 10, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            className="text-white font-semibold text-sm uppercase tracking-wide"
          >
            Quick View
          </motion.span>
        </motion.div>
      </Link>

      {/* Product Info */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-charcoal group-hover:text-primary-600 transition-colors line-clamp-2">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={`/products/${product._id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              View
              <motion.svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}
