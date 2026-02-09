const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({
      message: "⛔ Authentification requise"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        message: "⛔ Accès admin requis"
      });
    }

    req.adminId = decoded.id;
    req.admin = decoded;
    next();

  } catch (err) {
    return res.status(401).json({
      message: "⛔ Session invalide ou expirée"
    });
  }
};
