const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'tmp/' });

// 🔼 Upload image moto → Cloudinary
router.post(
  '/image',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "❌ Aucune image reçue" });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'motos',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      });

      res.status(200).json({
        secure_url: result.secure_url,
        public_id: result.public_id
      });

    } catch (err) {
      console.error("❌ Upload Cloudinary :", err);
      res.status(500).json({ message: "Erreur upload image" });
    }
  }
);

module.exports = router;
