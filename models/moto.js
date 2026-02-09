const mongoose = require('mongoose');

const motoSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  marque: {
    type: String,
    required: true,
    trim: true
  },
  modele: {
    type: String,
    required: true,
    trim: true
  },
  annee: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear()
  },
  couleur: {
    type: String,
    required: true
  },

  tarifs: {
    unJour: { type: Number, required: true },
    deuxTroisJours: { type: Number },
    quatreCinqJours: { type: Number },
    uneSemaine: { type: Number }
  },

  disponible: {
    type: Boolean,
    default: true
  },

  image: {
    url: { type: String, default: null },
    public_id: { type: String, default: null }
  },

  caracteristiques: {
    moteur: { type: String, default: "Non spécifié" },
    cylindree: { type: String, default: "Non spécifié" },
    transmission: { type: String, default: "Non spécifié" },
    poids: { type: String, default: "Non spécifié" },
    autonomie: { type: String, default: "Non spécifié" },
    reservoir: { type: String, default: "Non spécifié" }
  },

  equipements: {
    type: [String],
    default: ["Casque", "Gants", "GPS", "Gopro", "Carte Sd", "Combi de pluie"]
  }

}, { timestamps: true, strict: true });


// 🔐 Calcul automatique des tarifs
motoSchema.pre('save', function (next) {
  if (this.isModified('tarifs.unJour')) {
    const unJour = this.tarifs.unJour;

    this.tarifs.deuxTroisJours =
      Math.round((unJour * 2 + unJour * 0.8) * 100) / 100;

    this.tarifs.quatreCinqJours =
      Math.round((unJour * 4 + unJour * 0.8) * 100) / 100;

    this.tarifs.uneSemaine =
      Math.round(unJour * 6);
  }

  next();
});

module.exports = mongoose.models.Moto || mongoose.model('Moto', motoSchema);
