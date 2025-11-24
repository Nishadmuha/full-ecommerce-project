// backend/scripts/dropCategoryIndexes.js
// Script to drop unique indexes from categories collection
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

async function dropIndexes() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;
    const collection = db.collection('categories');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop unique index on name if it exists
    try {
      await collection.dropIndex('name_1');
      console.log('\n✅ Dropped index: name_1');
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('\nℹ️  Index name_1 does not exist (already removed)');
      } else {
        throw error;
      }
    }

    // Drop unique index on slug if it exists
    try {
      await collection.dropIndex('slug_1');
      console.log('✅ Dropped index: slug_1');
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  Index slug_1 does not exist (already removed)');
      } else {
        throw error;
      }
    }

    // Show updated indexes
    const updatedIndexes = await collection.indexes();
    console.log('\n📋 Updated indexes:');
    updatedIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Index cleanup complete!');
    console.log('💡 You can now create collections with duplicate names.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
dropIndexes();



