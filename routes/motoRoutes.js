const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Moto = require('../models/moto');

// 1️⃣ GET /api/motos → Liste publique (SANS cache)
router.get('/', async (req, res) => {
  try {
    const motos = await Moto.find().lean();
    return res.status(200).json(motos);
  } catch (error) {
    console.error("❌ Erreur récupération motos :", error);
    return res.status(500).json({ message: "Erreur récupération motos" });
  }
});

// 2️⃣ GET /api/motos/:id → Détail public
router.get('/:id', async (req, res) => {
  const id = String(req.params.id).trim();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const moto = await Moto.findById(id).lean();
    if (!moto) {
      return res.status(404).json({ message: "Moto non trouvée" });
    }
    return res.status(200).json(moto);
  } catch (error) {
    console.error("❌ Erreur récupération moto :", error);
    return res.status(500).json({ message: "Erreur récupération moto" });
  }
});

module.exports = router;
