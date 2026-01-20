const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Moto = require('../models/moto.js');

// ✅ mini cache mémoire (1 min)
const CACHE_TTL_MS = 60_000;
let cache = {
  expires: 0,
  data: null
};

function invalidateCache() {
  cache.expires = 0;
  cache.data = null;
}

// 1️⃣ GET /api/motos → Liste (PUBLIC) + cache + headers
router.get('/', async (req, res) => {
  try {
    const motos = await Moto.find().lean();
    return res.status(200).json(motos);
  } catch (error) {
    return res.status(500).json({ message: "Erreur récupération motos" });
  }
});


    const motos = await Moto.find().lean(); // lean = plus rapide
    cache.data = motos;
    cache.expires = Date.now() + CACHE_TTL_MS;

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(motos);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération des motos", error });
  }
});

// 2️⃣ GET /api/motos/:id → Détail (PUBLIC)
router.get('/:id', async (req, res) => {
  const id = String(req.params.id).trim();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const moto = await Moto.findById(id).lean();
    if (!moto) return res.status(404).json({ message: "Moto non trouvée" });
    return res.status(200).json(moto);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération de la moto", error });
  }
});

module.exports = { router, invalidateCache};
