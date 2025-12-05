// server.js

// 1. CARREGAR VARIÁVEIS DE AMBIENTE
require("dotenv").config();

// 2. IMPORTAR BIBLIOTECAS
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors"); // ✅ IMPORTANDO CORS

const app = express();
const PORT = process.env.PORT || 3000;

// 💡 CONFIGURAÇÃO CORS EXPLÍCITA (RESOLVE O ERRO DE BLOQUEIO DO FRONTEND)
// Definimos as origens permitidas: o localhost (para desenvolvimento) e o domínio de produção.
const allowedOrigins = [
  "http://localhost:4200", // Permite o ambiente de desenvolvimento do Angular
  "https://resume-api-seven-sigma.vercel.app", // ⚠️ DOMÍNIO DE PRODUÇÃO CORRIGIDO
  "https://gesieloliveira.com.br", // Domínio customizado, se houver
];

const corsOptions = {
  // A função de origem verifica se a origem da requisição está na lista
  origin: (origin, callback) => {
    // Permite requisições sem 'origin' (Postman/cURL) ou se estiver na lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Retorna um erro que será visível nos logs da Vercel
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET", // Sua API só precisa de GET por enquanto
  credentials: true,
};

// 3. MIDDLEWARES
app.use(cors(corsOptions)); // ✅ USANDO CORS COM AS OPÇÕES
app.use(express.json());

// 4. CONFIGURAÇÃO DA POOL DE CONEXÃO
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERRO: DATABASE_URL não está configurada no arquivo .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// --- 5. ROTAS DA API ---

// Rota de Status Simples
app.get("/", (req, res) => {
  res.send("✅ Servidor Express Online!");
});

// Rota de Teste e Busca de Dados Simples (Ex: /api/categorias)
app.get("/api/categorias", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categorias_skill");
    res.json(result.rows);
  } catch (error) {
    console.error("\n=============================================");
    console.error("❌ ERRO FATAL DE CONEXÃO/QUERY COM O SUPABASE:");
    console.error(`Detalhe do Erro: ${error.message}`);
    console.error("=============================================\n");
    res.status(500).json({
      error: "Erro no Servidor: Falha ao acessar o Supabase",
      detail: error.message,
    });
  }
});

// ROTA FINAL: Busca categorias, agrupa habilidades e transforma o JSON em Entidades Aninhadas
app.get("/api/skills", async (req, res) => {
  try {
    const query = `
      SELECT
          cs.id AS categoria_id,
          cs.nome AS categoria_nome,
          -- Agrega os IDs e Nomes das habilidades em objetos aninhados
          json_agg(
              json_build_object(
                  'id', s.id, 
                  'nome', s.nome
              )
              ORDER BY s.nome
          ) AS habilidades_agrupadas
      FROM
          categorias_skill cs
      LEFT JOIN
          skills s ON cs.id = s.categoria_id
      GROUP BY
          cs.id, cs.nome
      ORDER BY
          cs.nome;
    `;

    const result = await pool.query(query);

    const formattedData = result.rows.map((row) => {
      const habilidades_limpas =
        row.habilidades_agrupadas[0].id === null
          ? []
          : row.habilidades_agrupadas;

      return {
        skill: {
          id: row.categoria_id,
          nome: row.categoria_nome,
        },
        habilidades: habilidades_limpas,
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error("\n=============================================");
    console.error("❌ ERRO FATAL DE CONEXÃO/QUERY COM O SUPABASE:");
    console.error(`Detalhe do Erro: ${error.message}`);
    console.error("=============================================\n");

    res.status(500).json({
      error: "Erro no Servidor: Falha ao acessar o Supabase",
      detail: error.message,
    });
  }
});

// 5. INICIAR O SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`Testar endpoint: http://localhost:${PORT}/api/skills`);
});
