// frontend/src/components/CollectionsGrid.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function CollectionsGrid({ items = [] }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryProducts, setCategoryProducts] = useState({}); // Store products for each category

  // Default collections if API fails
  const defaultCollections = [
    { name: 'Backpacks', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop' },
    { name: 'Handbags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop' },
    { name: 'Travel Bags', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format&fit=crop' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop' },
  ];

  // Fetch products for each category to get images for rotation
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const allProducts = await api.get('/products');
        if (allProducts.data) {
          // Group products by category
          const productsByCategory = {};
          allProducts.data.forEach(product => {
            if (product.category) {
              if (!productsByCategory[product.category]) {
                productsByCategory[product.category] = [];
              }
              // Collect all images from products in this category
              const productImages = [];
              if (product.image) productImages.push(product.image);
              if (product.images && product.images.length > 0) {
                productImages.push(...product.images.filter(img => img));
              }
              if (productImages.length > 0) {
                productsByCategory[product.category].push(...productImages);
              }
            }
          });
          setCategoryProducts(productsByCategory);
        }
      } catch (error) {
        console.error('Error fetching category products:', error);
      }
    };

    fetchCategoryProducts();
  }, []);

  useEffect(() => {
    // Use items prop if provided, otherwise fetch from API
    if (items && items.length > 0) {
      setCollections(items.map(cat => ({
        name: cat.name,
        image: cat.image || defaultCollections.find(d => d.name === cat.name)?.image || defaultCollections[0].image,
        images: categoryProducts[cat.name] || [] // Add product images for rotation
      })));
      setLoading(false);
    } else {
      fetchCollections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, categoryProducts]);

  const fetchCollections = async () => {
    try {
      // Try to get collections from home API
      const response = await api.get('/home');
      if (response.data.collections && response.data.collections.length > 0) {
        setCollections(response.data.collections.map(cat => ({
          name: cat.name,
          image: cat.image || defaultCollections.find(d => d.name === cat.name)?.image || defaultCollections[0].image,
          images: categoryProducts[cat.name] || [] // Add product images for rotation
        })));
      } else {
        setCollections(defaultCollections.map(cat => ({
          ...cat,
          images: categoryProducts[cat.name] || []
        })));
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setCollections(defaultCollections.map(cat => ({
        ...cat,
        images: categoryProducts[cat.name] || []
      })));
    } finally {
      setLoading(false);
    }
  };

  // Rotate category images every 2 minutes
  useEffect(() => {
    if (collections.length === 0) return;

    const rotateImages = () => {
      setCollections(prevCollections => 
        prevCollections.map(collection => {
          if (collection.images && collection.images.length > 1) {
            // Rotate to next image
            const currentIndex = collection.images.findIndex(img => img === collection.image);
            const nextIndex = currentIndex === -1 || currentIndex === collection.images.length - 1 
              ? 0 
              : currentIndex + 1;
            return {
              ...collection,
              image: collection.images[nextIndex]
            };
          }
          return collection;
        })
      );
    };

    // Rotate every 2 minutes (120000ms)
    const interval = setInterval(rotateImages, 120000);
    return () => clearInterval(interval);
  }, [collections.length]); // Only depend on length to avoid unnecessary re-renders

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading collections...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {collections.map((collection, index) => (
        <Link
          key={collection.name || index}
          to={`/products?category=${collection.name.toLowerCase().replace(/\s+/g, '-')}`}
          className="group relative overflow-hidden rounded-2xl bg-gray-100 aspect-square"
        >
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={collection.image}
              alt={collection.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-2xl font-semibold text-white">{collection.name}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
