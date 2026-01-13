const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


if (process.env.NODE_ENV === 'production') {
  console.log("❌ Seed bloqué en production");
  process.exit(1);
}
 
const connectDB = require('./config/db');
const Moto = require('./models/moto');

const motos = [
  {
    nom: "CRUISE",
    marque: "Harley-Davidson",
    modele: "Street Glide",
    annee: 2025,
    couleur: "Noir",
    tarifs: { unJour: 180 },
    image: "https://res.cloudinary.com/dlafo7ne1/image/upload/v1768313677/cruise_j68fhs.webp",
    disponible: true,
    caracteristiques: {
      moteur: "Milwaukee-Eight 117",
      cylindree: "1923",
      transmission: "Chaîne (34/46)",
      poids: "380",
      autonomie: "378",
      reservoir: "22.7"
    },
    equipements: ["Casque", "Gants", "GPS", "GoPro", "Combi Pluie", "Carte sd"]
  },
  {
    nom: "BRAD",
    marque: "Harley-Davidson",
    modele: "Road Glide",
    annee: 2025,
    couleur: "Bleu metallique",
    tarifs: { unJour: 175 },
    image: "https://res.cloudinary.com/dlafo7ne1/image/upload/v1768313677/brad_cqw9mg.webp",
    disponible: true,
    caracteristiques: {
      moteur: "Milwaukee-Eight 114",
      cylindree: "1868",
      transmission: "Entraînement par courroie",
      poids: "387",
      autonomie: "350",
      reservoir: "22.7"
    },
    equipements: ["Casque", "Gants", "GPS", "GoPro", "Combi Pluie", "Carte sd"]
  },
  {
    nom: "NEO",
    marque: "Ducati",
    modele: "Multistrada",
    annee: 2025,
    couleur: "Rouge",
    tarifs: { unJour: 175 },
    image: "https://res.cloudinary.com/dlafo7ne1/image/upload/v1768313778/neo_qysy7w.webp",
    disponible: true,
    caracteristiques: {
      moteur: "Moteur Ducati V2",
      cylindree: "890",
      transmission: "6 vitesses",
      poids: "199",
      autonomie: "339",
      reservoir: "19"
    },
    equipements: ["Casque", "Gants", "GPS", "GoPro", "Combi Pluie", "Carte sd"]
  },
  {
    nom: "JASON",
    marque: "Harley-Davidson",
    modele: "Panamérica",
    annee: 2025,
    couleur: "Bleu",
    tarifs: { unJour: 160 },
    image: "https://res.cloudinary.com/dlafo7ne1/image/upload/v1768313810/jason_hnlzbv.webp",
    disponible: true,
    caracteristiques: {
      moteur: "Revolution Max 1250",
      cylindree: "1252",
      transmission: "6 vitesses",
      poids: "299",
      autonomie: "339",
      reservoir: "21"
    },
    equipements: ["Casque", "Gants", "GPS", "GoPro", "Combi Pluie", "Carte sd"]
  },
  {
    nom: "McQueen",
    marque: "Triumph",
    modele: "Bonnevile boober TFC",
    annee: 2025,
    couleur: "Noir",
    tarifs: { unJour: 140 },
    image: "https://res.cloudinary.com/dlafo7ne1/image/upload/v1768313677/mcqueen_j2dykt.webp",
    disponible: true,
    caracteristiques: {
      moteur: "Twin parallele",
      cylindree: "1200cc",
      transmission: "6 vitesses",
      poids: "237",
      autonomie: "288",
      reservoir: "9"
    },
    equipements: ["Casque", "Gants", "GPS", "GoPro", "Combi Pluie", "Carte sd"]
  },
  {
    nom: "King",
    marque: "Triumph",
    modele: "Bonnevile T120",
    annee: 2025,
    couleur: "Noir",
    tarifs: { unJour: 140 },
    image: "https://res.cloudinary.com/dlafo7ne1/image/upload/v1768313677/king_d0hgwp.avif",
    disponible: true,
    caracteristiques: {
      moteur: "Twin parallele",
      cylindree: "1200cc",
      transmission: "6 vitesses",
      poids: "237",
      autonomie: "288",
      reservoir: "14.5"
    },
    equipements: ["Casque", "Gants", "GPS", "GoPro", "Combi Pluie", "Carte sd"]
  }
];

async function seed() {
  try {
    await connectDB();

    await Moto.deleteMany();
    console.log("🔄 Anciennes motos supprimées.");

    // IMPORTANT: create() déclenche les hooks pre('save')
    for (const moto of motos) {
      await Moto.create(moto);
    }

    console.log("✅ Seed terminé : motos insérées avec tarifs auto-calculés.");
  } catch (err) {
    console.error("❌ Erreur seed :", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connexion MongoDB fermée.");
  }
}

seed();
