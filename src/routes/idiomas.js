const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const lang = String(req.query.lang || "pt").toLowerCase();

    const query = `
      SELECT
        id,
        idioma_pt,
        idioma_en,
        idioma_es,
        nivel_pt,
        nivel_en,
        nivel_es,
        ordem,
        ativo
      FROM idiomas
      WHERE ativo = true
      ORDER BY ordem ASC, id ASC;
    `;

    const result = await pool.query(query);

    const pickIdioma = (row) => {
      if (lang === "en") return row.idioma_en || row.idioma_pt;
      if (lang === "es") return row.idioma_es || row.idioma_pt;
      return row.idioma_pt;
    };

    const pickNivel = (row) => {
      if (lang === "en") return row.nivel_en || row.nivel_pt;
      if (lang === "es") return row.nivel_es || row.nivel_pt;
      return row.nivel_pt;
    };

    const formattedData = result.rows.map((row) => ({
      id: row.id,
      idioma: pickIdioma(row),
      nivel: pickNivel(row),
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("❌ ERRO /api/idiomas:", error.message);
    res.status(500).json({ error: "Erro ao buscar idiomas" });
  }
});

module.exports = router;
