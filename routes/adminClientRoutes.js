const express = require('express');
const router = express.Router();
const Client = require('../models/client');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

router.use(authMiddleware);

/**
 * ===========================
 * GET - Tous les clients
 * ===========================
 */
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération clients" });
  }
});

/**
 * ===========================
 * GET - Client par ID
 * ===========================
 */
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    res.status(200).json(client);

  } catch {
    res.status(500).json({ message: "Erreur récupération client" });
  }
});

/**
 * ===========================
 * POST - Création client
 * ===========================
 */
router.post('/', async (req, res) => {
  try {
    const { nom, prenom, email, telephone, permis } = req.body;

    if (!nom || !prenom || !email || !permis) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    const clientExiste = await Client.findOne({ email });
    if (clientExiste) {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }

    const nouveauClient = new Client({
      nom,
      prenom,
      email,
      telephone,
      permis
    });

    const saved = await nouveauClient.save();
    res.status(201).json(saved);

  } catch (error) {
    res.status(500).json({ message: "Erreur création client" });
  }
});

/**
 * ===========================
 * PUT - Modifier client
 * ===========================
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const updated = await Client.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    res.status(200).json(updated);

  } catch (error) {
    res.status(500).json({ message: "Erreur mise à jour client" });
  }
});

/**
 * ===========================
 * DELETE - Supprimer client
 * ===========================
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const deleted = await Client.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    res.status(200).json({ message: "Client supprimé" });

  } catch {
    res.status(500).json({ message: "Erreur suppression client" });
  }
});

module.exports = router;
