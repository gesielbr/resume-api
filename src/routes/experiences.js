const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) throw error;

    // ✅ evita cache no browser, proxy e CDN da Vercel
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    return res.status(200).json(data);
  } catch (err) {
    console.error("Erro ao buscar experiences:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
