import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// SVG Paths for three bag designs with mock images
const bagDesigns = [
  {
    id: 'carry-on',
    name: 'Carry-On',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop',
    paths: [
      { d: 'M 100 80 L 280 80 L 280 200 L 100 200 Z M 100 200 L 100 240 L 280 240 L 280 200', type: 'outline', delay: 0 },
      { d: 'M 120 80 Q 120 60 140 60 L 240 60 Q 260 60 260 80', type: 'detail', delay: 0.8 },
      { d: 'M 120 240 Q 120 260 140 260 L 240 260 Q 260 260 260 240', type: 'detail', delay: 1.2 },
    ],
    fillGradient: ['#8B4513', '#A0522D', '#CD853F'],
  },
  {
    id: 'duffel',
    name: 'Duffel Bag',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80&auto=format&fit=crop',
    paths: [
      { d: 'M 120 100 Q 100 100 100 140 L 100 200 Q 100 240 120 240 L 260 240 Q 280 240 280 200 L 280 140 Q 280 100 260 100 Z', type: 'outline', delay: 0 },
      { d: 'M 120 100 L 120 80 L 260 80 L 260 100', type: 'detail', delay: 0.8 },
      { d: 'M 180 100 L 180 240', type: 'detail', delay: 1.2, stroke: '#d4af37' },
      { d: 'M 200 100 L 200 240', type: 'detail', delay: 1.4, stroke: '#d4af37' },
    ],
    fillGradient: ['#2F4F4F', '#556B2F', '#6B8E23'],
  },
  {
    id: 'backpack',
    name: 'Backpack',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop',
    paths: [
      { d: 'M 140 120 L 240 120 L 260 160 L 260 220 L 240 240 L 140 240 L 120 220 L 120 160 Z', type: 'outline', delay: 0 },
      { d: 'M 140 120 Q 120 100 100 100 L 100 140 Q 120 140 140 160', type: 'detail', delay: 0.8 },
      { d: 'M 240 120 Q 260 100 280 100 L 280 140 Q 260 140 240 160', type: 'detail', delay: 1.0 },
      { d: 'M 160 180 L 220 180', type: 'detail', delay: 1.4 },
      { d: 'M 160 200 L 220 200', type: 'detail', delay: 1.6 },
    ],
    fillGradient: ['#1C1C1C', '#2F2F2F', '#4A4A4A'],
  },
];

