import { GoogleGenAI } from "@google/genai";

export default async (req: Request) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenAI(apiKey);
  const result = await genAI.generateText("Donne-moi une question biblique");
  return new Response(JSON.stringify({ question: result }), {
    headers: { "Content-Type": "application/json" }
  });
};
