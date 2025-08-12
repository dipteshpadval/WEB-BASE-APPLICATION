const { connectDB } = require('../config/mongodb');
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log(`Username: ${existingAdmin.username}`);
      console.log(`Email: ${existingAdmin.email}`);
      return;
    }
    
    // Create default admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@excelmanager.com',
      password: 'admin123', // This will be hashed automatically
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log(`Username: ${adminUser.username}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: admin123`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    process.exit(0);
  }
};

createAdminUser();
