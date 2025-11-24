// backend/seed/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Banner = require('../models/Banner');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function seed() {
  await connectDB();

  // Clear
  await Banner.deleteMany();
  await Category.deleteMany();
  await Product.deleteMany();

  // Banners
  await Banner.insertMany([
    {
      image: 'https://images.unsplash.com/photo-1503104834685-7205e8607ebd?w=1400&q=80&auto=format&fit=crop',
      title: 'Elevate Your Journey',
      subtitle: 'The Essence of 6XO Bags',
      link: '/products',
      order: 1
    }
  ]);

  // Categories (collections)
  const categories = [
    { name: 'Backpacks', image: 'https://via.placeholder.com/600x600?text=Backpacks', slug: 'backpacks' },
    { name: 'Handbags', image: 'https://via.placeholder.com/600x600?text=Handbags', slug: 'handbags' },
    { name: 'Travel Bags', image: 'https://via.placeholder.com/600x600?text=Travel', slug: 'travel-bags' },
    { name: 'Accessories', image: 'https://via.placeholder.com/600x600?text=Accessories', slug: 'accessories' }
  ];
  await Category.insertMany(categories);

  // Products - include some bestsellers & new
  const now = new Date();
  const products = [
    { title: 'Classic Beige Tote', price: 2499, images: ['https://via.placeholder.com/600x600?text=Beige+Tote'], category: 'Handbags', isBestseller: true, isNew: false, stock: 20, createdAt: new Date(now.getTime()-1000*60*60*24*10) },
    { title: 'Modern Gray Sling', price: 1799, images: ['https://via.placeholder.com/600x600?text=Gray+Sling'], category: 'Bags', isBestseller: true, isNew: false, stock: 10, createdAt: new Date(now.getTime()-1000*60*60*24*8) },
    { title: 'Black Travel Pro', price: 3999, images: ['https://via.placeholder.com/600x600?text=Travel+Pro'], category: 'Travel Bags', isBestseller: true, isNew: false, stock: 6, createdAt: new Date(now.getTime()-1000*60*60*24*20) },
    { title: 'Leather Backpack', price: 3199, images: ['https://via.placeholder.com/600x600?text=Leather+Backpack'], category: 'Backpacks', isBestseller: false, isNew: true, stock: 12, createdAt: new Date(now.getTime()-1000*60*60*24*2) },
    { title: 'Kids Travel Bag', price: 1299, images: ['https://via.placeholder.com/600x600?text=Kids+Bag'], category: 'Travel Bags', isBestseller: false, isNew: true, stock: 30, createdAt: new Date(now.getTime()-1000*60*60*24*1) },
    { title: 'Minimalist Wallet', price: 699, images: ['https://via.placeholder.com/600x600?text=Wallet'], category: 'Accessories', isBestseller: false, isNew: true, stock: 50, createdAt: new Date(now.getTime()-1000*60*60*6) },
    { title: 'Premium Green Backpack', price: 2199, images: ['https://via.placeholder.com/600x600?text=Green+Backpack'], category: 'Backpacks', isBestseller: true, isNew: false, stock: 18, createdAt: new Date(now.getTime()-1000*60*60*24*4) }
  ];

  await Product.insertMany(products);

  // create admin user if you want
  await User.deleteMany();
  const hashed = await bcrypt.hash('admin123', 10);
  await User.create({ name: 'Admin', email: 'admin@example.com', password: hashed, isAdmin: true });

  console.log('Seed complete');
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
