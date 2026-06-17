import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialize Gemini
let genAI: GoogleGenAI | null = null;
function getGemini() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    genAI = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/analyze-candidate", async (req, res) => {
  const { name, role, description } = req.body;
  
  try {
    const ai = getGemini();
    
    const prompt = `You are an elite political strategist and territory manager for Nayarit, Mexico, specialized in the "BrigadaMX" methodology.
    
    Analyze the following potential candidate for the 2027 gubernatorial election:
    Name: ${name}
    Current Role: ${role}
    Bio: ${description}
    
    Provide a data-driven strategic analysis in 3 bullet points:
    1. TERRITORIAL POTENTIAL: Analyze their ability to convert "hormiga" work into "Voto Duro" vs "Indecisos".
    2. DOLORES DETECTADOS: Based on their profile/region, which territorial "pains" (water, security, etc.) should their brigades prioritize?
    3. GOTV READINESS: How prepared is their structure for the "Get Out The Vote" (Movilización) phase based on their current reach?
    
    Format as clean text with bullets. Be sharp, pragmatic, and objective.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    
    const text = response.text;
    
    res.json({ analysis: text });
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    res.status(500).json({ error: "Failed to generate analysis" });
  }
});

// Vite middleware for development
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
