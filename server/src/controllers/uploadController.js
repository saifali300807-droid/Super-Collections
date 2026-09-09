const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

/* Mimetype → extension map. Extension original file name se nahi lete —
   ye stored-XSS/bad-files se bachata hai aur har file ka expected format ensure karta hai. */
const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

/* Har upload ke liye UNIQUE filename: timestamp + random hex suffix.
   Loop until the generated name does NOT already exist on disk — this
   guarantees two uploads in the same millisecond can never collide and
   an existing file is never overwritten. */
const uniqueFilename = (ext) => {
  let name;
  do {
    name = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  } while (fs.existsSync(path.join(uploadDir, name)));
  return name;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = MIME_EXT[file.mimetype] || path.extname(file.originalname).toLowerCase();
    cb(null, uniqueFilename(ext));
  },
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpe?g|png|webp|gif|avif)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const videoUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB for videos
  fileFilter: (req, file, cb) => {
    if (/^video\/(mp4|webm|quicktime)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only video files (mp4, webm, mov) are allowed'));
  },
});

/* Uploaded file ka RELATIVE URL banao (e.g. /uploads/x.jpeg).
   Full machine URL (http://localhost:5000/...) store karne se problem hoti hai:
   • mobile/tablet se LAN access par image nahi dikhti
   • production (https) par mixed-content request block ho jati hai
   Relative URL same-origin se serve hota hai — dev me Vite proxy (/uploads → backend)
   aur production me same domain, isliye hamesha chalega. */
const fileUrl = (req, filename) => `/uploads/${filename}`;

// @route POST /api/upload (admin) — single image, returns its URL
exports.uploadImage = [
  imageUpload.single('image'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file received' });
    res.status(201).json({ success: true, url: fileUrl(req, req.file.filename) });
  },
];

// @route POST /api/upload/many (admin) — multiple images, returns URL array
exports.uploadImages = [
  imageUpload.array('images', 10),
  (req, res) => {
    if (!req.files?.length) return res.status(400).json({ success: false, message: 'No image files received' });
    res.status(201).json({ success: true, urls: req.files.map((f) => fileUrl(req, f.filename)) });
  },
];

// @route POST /api/upload/video (admin) — single video, returns its URL
exports.uploadVideo = [
  videoUpload.single('video'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video file received' });
    res.status(201).json({ success: true, url: fileUrl(req, req.file.filename) });
  },
];

/* Exposed for verification/tests only — not used by routes */
exports._uniqueFilename = uniqueFilename;
exports._storage = storage;
