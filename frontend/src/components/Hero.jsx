// frontend/src/components/Hero.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Helper function to optimize image URLs - aggressive optimization for fastest loading
const optimizeImageUrl = (url, isThumbnail = false) => {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    
    // For Unsplash images, optimize parameters ULTRA-aggressively for fastest loading (<3 seconds)
    if (urlObj.hostname.includes('unsplash.com') || urlObj.hostname.includes('images.unsplash.com')) {
      // Reduce width to 500px (much smaller file size, faster loading)
      urlObj.searchParams.set('w', '500');
      // Reduce quality to 40% (ultra-fast loading, still acceptable for banners)
      urlObj.searchParams.set('q', '40');
      // Use WebP format if supported (better compression)
      urlObj.searchParams.set('fm', 'webp');
      // Keep auto format and fit
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
    } else {
      // For other image URLs, try to add optimization parameters
      if (!urlObj.searchParams.has('w')) {
        urlObj.searchParams.set('w', '500');
      }
      if (!urlObj.searchParams.has('q')) {
        urlObj.searchParams.set('q', '40');
      }
    }
    
    return urlObj.toString();
  } catch (e) {
    // If URL parsing fails, return original
    return url;
  }
};

// Generate low-quality placeholder URL for blur-up effect
const getPlaceholderUrl = (url) => {
  if (!url) return url;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('unsplash.com') || urlObj.hostname.includes('images.unsplash.com')) {
      urlObj.searchParams.set('w', '20');
      urlObj.searchParams.set('q', '20');
      urlObj.searchParams.set('blur', '10');
      return urlObj.toString();
    }
  } catch (e) {
    // If URL parsing fails, return original
  }
  return url;
};

