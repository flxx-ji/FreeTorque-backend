require("events").EventEmitter.defaultMaxListeners = 20;

// 🌍 Chargement des variables d'environnement
const dotenv = require("dotenv");
dotenv.config();

// 📦 Imports
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose"); // utile pour le SIGINT
const connectDB = require("./config/db.js");
const checkEnvVariables = require("./utils/checkEnv.js");

// 🛣️ Import des routes
const motoRoutes = require("./routes/motoRoutes");
 const reservationRoutes = require("./routes/reservationRoutes.js");
const clientRoutes = require("./routes/clientRoutes.js");
const adminMotosRoutes = require("./routes/adminMotosRoutes.js");
const adminClientRoutes = require("./routes/adminClientRoutes.js");
const adminReservationRoutes = require("./routes/adminReservationRoutes.js");
const adminAuthRoutes = require("./routes/adminAuthRoutes.js");
const adminUploadRoutes = require("./routes/adminUploadRoutes");
const cookieParser = require('cookie-parser');



// const pagesRoutes = require("./routes/pagesRoutes"); // tu peux le remettre si tu l’utilises

// ✅ Vérification des variables d'env
checkEnvVariables();

// 🔌 Connexion à la base MongoDB
connectDB();

// ✅ Initialisation d'Express
const app = express();

// ❌ Stripe & webhook – SUPPRIMÉ pour la démo
// app.post(
//   '/webhook',
//   express.raw({ type: 'application/json' }),
//   require('./routes/stripeWebhook')
// );
// app.use('/api/stripe/webhook', require('./routes/stripeRoutes.js'));

// 🌍 CORS
app.use(
  cors({
    origin: ["http://localhost:5173",
            "https://ryd-custom-motorcycle.netlify.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 📂 Fichiers statiques : images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🧠 JSON Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// 🔒 Sécurité : limiter les méthodes HTTP autorisées
app.use((req, res, next) => {
  const allowed = ['GET', 'POST', 'PUT', 'DELETE'];

  if (!allowed.includes(req.method)) {
    return res.status(405).json({
      message: '⛔ Méthode non autorisée'
    });
  }

  next();
});




// ✅ Route de ping pour UptimeRobot
app.get("/api/ping", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 🌐 Routes API
app.get("/", (req, res) => {
  res.send("🚀 API Free Torque est en ligne !");
});

app.use("/api/motos", motoRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/reservations", reservationRoutes);

// 🔐 Routes admin
app.use("/api/admin/motos", adminMotosRoutes);
app.use("/api/admin/clients", adminClientRoutes);
app.use("/api/admin/reservations", adminReservationRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminUploadRoutes);


// 🔌 Gestion propre SIGINT
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🟢 Connexion MongoDB fermée proprement (SIGINT)");
  process.exit(0);
});

// 🚀 Lancer le serveur
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur le port ${PORT}`);
  });
}

module.exports = app;
