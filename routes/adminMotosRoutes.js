const express = require('express');
const router = express.Router();
const Moto = require('../models/moto');
const authMiddleware = require('../middleware/authMiddleware');

// 🔒 Protège TOUTES les routes admin motos
router.use(authMiddleware);

// ✅ CREATE moto (image = secure_url Cloudinary)
router.post('/', async (req, res) => {
  try {
    const moto = new Moto(req.body);
    const saved = await moto.save(); // ✅ déclenche ton pre('save') -> calcule tarifs auto
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
router.put('/:id', async (req, res) => {
  try {
    const moto = await Moto.findById(req.params.id);
    if (!moto) return res.status(404).json({ message: "Moto introuvable" });

    Object.assign(moto, req.body);

    const saved = await moto.save(); // ✅ déclenche pre('save') -> recalcul tarifs
    return res.json(saved);
  } catch (err) {
    return res.status(400).json({ message: "Erreur update moto", error: err.message });
  }
});

// ✅ DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Moto.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Moto introuvable" });
    return res.json({ message: "Moto supprimée" });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
