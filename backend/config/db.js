const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      console.error('❌ Error: MONGO_URI is not set in environment variables');
      console.error('Please add MONGO_URI to your .env file');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:');
    console.error(err.message);
    
    if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('\n💡 Possible solutions:');
      console.error('1. Check if your MongoDB server is running');
      console.error('2. Verify your MONGO_URI in .env file is correct');
      console.error('3. If using MongoDB Atlas, check if your IP is whitelisted');
      console.error('4. Check your internet connection');
    } else if (err.message.includes('authentication failed')) {
      console.error('\n💡 Authentication failed. Check your username and password in MONGO_URI');
    } else if (err.message.includes('closed')) {
      console.error('\n💡 Connection closed. Possible causes:');
      console.error('1. MongoDB server is not running');
      console.error('2. Network/firewall blocking the connection');
      console.error('3. MongoDB Atlas cluster might be paused');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
