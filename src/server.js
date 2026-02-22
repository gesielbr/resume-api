require("dotenv").config();

const express = require("express");
const cors = require("cors");

const categoriasRoutes = require("./routes/categorias");
const skillsRoutes = require("./routes/skills");
const formacaoRoutes = require("./routes/formacao");
const experiencesRoutes = require("./routes/experiences");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota base
app.get("/", (req, res) => {
  res.send("✅ Servidor Express Online!");
});

// Disable caching for GET requests to ensure fresh data from Supabase (avoids Vercel CDN stale responses)

app.disable("etag"); // evita 304/ETag atrapalhando

app.use((req, res, next) => {
  // só pra GET/HEAD (onde cache é mais comum)
  if (req.method === "GET" || req.method === "HEAD") {
    res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});

// Rotas
app.use("/api/categorias", categoriasRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/formacao", formacaoRoutes);
app.use("/api/experiences", experiencesRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
