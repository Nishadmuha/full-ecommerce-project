// frontend/src/components/ProductGrid.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductGrid({ products = [], fallbackLabel, limit = 4 }) {
  if (!products.length) {
    return <div className="text-gray-500 text-center">Products are on their way.</div>;
  }

  const visibleProducts = limit ? products.slice(0, limit) : products;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {visibleProducts.map(product => {
        const label = product.badge || product.tag || fallbackLabel;

        return (
          <article
            key={product._id}
            className="rounded-3xl bg-white p-4 shadow-sm border border-gray-100 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            <Link to={`/products/${product._id}`} className="block overflow-hidden rounded-2xl bg-[#f4f1ec]">
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/600'}
                alt={product.title}
                className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
            </Link>
            <div className="flex-1 space-y-2">
              {label && (
                <span className="inline-flex items-center rounded-full bg-[#fce9e0] px-3 py-1 text-xs uppercase tracking-wide text-[#c45a3b]">
                  {label}
                </span>
              )}
              <h4 className="text-lg font-semibold text-gray-900">{product.title}</h4>
              <span className="inline-block text-xs font-semibold text-green-600">Free Delivery</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-semibold text-[#FF4D4D]">₹{product.price}</span>
              <Link to={`/products/${product._id}`} className="text-sm font-semibold text-[#c45a3b]">
                Shop now →
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
