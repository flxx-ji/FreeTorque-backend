const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'tmp/' });

// 🔼 Upload image moto → Cloudinary
router.post(
  '/image',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Aucune image reçue' });
      }

      // 🗑️ Supprimer l’ancienne image si fournie
      const oldPublicId = req.body.oldPublicId;
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (e) {
          console.warn('⚠️ Suppression ancienne image échouée:', e.message);
        }
      }

      // ☁️ Upload nouvelle image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'motos',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      });

      // 🧹 Nettoyage du fichier temporaire
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn('⚠️ Impossible de supprimer le fichier tmp:', e.message);
      }

      return res.status(200).json({
        secure_url: result.secure_url,
        public_id: result.public_id
      });

    } catch (err) {
      console.error('❌ Upload Cloudinary:', err);

      // sécurité : cleanup même en erreur
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (_) {}
      }

      return res.status(500).json({ message: 'Erreur upload image' });
    }
  }
);

module.exports = router;
