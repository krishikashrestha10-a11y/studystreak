import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy Google GenAI Client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// AI Quiz Generation Endpoint
app.post("/api/gemini/quiz", async (req, res) => {
  try {
    const { subject, chapterName, publication, contentSummary, questionCount = 5, difficulty = "Medium" } = req.body;

    const ai = getGenAI();

    if (!ai) {
      // Return structured high quality fallback if API key is not configured
      return res.json({
        success: true,
        source: "fallback",
        questions: generateFallbackQuestions(subject, chapterName, questionCount, difficulty),
      });
    }

    const prompt = `You are an expert academic educator creating an engaging, pedagogical multiple-choice quiz for high school/college students studying ${subject}, specifically the chapter: "${chapterName}" (${publication ? `Referenced from ${publication}` : ""}).
    
    Difficulty Level: ${difficulty}
    Total Questions: ${questionCount}
    
    Chapter Context / Notes excerpt:
    "${contentSummary || `Core fundamental concepts, laws, formulas, applications, and theoretical derivations of ${chapterName} in ${subject}.`}"
    
    Generate exactly ${questionCount} high quality multiple choice questions.
    Each question must have:
    - Clear question text
    - 4 distinct, plausible options (A, B, C, D)
    - The exact 0-indexed correct option index (0 for A, 1 for B, 2 for C, 3 for D)
    - Detailed explanation explaining why the correct answer is right and why other options are common misconceptions
    - Topic / Subconcept tag

    CRITICAL REQUIREMENT: Randomize and distribute the correct answer index evenly across ALL four positions (0 for Option A, 1 for Option B, 2 for Option C, 3 for Option D). Do NOT default to Option B or any single position for all questions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              subtopic: { type: Type.STRING },
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"],
          },
        },
      },
    });

    const parsedQuestions = JSON.parse(response.text || "[]");

    if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
      const sanitized = parsedQuestions.map((q, idx) => {
        const rawOptions = Array.isArray(q.options) && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"];
        const rawCorrectIdx = typeof q.correctAnswerIndex === "number" && q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4 ? q.correctAnswerIndex : 0;
        
        // Shuffle options and recalculate correct index to ensure true 25% distribution across A, B, C, D
        const correctText = rawOptions[rawCorrectIdx];
        const shuffled = [...rawOptions].sort(() => Math.random() - 0.5);
        const newCorrectIdx = shuffled.indexOf(correctText);

        return {
          id: q.id || `ai_q_${idx + 1}_${Date.now()}`,
          question: q.question,
          options: shuffled,
          correctAnswerIndex: newCorrectIdx !== -1 ? newCorrectIdx : 0,
          explanation: q.explanation || "Correct based on chapter fundamental principles.",
          subtopic: q.subtopic || chapterName,
        };
      });

      return res.json({
        success: true,
        source: "gemini",
        questions: sanitized,
      });
    } else {
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error: any) {
    console.error("Gemini quiz generation error:", error);
    const { subject, chapterName, questionCount = 5, difficulty = "Medium" } = req.body;
    return res.json({
      success: true,
      source: "fallback",
      error: error.message,
      questions: generateFallbackQuestions(subject, chapterName, questionCount, difficulty),
    });
  }
});

// AI Explainer & Tutor endpoint
app.post("/api/gemini/explain", async (req, res) => {
  try {
    const { question, context, subject, chapterName } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        success: true,
        explanation: `Here is a study breakdown for "${question}":\n\n1. **Core Principle**: In ${subject} (${chapterName}), this concept is grounded in fundamental theorems.\n2. **Key Insight**: Break the problem down into given variables and standard boundary conditions.\n3. **Quick Memory Rule**: Remember the key relationship between cause and observed effect.`,
      });
    }

    const prompt = `You are a supportive AI Study Coach in StudyStreak. 
A student is reading notes on "${chapterName}" in "${subject}" and has a question:
Context from notes: "${context || "General chapter concept"}"
Student's Question: "${question}"

Provide a clear, student-friendly, encouraging explanation formatted with markdown. Include:
- Concise explanation in simple terms
- A practical real-world analogy
- Key formula or takeaway point
Keep it under 200 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      explanation: response.text,
    });
  } catch (error: any) {
    console.error("Gemini explain error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Notes Summarizer / Flashcard generator
app.post("/api/gemini/summarize", async (req, res) => {
  try {
    const { chapterName, subject, rawNotes } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        success: true,
        summary: `Key highlights for ${chapterName}: Covers foundational definitions, key equations, and high-frequency exam questions.`,
        keyPoints: [
          "Master core definitions and standard SI units",
          "Practice key derivations and formula substitutions",
          "Review common conceptual pitfalls and edge cases",
        ],
      });
    }

    const prompt = `Summarize the following study notes for chapter "${chapterName}" (${subject}) into crisp revision highlights:
    "${rawNotes?.slice(0, 4000) || "Comprehensive chapter notes"}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            formulae: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["summary", "keyPoints"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      ...parsed,
    });
  } catch (error: any) {
    console.error("Gemini summarize error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper for fallback questions
function generateFallbackQuestions(subject: string, chapterName: string, count: number, difficulty: string) {
  const bank: Record<string, any[]> = {
    Physics: [
      {
        question: "According to Newton's First Law of Motion, an object will remain at rest or in uniform motion unless acted upon by:",
        options: ["An internal balanced force", "An net external unbalanced force", "A frictional force only", "Gravitational potential"],
        correctAnswerIndex: 1,
        explanation: "Newton's First Law states that a body continues in its state of rest or uniform motion in a straight line unless compelled to change by an external net unbalanced force.",
        subtopic: "Laws of Motion",
      },
      {
        question: "What is the SI unit of Electric Flux according to Gauss's Law?",
        options: ["Volt per meter (V/m)", "Newton per Coulomb (N/C)", "Volt-meter (V·m) or N·m²/C", "Coulomb per square meter (C/m²)"],
        correctAnswerIndex: 2,
        explanation: "Electric flux Φ = E · A. Since E is in N/C or V/m, Φ has units of N·m²/C or V·m.",
        subtopic: "Electrostatics",
      },
      {
        question: "In simple harmonic motion (SHM), where is the velocity of the oscillating particle maximum?",
        options: ["At extreme positions", "At the mean/equilibrium position", "Midway between mean and extreme", "It remains constant everywhere"],
        correctAnswerIndex: 1,
        explanation: "At the equilibrium position, potential energy is minimum (zero) and all energy is converted to kinetic energy, making velocity v = ωA maximum.",
        subtopic: "Oscillations",
      },
      {
        question: "Which thermodynamic process occurs at constant pressure?",
        options: ["Isochoric process", "Isothermal process", "Isobaric process", "Adiabatic process"],
        correctAnswerIndex: 2,
        explanation: "An isobaric process is a thermodynamic process in which the pressure remains constant (ΔP = 0).",
        subtopic: "Thermodynamics",
      },
      {
        question: "What happens to the capacitance of a parallel plate capacitor if a dielectric slab with constant K is inserted between plates?",
        options: ["Decreases by factor of K", "Increases by factor of K (C' = K·C₀)", "Remains unchanged", "Becomes zero"],
        correctAnswerIndex: 1,
        explanation: "The introduction of a dielectric material with dielectric constant K increases the capacitance by a factor of K: C = K·ε₀A/d.",
        subtopic: "Capacitance",
      },
    ],
    Chemistry: [
      {
        question: "Which quantum number designates the shape of an atomic orbital?",
        options: ["Principal quantum number (n)", "Azimuthal / Angular momentum quantum number (l)", "Magnetic quantum number (ml)", "Spin quantum number (ms)"],
        correctAnswerIndex: 1,
        explanation: "The azimuthal quantum number (l) defines the 3D shape of the orbital (e.g., l=0 for s spherical, l=1 for p dumbbell).",
        subtopic: "Atomic Structure",
      },
      {
        question: "According to Le Chatelier's Principle, increasing the pressure in a gaseous equilibrium system will shift the equilibrium towards:",
        options: ["The side with greater number of moles of gas", "The side with fewer number of moles of gas", "No shift occurs", "The endothermic direction"],
        correctAnswerIndex: 1,
        explanation: "Increasing pressure shifts equilibrium in the direction that decreases the number of gas molecules to counteract the pressure increase.",
        subtopic: "Chemical Equilibrium",
      },
      {
        question: "Which of the following organic reaction mechanisms proceeds via a planar carbocation intermediate?",
        options: ["SN2 substitution", "SN1 substitution", "E2 elimination", "Electrophilic addition without rearrangement"],
        correctAnswerIndex: 1,
        explanation: "SN1 is a two-step unimolecular reaction where the leaving group departs first, forming a flat sp² hybridized carbocation intermediate.",
        subtopic: "Organic Reaction Mechanisms",
      },
      {
        question: "What is the oxidation state of Chromium in Potassium Dichromate (K₂Cr₂O₇)?",
        options: ["+3", "+4", "+6", "+7"],
        correctAnswerIndex: 2,
        explanation: "2(+1) + 2(Cr) + 7(-2) = 0 => 2 + 2(Cr) - 14 = 0 => 2(Cr) = 12 => Cr = +6.",
        subtopic: "Redox Reactions",
      },
    ],
    Mathematics: [
      {
        question: "What is the derivative of f(x) = ln(sec(x) + tan(x)) with respect to x?",
        options: ["sec²(x)", "sec(x)", "tan(x)", "sec(x)·tan(x)"],
        correctAnswerIndex: 1,
        explanation: "d/dx[ln(sec x + tan x)] = (sec x tan x + sec² x)/(sec x + tan x) = sec x(tan x + sec x)/(sec x + tan x) = sec x.",
        subtopic: "Calculus & Derivatives",
      },
      {
        question: "If matrix A is an orthogonal matrix, which property is always true?",
        options: ["Aᵀ = -A", "Aᵀ · A = I (Identity matrix)", "det(A) = 0", "A² = A"],
        correctAnswerIndex: 1,
        explanation: "By definition, an orthogonal matrix satisfies Aᵀ · A = A · Aᵀ = I, which also implies A⁻¹ = Aᵀ and det(A) = ±1.",
        subtopic: "Matrices & Determinants",
      },
      {
        question: "What is the value of ∫ (1 / (1 + x²)) dx?",
        options: ["ln(1 + x²) + C", "arctan(x) + C", "arcsin(x) + C", "sec⁻¹(x) + C"],
        correctAnswerIndex: 1,
        explanation: "The standard integral of 1/(1+x²) with respect to x is tan⁻¹(x) + C (or arctan(x) + C).",
        subtopic: "Integration",
      },
    ],
    Biology: [
      {
        question: "Which organelle is responsible for cellular respiration and ATP synthesis?",
        options: ["Ribosome", "Golgi Apparatus", "Mitochondria", "Endoplasmic Reticulum"],
        correctAnswerIndex: 2,
        explanation: "Mitochondria are the powerhouses of the cell where the Krebs cycle and oxidative phosphorylation generate the bulk of cellular ATP.",
        subtopic: "Cell Biology",
      },
      {
        question: "During which phase of meiosis does crossing over and genetic recombination occur?",
        options: ["Metaphase I", "Pachytene stage of Prophase I", "Anaphase II", "Telophase I"],
        correctAnswerIndex: 1,
        explanation: "Crossing over between non-sister chromatids of homologous chromosomes occurs during the pachytene sub-stage of Prophase I.",
        subtopic: "Genetics & Cell Division",
      },
    ],
  };

  const pool = bank[subject] || bank.Physics;
  const questions = [];
  for (let i = 0; i < count; i++) {
    const item = pool[i % pool.length];
    const originalCorrectText = item.options[item.correctAnswerIndex];
    // Randomly shuffle options
    const shuffledOptions = [...item.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);

    questions.push({
      id: `fallback_${i + 1}_${Date.now()}`,
      question: item.question,
      options: shuffledOptions,
      correctAnswerIndex: newCorrectIndex !== -1 ? newCorrectIndex : 0,
      explanation: item.explanation,
      subtopic: item.subtopic || chapterName,
    });
  }
  return questions;
}

// Vite middleware for development vs static production serving
async function startServer() {
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
    console.log(`StudyStreak server running on http://localhost:${PORT}`);
  });
}

startServer();
