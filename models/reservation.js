const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },

  motoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Moto',
    required: true
  },

  nomMoto: {
    type: String,
    required: true
  },

  dateDebut: {
    type: Date,
    required: true
  },

  dateFin: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.dateDebut;
      },
      message: "La date de fin doit être après la date de début."
    }
  },

  heureDebut: {
    type: String,
    required: true
  },

  heureFin: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  telephone: {
    type: String,
    required: true,
    trim: true
  },

  prixTotal: {
    type: Number,
    required: true,
    min: 0
  },

  statut: {
    type: String,
    enum: [
      'en attente',
      'confirmée',
      'annulée',
      'terminée'
    ],
    default: 'en attente'
  },

  commentaireAdmin: {
    type: String,
    default: null
  }

}, { timestamps: true });

/* 🔎 INDEXES (important pour scale futur) */
reservationSchema.index({ motoId: 1 });
reservationSchema.index({ clientId: 1 });
reservationSchema.index({ statut: 1 });
reservationSchema.index({ dateDebut: 1, dateFin: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
