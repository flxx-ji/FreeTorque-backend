// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔐 Header Authorization reçu :", authHeader);

  // 🛑 Vérification présence et format du header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "⛔ Aucun token fourni ou format invalide." });
  }

  const token = authHeader.split(' ')[1];
  console.log("🟠 Token extrait :", token);

  // 🛑 Vérifie que la clé secrète est bien définie
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET manquant !");
    return res.status(500).json({ message: "Erreur serveur : JWT_SECRET manquant." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token décodé :", decoded);

    // 🔐 SÉCURITÉ ADMIN
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: "⛔ Accès interdit (admin requis)." });
    }

    // Injection des infos utiles
    req.adminId = decoded.id;
    req.admin = decoded;

    next();
  } catch (error) {
    console.error("❌ Erreur JWT :", error.name);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "⏰ Token expiré. Veuillez vous reconnecter." });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "❌ Token invalide." });
    }

    return res.status(500).json({ message: "Erreur interne d'authentification." });
  }
};

module.exports = authMiddleware;
