// frontend/src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Hero from '../components/Hero';
import CollectionsSlider from '../components/CollectionsSlider';
import HorizontalProductSlider from '../components/HorizontalProductSlider';
import GiftingBanner from '../components/GiftingBanner';

// Fallback Banner Configuration - Used only if backend doesn't return banners
const FALLBACK_BANNER = {
  images: [
    'https://6xobags.com/Images/registerPage.jpg',
    'https://6xobags.com/Images/loginPageImage.jpg',
    'https://6xobags.com/Images/banner2.jpg'
  ],
  title: 'Elevate Your',
  highlight: 'Journey:',
  title2: 'The Essence of 6XO',
  highlight2: 'Bags',
  description: 'Discover handcrafted luxury designed for the modern adventurer and urban explorer.',
  link: '',
  order: 0
};

// Example Collections - Used as fallback if API doesn't return collections
const EXAMPLE_COLLECTIONS = [
  { title: "Travel", imageUrl: "https://6xobags.com/Images/Untitled%20design%20(5).png" },
  { title: "Bags", imageUrl: "https://6xobags.com/Images/Untitled%20design%20(4).png" },
  { title: "Bags", imageUrl: "https://6xobags.com/Images/Untitled%20design%20(3).png" },
  { title: "Travel", imageUrl: "https://6xobags.com/Images/Untitled%20design%20(2).png" },
  { title: "Travel", imageUrl: "https://6xobags.com/Images/Untitled%20design.png" },
  { title: "Travel", imageUrl: "https://6xobags.com/Images/Untitled%20design%20(1).png" }
];

// Initial empty data structure
const initialData = {
  banners: [],
  collections: [],
  bestsellers: [],
  newArrivals: [],
};

const SectionHeading = ({ title, subtitle, align = 'center' }) => (
  <div className={`space-y-3 ${align === 'center' ? 'text-center' : ''}`}>
    <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal">{title}</h2>
    {subtitle && <p className="text-gray-500 text-lg">{subtitle}</p>}
  </div>
);

const mergeData = payload => {
  // Use backend banners if available and have exactly 3 images, otherwise use fallback
  const apiBanners = payload?.banners || [];
  const validBanner = apiBanners.find(banner => 
    banner.images && Array.isArray(banner.images) && banner.images.length === 3
  );
  
  return {
    banners: validBanner ? [validBanner] : [FALLBACK_BANNER],
  collections: payload?.collections || [],
  bestsellers: payload?.bestsellers || [],
  newArrivals: payload?.newArrivals || [],
  };
};

export default function Home() {
  const [data, setData] = useState(initialData);
  const [isSyncing, setIsSyncing] = useState(false);

  // Preload banner images when banner data is available
  useEffect(() => {
    const preloadBannerImages = (banners) => {
      if (!banners || banners.length === 0) return;
      
      const banner = banners[0];
      const images = banner?.images && Array.isArray(banner.images) && banner.images.length === 3
        ? banner.images 
        : [];

      if (images.length === 3) {
        // Clean image URLs (remove any whitespace/tabs)
        const cleanImages = images.map(img => typeof img === 'string' ? img.trim() : img);
        
        // Preload first image immediately with high priority
        if (cleanImages[0]) {
        const firstLink = document.createElement('link');
        firstLink.rel = 'preload';
        firstLink.as = 'image';
          firstLink.href = cleanImages[0];
        firstLink.fetchPriority = 'high';
        document.head.appendChild(firstLink);

        // Start loading first image immediately
        const firstImg = new Image();
        firstImg.fetchPriority = 'high';
        firstImg.loading = 'eager';
          firstImg.src = cleanImages[0];

        // Preload remaining images in background
          cleanImages.slice(1).forEach((imageUrl) => {
            if (imageUrl) {
          const img = new Image();
          img.fetchPriority = 'low';
          img.loading = 'lazy';
          img.src = imageUrl;
            }
        });
        }
      }
    };

    if (data.banners && data.banners.length > 0) {
      preloadBannerImages(data.banners);
    }
  }, [data.banners]);

  // Fetch banners, collections, bestsellers, and new arrivals from API
  useEffect(() => {
    let active = true;
    
    (async () => {
      setIsSyncing(true);
      try {
        const res = await api.get('/home');
        if (active) {
          const mergedData = mergeData(res.data);
          setData(mergedData);
        }
      } catch (err) {
        console.error('Home fetch error', err);
        // On error, use fallback banner with empty collections/products
        if (active) {
          setData({
            banners: [FALLBACK_BANNER],
            collections: [],
            bestsellers: [],
            newArrivals: [],
          });
        }
      } finally {
        if (active) {
          setIsSyncing(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Use banner from API or fallback
  const hero = data.banners && data.banners.length > 0 ? data.banners[0] : FALLBACK_BANNER;

  return (
    <div className="bg-white">
      <Hero banner={hero} />
      <main className="mx-auto max-w-7xl space-y-24 px-4 pb-20 pt-20 md:px-6 lg:px-8">
        {isSyncing && (
          <p className="text-center text-xs uppercase tracking-[0.4em] text-gray-400">
            Refreshing atelier inventory…
          </p>
        )}

        {/* Section 1: Explore Our Collections */}
        <section className="space-y-12">
          <SectionHeading
            title="Explore Our Collections"
            align="center"
          />
          <div className="px-4 md:px-0">
            <CollectionsSlider 
              collections={data.collections.length > 0 ? data.collections : []} 
            />
          </div>
        </section>

        {/* Section 2: Our Bestsellers */}
        <section id="bestsellers" className="space-y-8 scroll-mt-20">
          <SectionHeading title="Our Bestsellers" align="center" />
          <HorizontalProductSlider products={data.bestsellers} title="Bestsellers" />
        </section>

        {/* Section 3: New Arrivals */}
        <section className="space-y-8">
          <SectionHeading title="New Arrivals" align="center" />
          <HorizontalProductSlider products={data.newArrivals} title="New Arrivals" />
        </section>
      </main>

      {/* Section 4: The Art of Gifting Banner */}
      <GiftingBanner />
    </div>
  );
}