export default function Hero({ banner }) {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [firstImageReady, setFirstImageReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const imageRefs = useRef({});
  const initializedRef = useRef(false);

  // Use banner from API only - no dummy data fallback
  const activeBanner = banner && banner.images && banner.images.length === 3 
    ? banner 
    : null;

  // Get images array from active banner, clean URLs, and optimize for fastest loading
  const rawImages = useMemo(() => {
    if (activeBanner && activeBanner.images && Array.isArray(activeBanner.images) && activeBanner.images.length === 3) {
      return activeBanner.images.map(img => typeof img === 'string' ? img.trim() : img).filter(img => img);
    }
    return [];
  }, [activeBanner?.images?.join(',')]); // Use join to create stable dependency
  
  // Optimize all image URLs (aggressive optimization: 800px width, 60% quality, WebP)
  const bannerImages = useMemo(() => {
    return rawImages.length === 3 ? rawImages.map(optimizeImageUrl) : [];
  }, [rawImages]);
  
  // Generate placeholder URLs for blur-up effect
  const placeholderImages = useMemo(() => {
    return rawImages.map(getPlaceholderUrl);
  }, [rawImages]);

  // ULTRA-aggressive preloading - load first image ONLY, others lazy load
  useEffect(() => {
    if (bannerImages.length === 0) {
      initializedRef.current = false;
      return;
    }
    
    // Prevent re-initialization if already initialized with the same images
    const currentFirstImage = bannerImages[0];
    if (initializedRef.current && imageRefs.current[0]?.src === currentFirstImage) {
      return;
    }
    
    // Reset initialization flag when images change
    initializedRef.current = false;
    
    // Add DNS prefetch and preconnect for faster connection (do this first)
    try {
      const imageDomain = new URL(bannerImages[0]).origin;
      let dnsLink = document.querySelector(`link[rel="dns-prefetch"][href="${imageDomain}"]`);
      if (!dnsLink) {
        dnsLink = document.createElement('link');
        dnsLink.rel = 'dns-prefetch';
        dnsLink.href = imageDomain;
        document.head.insertBefore(dnsLink, document.head.firstChild);
      }
      
      let preconnectLink = document.querySelector(`link[rel="preconnect"][href="${imageDomain}"]`);
      if (!preconnectLink) {
        preconnectLink = document.createElement('link');
        preconnectLink.rel = 'preconnect';
        preconnectLink.href = imageDomain;
        preconnectLink.crossOrigin = 'anonymous';
        document.head.insertBefore(preconnectLink, document.head.firstChild);
      }
    } catch (e) {
      // URL parsing failed, continue
    }
    
    // Load ONLY first image with highest priority - critical for <3 second load
    if (bannerImages[0]) {
      // Multiple preload strategies for maximum speed
      const firstLink = document.createElement('link');
      firstLink.rel = 'preload';
      firstLink.as = 'image';
      firstLink.href = bannerImages[0];
      firstLink.fetchPriority = 'high';
      document.head.insertBefore(firstLink, document.head.firstChild);
      
      // Start loading first image immediately - don't wait
      const firstImg = new Image();
      firstImg.fetchPriority = 'high';
      firstImg.loading = 'eager';
      firstImg.decoding = 'async';
      firstImg.onload = () => {
        setFirstImageReady(true);
        setImagesLoaded(prev => ({ ...prev, 0: true }));
      };
      firstImg.onerror = () => {
        setFirstImageReady(true);
        setImagesLoaded(prev => ({ ...prev, 0: true }));
      };
      firstImg.src = bannerImages[0];
      imageRefs.current[0] = firstImg;
      
      // Mark as initialized
      initializedRef.current = true;
      
      // Mark first image as ready immediately (optimistic)
      setFirstImageReady(true);
      setImagesLoaded(prev => ({ ...prev, 0: true }));
    }
    
    // Load remaining images ONLY when needed (lazy load on rotation)
    // This reduces initial load time significantly
  }, [bannerImages]);

  // Auto-advance through images smoothly - Automatic Photo Carousel
  useEffect(() => {
    if (bannerImages.length === 0 || bannerImages.length <= 1) return;
    
    // Preload next image when current index changes (lazy loading strategy)
    const preloadNextImage = (currentIndex) => {
      const nextIndex = (currentIndex + 1) % bannerImages.length;
      if (!imagesLoaded[nextIndex] && bannerImages[nextIndex]) {
        const img = new Image();
        img.fetchPriority = 'low';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.onload = () => {
          setImagesLoaded(prev => ({ ...prev, [nextIndex]: true }));
        };
        img.onerror = () => {
          setImagesLoaded(prev => ({ ...prev, [nextIndex]: true }));
        };
        img.src = bannerImages[nextIndex];
        imageRefs.current[nextIndex] = img;
      }
    };
    
    // Preload next image when index changes
    preloadNextImage(currentImageIndex);
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Auto-advance through images every 2 seconds (only if not paused)
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const next = (prev + 1) % bannerImages.length;
          // Preload the image after next
          setTimeout(() => preloadNextImage(next), 100);
          return next;
        });
      }, 2000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [bannerImages.length, currentImageIndex, imagesLoaded, isPaused]);

  const handleBannerClick = () => {
    // Navigate to bestseller section
    const bestsellerSection = document.getElementById('bestsellers');
    if (bestsellerSection) {
      bestsellerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If on homepage, scroll to section; otherwise navigate to homepage
      if (window.location.pathname === '/') {
        setTimeout(() => {
          const section = document.getElementById('bestsellers');
          if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        navigate('/#bestsellers');
      }
    }
  };

  if (bannerImages.length === 0) {
    return null; // Don't render if no images
  }

  return (
    <section className="w-full relative overflow-hidden">
      <div
        className="w-full h-[70vh] md:h-[80vh] bg-cover bg-center flex items-center cursor-pointer relative bg-gray-200"
        onClick={handleBannerClick}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Render placeholder images for blur-up effect - only show if main image not loaded yet */}
        {placeholderImages.map((placeholderUrl, index) => (
          <img
            key={`placeholder-${index}`}
            src={placeholderUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-sm"
            style={{
              opacity: index === currentImageIndex && !imagesLoaded[index] ? 0.5 : 0,
              zIndex: index === currentImageIndex && !imagesLoaded[index] ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
            }}
            aria-hidden="true"
            loading="eager"
          />
        ))}
        
        {/* Render optimized images - first image eager, others lazy */}
        {bannerImages.map((imageUrl, index) => (
          <img
            key={index}
            src={index === 0 || imagesLoaded[index] ? imageUrl : undefined}
            alt={`${activeBanner?.title || 'Banner'} - Image ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
            style={{
              opacity: index === currentImageIndex && (index === 0 || imagesLoaded[index]) ? 1 : 0,
              zIndex: index === currentImageIndex && (index === 0 || imagesLoaded[index]) ? 2 : 0,
              willChange: 'opacity',
            }}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'low'}
            decoding="async"
            onLoad={() => {
              setImagesLoaded(prev => ({ ...prev, [index]: true }));
              if (index === 0) setFirstImageReady(true);
            }}
          />
        ))}

        {/* Light overlay for minimal darkening - banner image more visible */}
        <div className="absolute inset-0 bg-black/5" />
        
        {/* Content overlay - perfectly centered vertically and horizontally */}
        <div className="absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300">
          {/* Transparent background - banner image clearly visible */}
          <div className="bg-transparent px-8 md:px-16 py-8 md:py-12 w-full max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-wider leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {activeBanner.title && (
                  <>
                    <span className="uppercase">{activeBanner.title}</span>
                    {activeBanner.highlight && (
                      <>
                        {' '}
                        <span className="text-[#ff0000] uppercase">{activeBanner.highlight}</span>
                      </>
                    )}
                    {activeBanner.title2 && <br />}
                  </>
                )}
                {activeBanner.title2 && (
                  <>
                    <span className="uppercase">{activeBanner.title2}</span>
                    {activeBanner.highlight2 && (
                      <>
                        {' '}
                        <span className="text-[#ff0000] uppercase">{activeBanner.highlight2}</span>
                      </>
                    )}
                  </>
                )}
                {!activeBanner.title && activeBanner.highlight && (
                  <span className="text-[#ff0000] uppercase">{activeBanner.highlight}</span>
                )}
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-white mt-4 max-w-2xl mx-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">{activeBanner.description}</p>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleBannerClick();
                }}
                className="mt-6 px-8 py-3 bg-gray-700 text-white text-sm font-semibold uppercase tracking-wide hover:bg-gray-600 transition-colors"
              >
                Shop Our Collections
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image indicators - show dots for each of the 3 images */}
      {bannerImages.length > 1 && (
        <div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {bannerImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={e => {
                e.stopPropagation();
                setCurrentImageIndex(index);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
