// server.js

// 1. CARREGAR VARIÁVEIS DE AMBIENTE
require("dotenv").config();

// 2. IMPORTAR BIBLIOTECAS
const express = require("express");
const { Pool } = require("pg"); // Cliente de conexão PostgreSQL

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Permite que o Express leia o corpo das requisições JSON
app.use(express.json());

// 3. CONFIGURAÇÃO DA POOL DE CONEXÃO
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERRO: DATABASE_URL não está configurada no arquivo .env");
  process.exit(1); // Encerra o servidor se a variável crítica não estiver presente
}

const pool = new Pool({
  connectionString: connectionString,

  // CONFIGURAÇÃO ESSENCIAL PARA O SUPABASE POOLER (Habilita SSL)
  ssl: {
    rejectUnauthorized: false, // Permite conexão SSL
  },
});

// --- 4. ROTAS DA API ---

// Rota de Status Simples
app.get("/", (req, res) => {
  res.send("✅ Servidor Express Online!");
});

// Rota de Teste e Busca de Dados Simples
// ⚠️ ALTERADO: Mudamos a rota para o padrão de API /api/categorias
app.get("/api/categorias", async (req, res) => {
  try {
    // ⚠️ ATENÇÃO: Verifique o nome da tabela no Supabase!
    // Se o nome no banco tiver maiúsculas, use aspas duplas: '"Categorias_Skill"'
    const result = await pool.query("SELECT * FROM categorias_skill");

    // Se a consulta for bem-sucedida, retorna os dados
    res.json(result.rows);
  } catch (error) {
    // Usei 'error' em vez de 'err' para consistência

    // 💥 AQUI É ONDE O ERRO DETALHADO APARECE NO SEU TERMINAL 💥
    console.error("\n=============================================");
    console.error("❌ ERRO FATAL DE CONEXÃO/QUERY COM O SUPABASE:");
    console.error(`Detalhe do Erro: ${error.message}`);
    console.error("=============================================\n");

    // Enviamos o erro detalhado de volta ao cliente para facilitar o debug
    res.status(500).json({
      error: "Erro no Servidor: Falha ao acessar o Supabase",
      detail: error.message,
    });
  }
});

// ROTA FINAL: Busca categorias, agrupa habilidades e transforma o JSON em Entidades Aninhadas
app.get("/api/skills", async (req, res) => {
  try {
    // Query SQL que seleciona todos os campos necessários para a Entidade
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

    // 💡 TRANSFORMAÇÃO JAVASCRIPT: Mapeia o resultado do DB para o formato final de Entidade
    const formattedData = result.rows.map((row) => {
      // 1. Trata o caso de array vazio: Se a primeira habilidade for nula, retorna array vazio [].
      const habilidades_limpas =
        row.habilidades_agrupadas[0].id === null
          ? []
          : row.habilidades_agrupadas;

      // 2. Cria o objeto final da Entidade, aninhando a Categoria (skill)
      return {
        skill: {
          // <-- NOVO OBJETO ANINHADO PARA A SKILL (CATEGORIA)
          id: row.categoria_id,
          nome: row.categoria_nome,
        },
        habilidades: habilidades_limpas, // <-- ARRAY DE RELACIONAMENTO
      };
    });

    // Retorna o JSON transformado
    res.json(formattedData);
  } catch (error) {
    // 💥 AQUI É ONDE O ERRO DETALHADO APARECE NO SEU TERMINAL 💥
    console.error("\n=============================================");
    console.error("❌ ERRO FATAL DE CONEXÃO/QUERY COM O SUPABASE:");
    console.error(`Detalhe do Erro: ${error.message}`);
    console.error("=============================================\n");

    // Enviamos o erro detalhado de volta ao cliente para facilitar o debug
    res.status(500).json({
      error: "Erro no Servidor: Falha ao acessar o Supabase",
      detail: error.message,
    });
  }
});

// 5. INICIAR O SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  // ⚠️ ALTERADO: Novo endpoint para testar
  console.log(`Testar endpoint: http://localhost:${PORT}/api/categorias`);
});
