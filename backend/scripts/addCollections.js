// backend/scripts/addCollections.js
// Quick script to add collections to database
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');

// Example collections data
const collections = [
  {
    name: "Travel",
    image: "https://6xobags.com/Images/Untitled%20design%20(5).png",
    slug: "travel"
  },
  {
    name: "Bags",
    image: "https://6xobags.com/Images/Untitled%20design%20(4).png",
    slug: "bags"
  },
  {
    name: "Backpacks",
    image: "https://6xobags.com/Images/Untitled%20design%20(3).png",
    slug: "backpacks"
  },
  {
    name: "Handbags",
    image: "https://6xobags.com/Images/Untitled%20design%20(2).png",
    slug: "handbags"
  },
  {
    name: "Accessories",
    image: "https://6xobags.com/Images/Untitled%20design.png",
    slug: "accessories"
  },
  {
    name: "Luggage",
    image: "https://6xobags.com/Images/Untitled%20design%20(1).png",
    slug: "luggage"
  }
];

async function addCollections() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Clear existing categories (optional - comment out if you want to keep existing)
    // await Category.deleteMany({});
    // console.log('🗑️  Cleared existing categories');

    // Add collections
    for (const collection of collections) {
      try {
        // Check if category already exists
        const existing = await Category.findOne({ name: collection.name });
        if (existing) {
          console.log(`⏭️  Skipping "${collection.name}" - already exists`);
          continue;
        }

        // Create new category
        const newCategory = await Category.create(collection);
        console.log(`✅ Added collection: ${newCategory.name}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⏭️  Skipping "${collection.name}" - duplicate entry`);
        } else {
          console.error(`❌ Error adding "${collection.name}":`, error.message);
        }
      }
    }

    // Display all categories
    const allCategories = await Category.find();
    console.log('\n📋 All Collections in Database:');
    allCategories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.image})`);
    });

    console.log('\n✅ Collections setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
addCollections();



