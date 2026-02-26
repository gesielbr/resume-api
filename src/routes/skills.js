const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = `
  SELECT
      cs.id AS categoria_id,
      cs.nome AS categoria_nome,
      cs.nome_en AS categoria_nome_en,
      cs.nome_es AS categoria_nome_es,
      json_agg(
          json_build_object(
              'id', s.id,
              'nome', s.nome,
              'nome_en', s.nome_en,
              'nome_es', s.nome_es
          )
          ORDER BY s.nome
      ) AS habilidades_agrupadas
  FROM categorias_skill cs
  LEFT JOIN skills s ON cs.id = s.categoria_id
  GROUP BY cs.id, cs.nome, cs.nome_en, cs.nome_es
  ORDER BY cs.nome;
`;

    const result = await pool.query(query);

    const lang = String(req.query.lang || "pt").toLowerCase();

    const pickName = (row) => {
      if (lang === "en") return row.nome_en || row.nome;
      if (lang === "es") return row.nome_es || row.nome;
      return row.nome;
    };

    const formattedData = result.rows.map((row) => {
      const habilidades =
        row.habilidades_agrupadas?.[0]?.id === null
          ? []
          : row.habilidades_agrupadas;

      return {
        skill: {
          id: row.categoria_id,
          nome: pickName({
            nome: row.categoria_nome,
            nome_en: row.categoria_nome_en,
            nome_es: row.categoria_nome_es,
          }),
        },
        habilidades: habilidades.map((h) => ({
          id: h.id,
          nome: pickName(h),
        })),
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error("❌ ERRO /api/skills:", error.message);
    res.status(500).json({ error: "Erro ao buscar skills" });
  }
});

module.exports = router;
