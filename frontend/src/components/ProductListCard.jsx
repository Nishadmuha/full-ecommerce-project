// frontend/src/components/ProductListCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductListCard({ product }) {
  // For color variants, use the color image; otherwise use product image
  const image = product.image || product.images?.[0] || '';
  
  // Extract original product ID (remove color suffix if present)
  const originalProductId = product._id?.includes('_color_') 
    ? product._id.split('_color_')[0] 
    : product._id;
  
  const detailHref = `/products/${originalProductId || ''}`;
  
  // If it's a color variant, add color parameter to URL
  const detailHrefWithColor = product.colorName 
    ? `${detailHref}?color=${encodeURIComponent(product.colorName)}`
    : detailHref;

  return (
    <article className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image - Large, square-ish */}
      <Link to={detailHrefWithColor} className="block aspect-square overflow-hidden bg-gray-100 relative">
        <img
          src={image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        {/* Color Badge */}
        {product.colorName && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-800">
            {product.colorName}
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-6 space-y-4">
        {/* Product Name - Show original title if available, otherwise show full title */}
        <Link to={detailHrefWithColor}>
          <h3 className="font-display text-xl font-semibold text-charcoal hover:text-gray-600 transition-colors">
            {product.originalTitle || product.title}
          </h3>
          {/* Show color name separately if it's a variant */}
          {product.colorName && (
            <p className="text-sm text-gray-600 mt-1">Color: {product.colorName}</p>
          )}
        </Link>

        {/* Price - Red/Orange accent */}
        <p className="text-2xl font-semibold text-[#FF4D4D]">
          ₹{Number(product.price).toLocaleString('en-IN')}
        </p>

        {/* View Details Button - Full width, outlined */}
        <Link
          to={detailHrefWithColor}
          className="mt-auto w-full rounded-lg border-2 border-charcoal px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide text-charcoal hover:bg-charcoal hover:text-white transition-colors"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