const HeroBanner = () => {
  const navigate = useNavigate();
  const [currentBagIndex, setCurrentBagIndex] = useState(0);
  const [drawingPhase, setDrawingPhase] = useState('drawing'); // 'drawing' | 'filling' | 'complete'
  const [showFill, setShowFill] = useState(false);

  const currentBag = bagDesigns[currentBagIndex];

  // Animation sequence for each bag
  useEffect(() => {
    const sequence = async () => {
      // Reset
      setDrawingPhase('drawing');
      setShowFill(false);

      // Wait for drawing to complete (longest path delay + duration)
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Transition to filling
      setDrawingPhase('filling');
      setShowFill(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Complete
      setDrawingPhase('complete');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Move to next bag
      setCurrentBagIndex((prev) => (prev + 1) % bagDesigns.length);
    };

    sequence();
  }, [currentBagIndex]);

  const handleExploreClick = () => {
    navigate('/products');
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-sand via-fog to-white">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-50/30 to-transparent" />
      </div>

      {/* Physical Material Elements */}
      {/* Travel Bag Image 1 - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -100, rotate: -15 }}
        animate={{ opacity: 1, x: 0, rotate: -12 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute top-20 left-10 w-40 h-48 rounded-lg overflow-hidden shadow-2xl"
        whileHover={{ scale: 1.05, rotate: -10, z: 50 }}
      >
        <img
          src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80&auto=format&fit=crop"
          alt="Luxury Travel Bag"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </motion.div>

      {/* Travel Bag Image 2 - Bottom Left */}
      <motion.div
        initial={{ opacity: 0, x: -80, rotate: 10 }}
        animate={{ opacity: 1, x: 0, rotate: 8 }}
        transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
        className="absolute bottom-32 left-16 w-36 h-44 rounded-lg overflow-hidden shadow-2xl"
        whileHover={{ scale: 1.05, rotate: 12, z: 50 }}
      >
        <img
          src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80&auto=format&fit=crop"
          alt="Premium Carry-On"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent" />
      </motion.div>

      {/* Travel Bag Image 3 - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: -50, rotate: 5 }}
        animate={{ opacity: 1, y: 0, rotate: 3 }}
        transition={{ duration: 1.3, delay: 0.3, ease: 'easeOut' }}
        className="absolute top-1/4 right-20 w-36 h-44 rounded-lg overflow-hidden shadow-2xl"
        whileHover={{ scale: 1.1, rotate: 0, z: 50 }}
      >
        <img
          src="https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80&auto=format&fit=crop"
          alt="Designer Backpack"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
      </motion.div>

      {/* Metal Buckle */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5, type: 'spring', stiffness: 200 }}
        className="absolute top-1/3 right-32 w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 shadow-xl"
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
        }}
        whileHover={{ scale: 1.1, rotate: 180 }}
      >
        <div className="absolute inset-2 rounded-full border-2 border-gray-600" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-6 bg-gray-700 rounded" />
      </motion.div>

      {/* Travel Bag Image 4 - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.7, type: 'spring', stiffness: 200 }}
        className="absolute bottom-1/4 right-24 w-32 h-40 rounded-lg overflow-hidden shadow-2xl"
        whileHover={{ scale: 1.05, y: -5, z: 50 }}
      >
        <img
          src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80&auto=format&fit=crop"
          alt="Luxury Duffel"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </motion.div>

      {/* Main Content Container */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="max-w-6xl w-full">
          {/* Typography Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-charcoal mb-4 tracking-tight"
            >
              The Art of Travel
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-lg md:text-xl lg:text-2xl text-gray-600 font-light tracking-wide"
            >
              Crafted from Concept to Journey
            </motion.p>
          </motion.div>

          {/* Digital Tablet/Screen Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
            className="relative mx-auto w-full max-w-2xl"
          >
            {/* Tablet Frame */}
            <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl p-6 md:p-8 shadow-2xl">
              {/* Screen Bezel */}
              <div className="relative bg-gray-950 rounded-2xl p-4 overflow-hidden">
                {/* Screen Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
                
                {/* Screen Content */}
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-8 min-h-[400px] md:min-h-[500px] flex items-center justify-center overflow-hidden">
                  {/* Background Bag Image */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`image-${currentBag.id}`}
                      className="absolute inset-0 opacity-20"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 0.2, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                    >
                      <img
                        src={currentBag.image}
                        alt={currentBag.name}
                        className="w-full h-full object-cover blur-sm"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-transparent to-gray-900/80" />
                    </motion.div>
                  </AnimatePresence>

                  {/* Floating Bag Images (Side Elements) */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Left Side Bag */}
                    <motion.div
                      initial={{ opacity: 0, x: -100, rotate: -15 }}
                      animate={{ opacity: 0.3, x: 0, rotate: -12 }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="absolute left-4 top-1/4 w-32 h-40 rounded-lg overflow-hidden shadow-2xl"
                    >
                      <img
                        src={bagDesigns[(currentBagIndex + 1) % bagDesigns.length].image}
                        alt="Travel Bag"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </motion.div>

                    {/* Right Side Bag */}
                    <motion.div
                      initial={{ opacity: 0, x: 100, rotate: 15 }}
                      animate={{ opacity: 0.3, x: 0, rotate: 12 }}
                      transition={{ duration: 1.5, delay: 0.7 }}
                      className="absolute right-4 bottom-1/4 w-32 h-40 rounded-lg overflow-hidden shadow-2xl"
                    >
                      <img
                        src={bagDesigns[(currentBagIndex + 2) % bagDesigns.length].image}
                        alt="Travel Bag"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </motion.div>
                  </div>

                  {/* SVG Canvas (Drawing Animation) */}
                  <AnimatePresence mode="wait">
                    <motion.svg
                      key={currentBag.id}
                      viewBox="0 0 380 320"
                      className="w-full h-full max-w-full relative z-10"
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Gradient Definitions */}
                      <defs>
                        <linearGradient
                          id={`gradient-${currentBag.id}`}
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor={currentBag.fillGradient[0]} stopOpacity="0.8" />
                          <stop offset="50%" stopColor={currentBag.fillGradient[1]} stopOpacity="0.9" />
                          <stop offset="100%" stopColor={currentBag.fillGradient[2]} stopOpacity="0.8" />
                        </linearGradient>
                      </defs>

                      {/* Animated Bag Paths */}
                      {currentBag.paths.map((pathData, index) => (
                        <motion.path
                          key={`${pathData.type}-${index}`}
                          d={pathData.d}
                          stroke={pathData.stroke || '#ffffff'}
                          strokeWidth={pathData.type === 'outline' ? '3' : '2'}
                          fill={showFill && pathData.type === 'outline' ? `url(#gradient-${currentBag.id})` : 'none'}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{
                            pathLength: {
                              duration: 2,
                              delay: pathData.delay,
                              ease: [0.25, 0.46, 0.45, 0.94],
                            },
                            opacity: {
                              duration: 0.3,
                              delay: pathData.delay,
                            },
                            fill: {
                              duration: 1.5,
                              delay: 4,
                              ease: 'easeInOut',
                            },
                          }}
                        />
                      ))}

                      {/* Stylus Cursor Effect */}
                      {drawingPhase === 'drawing' && (
                        <motion.circle
                          cx="200"
                          cy="150"
                          r="4"
                          fill="#ffffff"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [1, 1.5, 1],
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                    </motion.svg>
                  </AnimatePresence>

                  {/* Bag Name Label */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: drawingPhase === 'complete' ? 1 : 0, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                  >
                    <span className="text-white/80 text-sm font-medium tracking-wide uppercase">
                      {currentBag.name}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Tablet Home Button */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-700 rounded-full" />
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-center mt-12"
          >
            <motion.button
              onClick={handleExploreClick}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-charcoal text-white text-sm font-semibold uppercase tracking-widest rounded-full shadow-lg hover:bg-primary-600 transition-colors"
            >
              Explore the Collection
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Floating Particles Effect */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary-400/20 rounded-full"
          initial={{
            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0,
            opacity: 0,
          }}
          animate={{
            y: [null, -30, -60],
            opacity: [0, 0.5, 0],
            scale: [1, 1.5, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeOut',
          }}
        />
      ))}
    </section>
  );
};

export default HeroBanner;
