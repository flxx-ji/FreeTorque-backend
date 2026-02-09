const express = require('express');
const router = express.Router();
const Moto = require('../models/moto');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

router.use(authMiddleware);

// ➕ CREATE
router.post('/', async (req, res) => {
  try {
    const moto = new Moto(req.body);
    const saved = await moto.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Erreur création moto" });
  }
});

// 📋 LIST
router.get('/', async (req, res) => {
  const motos = await Moto.find().sort({ createdAt: -1 });
  res.json(motos);
});

// ✏️ UPDATE
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const moto = await Moto.findById(req.params.id);
    if (!moto) {
      return res.status(404).json({ message: "Moto introuvable" });
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: 'free-torque/motos' }
      );

      moto.image = {
        url: result.secure_url,
        public_id: result.public_id
      };
    }

    Object.assign(moto, req.body);
    const saved = await moto.save();

    res.json(saved);
  } catch (err) {
    res.status(400).json({ message: "Erreur update moto" });
  }
});

// 🗑️ DELETE (verrouillé)
router.delete('/:id', async (req, res) => {
  const moto = await Moto.findById(req.params.id);

  if (!moto) {
    return res.status(404).json({ message: "Moto introuvable" });
  }

  if (!moto.disponible) {
    return res.status(403).json({
      message: "⛔ Impossible de supprimer une moto indisponible"
    });
  }

  if (moto.image?.public_id) {
    await cloudinary.uploader.destroy(moto.image.public_id);
  }

  await moto.deleteOne();
  res.json({ message: "Moto supprimée" });
});

module.exports = router;
