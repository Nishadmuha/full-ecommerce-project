import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const EXAMPLE_COLLECTIONS = [
  { title: "Travel", imageUrl: "https://6xobags.com/Images/Untitled%20design%20(5).png" },
  { title: "Bags", imageUrl: "https://6xobags.com/Images/Untitled%20design%20(4).png" },
  { title: "Bags", imageUrl: "https://6xobags.com/Images/Untitled%20design%20(3).png" },
  { title: "Travel", imageUrl: "https://6xobags.com/Images/Untitled%20design%20(2).png" },
  { title: "Travel", imageUrl: "https://6xobags.com/Images/Untitled%20design.png" },
  { title: "Travel", imageUrl: "https://6xobags.com/Images/Untitled%20design%20(1).png" }
];

export default function CollectionsSlider({ collections: propCollections = [] }) {
  const sliderRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propCollections && propCollections.length > 0) {
      setCollections(propCollections);
      setLoading(false);
      return;
    }

    const fetchCollections = async () => {
      try {
        setLoading(true);
        try {
          const collectionsResponse = await api.get('/collections?limit=8');
          if (collectionsResponse.data && collectionsResponse.data.collections && collectionsResponse.data.collections.length > 0) {
            setCollections(collectionsResponse.data.collections);
            setLoading(false);
            return;
          }
        } catch (collectionsError) {
          console.log('Collections endpoint failed, trying home endpoint...', collectionsError);
        }
        
        const homeResponse = await api.get('/home');
        if (homeResponse.data && homeResponse.data.collections && homeResponse.data.collections.length > 0) {
          setCollections(homeResponse.data.collections);
        } else {
          setCollections(EXAMPLE_COLLECTIONS);
        }
      } catch (err) {
        console.error('Error fetching collections:', err);
        setCollections(EXAMPLE_COLLECTIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [propCollections]);

  const formattedCollections = collections.map(item => {
    let imageUrl = (item.image || item.imageUrl || '').trim();
    imageUrl = imageUrl.replace(/^\/+/, '').replace(/([^:]\/)\/+/g, '$1');
    try {
      imageUrl = decodeURIComponent(imageUrl);
    } catch (e) {}
    return {
      title: item.name || item.title || '',
      imageUrl: imageUrl
    };
  }).filter(item => item.title && item.imageUrl);

  const duplicatedCollections = formattedCollections.length > 0
    ? [...formattedCollections, ...formattedCollections, ...formattedCollections]
    : [];

  const itemWidth = 320;
  const gap = 24;
  const scrollDistance = (itemWidth + gap) * formattedCollections.length;

  useEffect(() => {
    if (sliderRef.current && formattedCollections.length > 0) {
      sliderRef.current.style.setProperty('--scroll-distance', `-${scrollDistance}px`);
    }
  }, [scrollDistance, formattedCollections.length]);

  if (loading) {
    return (
      <div className="w-full text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal"></div>
        <p className="mt-4 text-gray-500">Loading collections...</p>
      </div>
    );
  }

  if (formattedCollections.length === 0) {
    return (
      <div className="w-full text-center py-12 text-gray-500">
        <p>No collections available</p>
      </div>
    );
  }

  return (
    <div 
      className="w-full overflow-hidden py-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative min-h-[400px]">
        <motion.div 
          ref={sliderRef}
          className={`collections-slider-track flex gap-6 ${isPaused ? 'paused' : ''}`}
          style={{ willChange: 'transform' }}
        >
          {duplicatedCollections.map((collection, index) => (
            <motion.div
              key={`${collection.title}-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % formattedCollections.length) * 0.1 }}
            >
              <Link
                to={`/products?category=${encodeURIComponent(collection.title)}`}
                className="group flex-shrink-0 w-[300px] h-[400px] relative overflow-hidden rounded-3xl block"
              >
                {imageErrors[`${collection.title}-${index}`] && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 z-0" />
                )}
                
                <motion.img
                  src={collection.imageUrl}
                  alt={collection.title}
                  className={`absolute inset-0 w-full h-full object-cover z-10 ${
                    imageErrors[`${collection.title}-${index}`] ? 'hidden' : ''
                  }`}
                  onError={(e) => {
                    setImageErrors(prev => ({
                      ...prev,
                      [`${collection.title}-${index}`]: true
                    }));
                  }}
                  loading="lazy"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20 pointer-events-none" />
                
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-8 z-30"
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                >
                  <motion.h3
                    className="text-3xl font-bold text-white drop-shadow-2xl mb-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    {collection.title}
                  </motion.h3>
                  <motion.span
                    className="text-white/90 text-sm font-medium inline-flex items-center gap-2"
                    initial={{ x: -10, opacity: 0 }}
                    whileHover={{ x: 0, opacity: 1 }}
                  >
                    Explore Collection
                    <motion.svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </motion.svg>
                  </motion.span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
