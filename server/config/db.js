const mongoose = require('mongoose');
const dns = require('dns');

// Force Node to use Google DNS for lookups
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    // High-end tip: Add these options to handle connection better
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, 
    });
    
    console.log(`✅ Examify Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    process.exit(1);
  }
};

module.exports = connectDB;