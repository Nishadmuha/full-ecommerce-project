import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import api from '../api/api';
import Hero from '../components/Hero';
import CollectionsSlider from '../components/CollectionsSlider';
import HorizontalProductSlider from '../components/HorizontalProductSlider';
import GiftingBanner from '../components/GiftingBanner';

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

const initialData = {
  banners: [],
  collections: [],
  bestsellers: [],
  newArrivals: [],
};

const SectionHeading = ({ title, subtitle, align = 'center' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className={`space-y-4 ${align === 'center' ? 'text-center' : ''}`}
    >
      <motion.h2
        variants={itemVariants}
        className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className="text-gray-500 text-lg md:text-xl"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
};

const mergeData = payload => {
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

  const hero = data.banners && data.banners.length > 0 ? data.banners[0] : FALLBACK_BANNER;

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <div className="bg-white overflow-hidden">
      <Hero banner={hero} />
      
      <main className="mx-auto max-w-7xl space-y-32 px-4 pb-24 pt-16 md:px-6 lg:px-8">
        {isSyncing && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs uppercase tracking-[0.4em] text-gray-400"
          >
            Refreshing atelier inventory…
          </motion.p>
        )}

        {/* Section 1: Explore Our Collections */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-12"
        >
          <SectionHeading
            title="Explore Our Collections"
            subtitle="Curated selections for every style"
            align="center"
          />
          <div className="px-4 md:px-0">
            <CollectionsSlider 
              collections={data.collections.length > 0 ? data.collections : []} 
            />
          </div>
        </motion.section>

        {/* Section 2: Our Bestsellers */}
        <motion.section
          id="bestsellers"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-12 scroll-mt-20"
        >
          <SectionHeading
            title="Our Bestsellers"
            subtitle="Most loved by our customers"
            align="center"
          />
          <HorizontalProductSlider products={data.bestsellers} title="Bestsellers" />
        </motion.section>

        {/* Section 3: New Arrivals */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-12"
        >
          <SectionHeading
            title="New Arrivals"
            subtitle="Fresh additions to our collection"
            align="center"
          />
          <HorizontalProductSlider products={data.newArrivals} title="New Arrivals" />
        </motion.section>
      </main>

      {/* Section 4: The Art of Gifting Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <GiftingBanner />
      </motion.div>
    </div>
  );
}
