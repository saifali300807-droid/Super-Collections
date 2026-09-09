require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

connectDB();

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser()); // httpOnly auth cookie (sc_token) parse karne ke liye

// Basic security headers (zero dependency approach)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// CORS — allow the deployed client (CLIENT_URL) + localhost dev fallback.
// CLIENT_URL comma-separated bhi ho sakta hai; trailing slash harmless hai.
const parseOrigins = (val) =>
  String(val || '')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);

const corsOrigins = [...parseOrigins(process.env.CLIENT_URL), 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({ origin: corsOrigins, credentials: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Serve uploaded images — uploadController writes to server/src/uploads
// (path.join(controllers __dirname, '..', 'uploads')), so the static root
// MUST resolve to the same directory. Unique filenames = immutable assets,
// isliye 1-year browser cache safe hai (no stale-content risk on update).
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '365d',
  immutable: true,
  setHeaders(res, path) {
    if (path.match(/\.(png|jpe?g|webp|gif|avif|mp4|webm|mov|avi)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Super Collection API is running 👑' }));

// Serve client build (production)
if (process.env.NODE_ENV === 'production') {
  // __dirname = server/src → 2 level up = client/dist
  const build = path.join(__dirname, '..', '..', 'client', 'dist');
  if (require('fs').existsSync(build)) {
    app.use(express.static(build));
    app.get('*', (req, res) => res.sendFile(path.join(build, 'index.html')));
  } else {
    console.log('⚠️  client/dist nahi mila — sirf API mode me chal raha hai. Pehle `npm run build` chalao.');
  }
}

app.use(notFound);
app.use(errorHandler);

// Socket.io for real-time updates
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`👑 Super Collection server running on port ${PORT}`);
  if (!process.env.RAZORPAY_KEY_ID) console.log('⚠️  Razorpay keys not set — payments run in DEMO mode');
  if (!process.env.SMTP_HOST) console.log('⚠️  SMTP not set — verification links print in server console');
});
