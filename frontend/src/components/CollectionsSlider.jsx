// frontend/src/components/CollectionsSlider.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

// Example Collections - Used as fallback if API fails
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
  const [error, setError] = useState(null);

  // Fetch collections from API if not provided as prop
  useEffect(() => {
    // If collections are provided as prop, use them
    if (propCollections && propCollections.length > 0) {
      setCollections(propCollections);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from API
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try dedicated collections endpoint first
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
        
        // Fallback to home endpoint
        const homeResponse = await api.get('/home');
        
        if (homeResponse.data && homeResponse.data.collections && homeResponse.data.collections.length > 0) {
          setCollections(homeResponse.data.collections);
        } else {
          // Use example collections as fallback
          setCollections(EXAMPLE_COLLECTIONS);
        }
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError(err);
        // Use example collections as fallback on error
        setCollections(EXAMPLE_COLLECTIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [propCollections]);

  // Clean and format collections data
  const formattedCollections = collections.map(item => {
    let imageUrl = (item.image || item.imageUrl || '').trim();
    // Remove leading slashes and fix double slashes
    imageUrl = imageUrl.replace(/^\/+/, '').replace(/([^:]\/)\/+/g, '$1');
    // Decode URL encoding
    try {
      imageUrl = decodeURIComponent(imageUrl);
    } catch (e) {
      // If decoding fails, use original
    }
    return {
      title: item.name || item.title || '',
      imageUrl: imageUrl
    };
  }).filter(item => item.title && item.imageUrl);

  // Debug: Log collections data
  useEffect(() => {
    if (formattedCollections.length > 0) {
      console.log('CollectionsSlider - Formatted collections:', formattedCollections);
    } else {
      console.log('CollectionsSlider - No collections to display');
    }
  }, [formattedCollections]);

  // Duplicate items for seamless infinite scroll (duplicate 3 times for smooth loop)
  const duplicatedCollections = formattedCollections.length > 0
    ? [
        ...formattedCollections,
        ...formattedCollections,
        ...formattedCollections
      ]
    : [];

  // Calculate animation distance (width of one set of items)
  const itemWidth = 300; // 300px
  const gap = 24; // 1.5rem = 24px
  const itemTotalWidth = itemWidth + gap;
  const scrollDistance = itemTotalWidth * formattedCollections.length;

  // Set CSS variable for scroll distance - MUST be called before any early returns
  useEffect(() => {
    // Set CSS variable for scroll distance
    if (sliderRef.current && formattedCollections.length > 0) {
      sliderRef.current.style.setProperty('--scroll-distance', `-${scrollDistance}px`);
    }
  }, [scrollDistance, formattedCollections.length]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal"></div>
        <p className="mt-4 text-gray-500">Loading collections...</p>
      </div>
    );
  }

  // Error state (but still show fallback collections)
  if (error && formattedCollections.length === 0) {
    return (
      <div className="w-full text-center py-12 text-gray-500">
        <p>Failed to load collections. Please try again later.</p>
      </div>
    );
  }

  // If no collections, show message
  if (formattedCollections.length === 0) {
    return (
      <div className="w-full text-center py-12 text-gray-500">
        <p>No collections available</p>
      </div>
    );
  }

  return (
    <div 
      className="w-full overflow-hidden py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative min-h-[350px]">
        <div 
          ref={sliderRef}
          className={`collections-slider-track flex gap-6 ${isPaused ? 'paused' : ''}`}
          style={{ willChange: 'transform' }}
        >
          {duplicatedCollections.map((collection, index) => (
            <Link
              key={`${collection.title}-${index}`}
              to={`/products?category=${encodeURIComponent(collection.title)}`}
              className="group flex-shrink-0 w-[300px] h-[350px] relative overflow-hidden rounded-2xl"
            >
              {/* Fallback gradient background - only show if image fails */}
              {imageErrors[`${collection.title}-${index}`] && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 z-0" />
              )}
              
              {/* Image */}
              <img
                src={collection.imageUrl}
                alt={collection.title}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 z-10 ${
                  imageErrors[`${collection.title}-${index}`] ? 'hidden' : ''
                }`}
                onError={(e) => {
                  console.error('Image failed to load:', collection.imageUrl, 'for:', collection.title);
                  setImageErrors(prev => ({
                    ...prev,
                    [`${collection.title}-${index}`]: true
                  }));
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', collection.imageUrl);
                }}
                loading="lazy"
              />
              
              {/* Gradient overlay at bottom - above image but below text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-20 pointer-events-none" />
              
              {/* Title - Bottom left */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">{collection.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

