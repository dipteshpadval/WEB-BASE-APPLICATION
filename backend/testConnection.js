const { connectDB, disconnectDB } = require('./config/mongodb');

const testConnection = async () => {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  try {
    // Test connection
    const conn = await connectDB();
    
    console.log('✅ SUCCESS: MongoDB is connected!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    console.log(`📊 Ready State: ${conn.connection.readyState}`);
    
    // Test if we can perform operations
    console.log('\n🧪 Testing database operations...');
    
    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    console.log('\n🎉 MongoDB connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ FAILED: MongoDB connection error');
    console.error(`Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if MongoDB Atlas is accessible');
      console.log('2. Verify your connection string');
      console.log('3. Check your IP whitelist in MongoDB Atlas');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check your username and password');
      console.log('2. Verify your MongoDB Atlas user permissions');
    }
    
  } finally {
    // Disconnect after test
    await disconnectDB();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

testConnection();
