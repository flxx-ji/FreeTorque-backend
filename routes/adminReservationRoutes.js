const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const Moto = require('../models/moto');
const Reservation = require('../models/reservation');
const { calculatePrice } = require('../utils/calculatePrice');
const authMiddleware = require('../middleware/authMiddleware');

// 🔒 PROTECTION TOTALE ADMIN
router.use(authMiddleware);

/* ===============================
   📋 GET ALL RESERVATIONS (ADMIN)
=================================*/
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('clientId', 'nom prenom email')
      .populate('motoId', 'nom marque modele')
      .sort({ createdAt: -1 });

    res.status(200).json(reservations);
  } catch (error) {
    console.error("❌ Erreur récupération réservations :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* ===============================
   🔍 GET ONE RESERVATION
=================================*/
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('clientId')
      .populate('motoId');

    if (!reservation)
      return res.status(404).json({ message: "Réservation introuvable" });

    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* ===============================
   ✏️ UPDATE RESERVATION
=================================*/
router.put('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation)
      return res.status(404).json({ message: "Réservation introuvable" });

    Object.assign(reservation, req.body);

    await reservation.save();

    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* ===============================
   🗑️ DELETE RESERVATION
=================================*/
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Réservation introuvable" });

    res.status(200).json({ message: "Réservation supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
