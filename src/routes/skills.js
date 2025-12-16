const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT
          cs.id AS categoria_id,
          cs.nome AS categoria_nome,
          json_agg(
              json_build_object(
                  'id', s.id, 
                  'nome', s.nome
              )
              ORDER BY s.nome
          ) AS habilidades_agrupadas
      FROM categorias_skill cs
      LEFT JOIN skills s ON cs.id = s.categoria_id
      GROUP BY cs.id, cs.nome
      ORDER BY cs.nome;
    `;

    const result = await pool.query(query);

    const formattedData = result.rows.map((row) => ({
      skill: {
        id: row.categoria_id,
        nome: row.categoria_nome,
      },
      habilidades:
        row.habilidades_agrupadas[0].id === null
          ? []
          : row.habilidades_agrupadas,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("❌ ERRO /api/skills:", error.message);
    res.status(500).json({ error: "Erro ao buscar skills" });
  }
});

module.exports = router;
