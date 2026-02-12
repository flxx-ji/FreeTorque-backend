const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, "Le nom du client est requis"],
    trim: true
  },

  prenom: {
    type: String,
    required: [true, "Le prénom du client est requis"],
    trim: true
  },

  email: {
    type: String,
    required: [true, "L'email du client est requis"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "L'email fourni n'est pas valide"]
  },

  telephone: {
    type: String,
    trim: true,
    default: null
  },

  permis: {
    type: String,
    required: [true, "Le type de permis est requis"],
    enum: ['A', 'A2'],
    uppercase: true,
    trim: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
