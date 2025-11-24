// frontend/src/components/Collections.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Collections({ items = [] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {items.map(c => (
        <Link to={`/shop/${c.slug || ''}`} key={c._id} className="group">
          <div className="rounded-lg overflow-hidden bg-white shadow">
            <img src={c.image || 'https://via.placeholder.com/600'} alt={c.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform" />
            <div className="p-4 text-center">
              <h3 className="font-medium">{c.name}</h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
