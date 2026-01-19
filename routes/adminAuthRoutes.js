const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Admin = require('../models/admin');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * =========================
 * POST /api/admin/register
 * =========================
 * Création d'un admin
 * ⚠️ À désactiver en prod réelle
 */
router.post('/register', async (req, res) => {
  const { nom, email, password } = req.body;

  if (!nom || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    const adminExiste = await Admin.findOne({ email });
    if (adminExiste) {
      return res.status(409).json({ message: 'Un admin existe déjà avec cet email.' });
    }

    const nouvelAdmin = new Admin({ nom, email, password });
    await nouvelAdmin.save();

    res.status(201).json({
      message: 'Admin enregistré avec succès',
      admin: {
        id: nouvelAdmin._id,
        nom: nouvelAdmin.nom,
        email: nouvelAdmin.email
      }
    });
  } catch (error) {
    console.error('❌ Erreur register admin :', error);
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
});

/**
 * ======================
 * POST /api/admin/login
 * ======================
 * Connexion admin + génération JWT
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin non trouvé.' });
    }

    const passwordMatch = await admin.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    // 🔐 Génération du JWT ADMIN
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        nom: admin.nom,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Connexion réussie',
      token,
      admin: {
        nom: admin.nom,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('❌ Erreur login admin :', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

/**
 * ===========================
 * GET /api/admin/protected
 * ===========================
 * Route test pour vérifier le token
 */
router.get('/protected', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('nom email');
    if (!admin) {
      return res.status(404).json({ message: 'Admin introuvable' });
    }

    res.status(200).json({
      message: 'Accès autorisé',
      admin
    });
  } catch (error) {
    console.error('❌ Erreur /protected :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
