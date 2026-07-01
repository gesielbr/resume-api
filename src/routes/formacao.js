const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const query = `
      SELECT 
        id,
        curso,
        curso_en,
        curso_es,
        instituicao,
        instituicao_en,
        instituicao_es,
        periodo,
        periodo_en,
        periodo_es,
        priority
      FROM formacao
      ORDER BY priority ASC, id ASC;
    `;

    const result = await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error("❌ ERRO /api/formacao:", error.message);
    res.status(500).json({ error: "Erro ao buscar formação" });
  }
});

module.exports = router;
