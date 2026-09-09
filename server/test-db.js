/* TEMP test — DB connection verify karne ke liye (baad me delete ho jayega) */
require('dotenv').config();
const mongoose = require('mongoose');

let uri = process.env.MONGO_URI;
console.log('URI found:', uri ? uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'MISSING!');

if (uri && uri.includes('.mongodb.net/?')) {
  uri = uri.replace('.mongodb.net/?', '.mongodb.net/super-collection?');
  console.log('DB name missing tha — "/super-collection" add karke test kar raha hoon...');
}

mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
  .then(async (conn) => {
    console.log('✅ CONNECTED to host:', conn.connection.host);
    console.log('   Database name:', conn.connection.name);
    const cols = await mongoose.connection.db.listCollections().toArray();
    console.log('   Collections:', cols.length ? cols.map((c) => c.name).join(', ') : '(khali hai — seed karna padega)');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ CONNECTION FAILED:', e.message);
    process.exit(1);
  });
