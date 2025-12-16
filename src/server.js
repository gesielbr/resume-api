require("dotenv").config();

const express = require("express");
const cors = require("cors");

const categoriasRoutes = require("./routes/categorias");
const skillsRoutes = require("./routes/skills");
const formacaoRoutes = require("./routes/formacao");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota base
app.get("/", (req, res) => {
  res.send("✅ Servidor Express Online!");
});

// Rotas
app.use("/api/categorias", categoriasRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/formacao", formacaoRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
