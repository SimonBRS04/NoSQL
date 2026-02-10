require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 Connexion Mongo
MongoClient.connect(process.env.MONGO_URI)
  .then(client => {
    console.log("✅ MongoDB connecté");
    app.locals.db = client.db("aroundme"); // IMPORTANT
  })
  .catch(err => {
    console.error("❌ Mongo error", err);
    process.exit(1);
  });

// 🔍 Health check
app.get("/", (req, res) => {
  res.send("API AroundMe OK");
});

// 🌍 ENDPOINT AROUND ME
app.get("/api/places/nearby", async (req, res) => {
  try {
    const db = app.locals.db;
    if (!db) {
      return res.status(503).json({ error: "DB not ready" });
    }

    const {
      lat,
      lng,
      radius = 1000,
      limit = 20,
      page = 1,
      category
    } = req.query;

    // ✅ validation
    if (!lat || !lng) {
      return res.status(400).json({ error: "lat et lng requis" });
    }

    const filter = {
      geometry: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: Math.min(Number(radius), 5000)
        }
      }
    };

    // filtre métier
    if (category) {
      filter["properties.amenity"] = category;
    }

    const places = await db
      .collection("places")
      .find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Math.min(Number(limit), 50))
      .toArray();

    res.json({
      count: places.length,
      data: places
    });

  } catch (err) {
    console.error("❌ API error", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/places/by-address", async (req, res) => {
  try {
    const db = app.locals.db;
    const { street, postal, arrondissement } = req.query;

    if (!street) return res.status(400).json({ error: "Nom de rue requis" });

    const filter = {
      "properties.address": { $regex: street, $options: "i" },
      ...(postal ? { "properties['addr:postcode']": postal } : {}),
      ...(arrondissement ? { "properties['addr:district']": arrondissement } : {})
    };

    const places = await db.collection("places")
      .find(filter)
      .limit(50)
      .toArray();

    res.json({ count: places.length, data: places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔎 Recherche générale (q)
app.get("/api/places/search", async (req, res) => {
  try {
    const db = app.locals.db;
    if (!db) return res.status(503).json({ error: "DB not ready" });

    const { q, limit = 50, page = 1 } = req.query;
    if (!q || String(q).trim() === "") {
      return res.status(400).json({ error: "Paramètre q requis" });
    }

    const term = String(q).trim();
    const regex = { $regex: term, $options: "i" };

    // Rechercher dans plusieurs champs pertinents
    const filter = {
      $or: [
        { "properties.name": regex },
        { "properties.amenity": regex },
        { "properties.address": regex },
        { "properties.phone": regex },
        { "properties.shop": regex },
        { "properties.brand": regex },
        { "properties.operator": regex },
        { "properties['addr:postcode']": regex },
        { "properties['addr:district']": regex }
      ]
    };

    const places = await db.collection("places")
      .find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Math.min(Number(limit), 200))
      .toArray();

    res.json({ count: places.length, data: places });
  } catch (err) {
    console.error("❌ API search error", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// 🚀 Start server
app.listen(3000, () => {
  console.log("🚀 API sur http://localhost:3000");
});
