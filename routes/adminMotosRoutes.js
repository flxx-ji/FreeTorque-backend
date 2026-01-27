const express = require('express');
const router = express.Router();
const Moto = require('../models/moto');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // multer memory
const cloudinary = require('../config/cloudinary');

 


// 🔒 Protège TOUTES les routes admin motos
router.use(authMiddleware);

// ✅ CREATE moto (image = secure_url Cloudinary)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;

    // 🖼️ upload Cloudinary si image envoyée
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        {
          folder: 'free-torque/motos'
        }
      );
      imageUrl = result.secure_url;
    }

    const moto = new Moto({
      ...req.body,
      image: imageUrl,
      tarifs: JSON.parse(req.body.tarifs),
      caracteristiques: JSON.parse(req.body.caracteristiques)
    });

    const saved = await moto.save(); // 🔥 hook tarifs OK
    return res.status(201).json(saved);

  } catch (err) {
    console.error("❌ Erreur création moto :", err);
    return res.status(400).json({
      message: "Erreur création moto",
      error: err.message
    });
  }
});


// ✅ LIST
router.get('/', async (req, res) => {
  try {
    const motos = await Moto.find().sort({ createdAt: -1 });
    return res.json(motos);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ GET by id
router.get('/:id', async (req, res) => {
  try {
    const moto = await Moto.findById(req.params.id);
    if (!moto) return res.status(404).json({ message: "Moto introuvable" });
    return res.json(moto);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ UPDATE (PUT) -> si unJour change, ton hook ne se déclenche PAS sur findByIdAndUpdate
// Donc on fait: findById -> assign -> save()
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const moto = await Moto.findById(req.params.id);
    if (!moto) return res.status(404).json({ message: "Moto introuvable" });

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: 'free-torque/motos' }
      );
      moto.image = result.secure_url;
    }

    Object.assign(moto, {
      ...req.body,
      tarifs: req.body.tarifs ? JSON.parse(req.body.tarifs) : moto.tarifs,
      caracteristiques: req.body.caracteristiques
        ? JSON.parse(req.body.caracteristiques)
        : moto.caracteristiques
    });

    const saved = await moto.save();
    return res.json(saved);

  } catch (err) {
    return res.status(400).json({
      message: "Erreur update moto",
      error: err.message
    });
  }
});


// ✅ DELETE
// ❌ DELETE moto + image Cloudinary
router.delete('/:id', async (req, res) => {
  try {
    const moto = await Moto.findById(req.params.id);
    if (!moto) {
      return res.status(404).json({ message: 'Moto introuvable' });
    }

    // 🧹 Supprimer l’image Cloudinary si elle existe
    if (moto.image) {
      try {
        // on supprime par public_id = dossier + id (comme à l’upload)
        await cloudinary.uploader.destroy(`free-torque/motos/${moto._id}`);
      } catch (e) {
        console.warn('⚠️ Image Cloudinary non supprimée', e.message);
      }
    }

    await moto.deleteOne();

    return res.json({ message: 'Moto supprimée' });
  } catch (err) {
    console.error('❌ Erreur suppression moto', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
