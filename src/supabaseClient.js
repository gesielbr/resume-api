// supabaseClient.js

require("dotenv").config(); // Garante que as variáveis .env estão carregadas

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Inicializa e exporta o cliente
export const supabase = createClient(supabaseUrl, supabaseKey);
