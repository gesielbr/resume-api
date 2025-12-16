const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT id, curso, instituicao, periodo
      FROM formacao
      ORDER BY id ASC;
    `;

    const result = await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error("❌ ERRO /api/formacao:", error.message);
    res.status(500).json({ error: "Erro ao buscar formação" });
  }
});

module.exports = router;
