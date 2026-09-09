const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/super-collection';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`❌ MongoDB Error: ${err.message}`);
      process.exit(1);
    }
    // Dev fallback: local MongoDB na mile to in-memory instance start karo
    console.warn('⚠️  Local MongoDB (127.0.0.1:27017) not reachable — starting IN-MEMORY MongoDB (dev fallback)...');
    console.warn('⚠️  IN-MEMORY DB WARNING: data sirf tab tak save rehta hai jab tak server chal raha hai.');
    console.warn('⚠️  Store EMPTY hoga (koi demo data seed nahi hota).');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    await mongoose.connect(mem.getUri('super-collection'));
    console.log('✅ In-memory MongoDB started (empty DB)');
  }
};

module.exports = connectDB;

