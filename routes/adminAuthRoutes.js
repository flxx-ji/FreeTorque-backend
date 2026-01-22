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
 * ⚠️ DEV / SETUP UNIQUEMENT
 */
router.post('/register', async (req, res) => {
  const { nom, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email et mot de passe requis.'
    });
  }

  try {
    const adminExiste = await Admin.findOne({ email });
    if (adminExiste) {
      return res.status(409).json({
        message: 'Un admin existe déjà avec cet email.'
      });
    }

    const nouvelAdmin = new Admin({
      nom: nom || 'Admin',
      email,
      password
    });

    await nouvelAdmin.save();

    return res.status(201).json({
      message: 'Admin enregistré avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur register admin :', error);
    return res.status(500).json({
      message: "Erreur lors de l'inscription"
    });
  }
});

/**
 * ======================
 * POST /api/admin/login
 * ======================
 * Connexion admin + JWT + cookie httpOnly
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email et mot de passe requis.'
    });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        message: 'Admin non trouvé.'
      });
    }

    const passwordMatch = await admin.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Mot de passe incorrect.'
      });
    }

    // 🔐 JWT ADMIN
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

    // 🍪 COOKIE HTTP-ONLY (clé côté serveur)
    res.cookie('adminToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // true en prod HTTPS
      path: '/',
      maxAge: 2 * 60 * 60 * 1000 // 2h
    });

    return res.status(200).json({
      message: 'Connexion réussie',
      token, // utile côté front (UX)
      admin: {
        nom: admin.nom,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('❌ Erreur login admin :', error);
    return res.status(500).json({
      message: 'Erreur lors de la connexion'
    });
  }
});

/**
 * ======================
 * POST /api/admin/logout
 * ======================
 * Déconnexion admin
 */
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken', { path: '/' });

  return res.status(200).json({
    message: 'Déconnexion réussie'
  });
});

/**
 * ===========================
 * GET /api/admin/protected
 * ===========================
 * Route test token
 */
router.get('/protected', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('nom email');
    if (!admin) {
      return res.status(404).json({
        message: 'Admin introuvable'
      });
    }

    return res.status(200).json({
      message: 'Accès autorisé',
      admin
    });
  } catch (error) {
    console.error('❌ Erreur /protected :', error);
    return res.status(500).json({
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
