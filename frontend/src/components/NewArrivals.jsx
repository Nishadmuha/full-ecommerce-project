// frontend/src/components/NewArrivals.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NewArrivals({ items = [] }) {
  if (!items.length) {
    return <div className="text-center text-gray-500">Fresh pieces arrive soon.</div>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <article
          key={item._id || item.title}
          className={`rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden ${
            index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
          }`}
        >
          <div className="relative">
            <img
              src={item.images?.[0] || item.image}
              alt={item.title}
              className="h-60 w-full object-cover"
              loading="lazy"
            />
            {item.tag && (
              <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-charcoal">
                {item.tag}
              </span>
            )}
          </div>
          <div className="space-y-2 p-5">
            <h4 className="font-semibold text-gray-900">{item.title}</h4>
            <p className="text-sm text-gray-500">{item.subtitle}</p>
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-[#ff0000]">₹{item.price}</span>
              <Link to="/products" className="text-clay">
                Shop →
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}



