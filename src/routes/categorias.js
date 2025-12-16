const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categorias_skill");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ ERRO /api/categorias:", error.message);
    res.status(500).json({ error: "Erro ao buscar categorias" });
  }
});

module.exports = router;
