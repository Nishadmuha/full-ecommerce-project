import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Hero({ banner }) {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const activeBanner = banner && banner.images && banner.images.length === 3 ? banner : null;
  const bannerImages = activeBanner?.images?.map(img => typeof img === 'string' ? img.trim() : img).filter(img => img) || [];

  useEffect(() => {
    if (bannerImages.length <= 1) return;

    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length);
      }, 4000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [bannerImages.length, isPaused]);

  const handleBannerClick = () => {
    const bestsellerSection = document.getElementById('bestsellers');
    if (bestsellerSection) {
      bestsellerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/#bestsellers');
    }
  };

  if (bannerImages.length === 0) return null;

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden">
      <div
        className="relative w-full h-full cursor-pointer"
        onClick={handleBannerClick}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          {bannerImages.map((imageUrl, index) => (
            index === currentImageIndex && (
              <motion.div
                key={`${imageUrl}-${index}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <motion.img
                  src={imageUrl}
                  alt={`${activeBanner?.title || 'Banner'} - ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Content */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-center px-4 md:px-8 max-w-5xl mx-auto"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6 leading-tight"
            >
              {activeBanner?.title && (
                <>
                  <span className="block">{activeBanner.title}</span>
                  {activeBanner.highlight && (
                    <motion.span
                      className="text-primary-400 block"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    >
                      {activeBanner.highlight}
                    </motion.span>
                  )}
                </>
              )}
              {activeBanner?.title2 && (
                <>
                  <span className="block mt-2">{activeBanner.title2}</span>
                  {activeBanner.highlight2 && (
                    <motion.span
                      className="text-primary-400 block"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    >
                      {activeBanner.highlight2}
                    </motion.span>
                  )}
                </>
              )}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
            >
              {activeBanner?.description}
            </motion.p>
            <motion.div variants={itemVariants}>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBannerClick();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white text-charcoal text-sm font-bold uppercase tracking-wider rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                Shop Our Collection
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Image Indicators */}
        {bannerImages.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {bannerImages.map((_, index) => (
              <motion.button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`h-2 rounded-full transition-all ${
                  index === currentImageIndex ? 'w-10 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
