import { GoogleGenAI } from "@google/genai";

async function generateMapReference() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: 'A top-down 2D pixel art game map layout for a tower defense game. The style is "Kenney" (clean, simple, vibrant). The map should show a clear logical progression: 1. A starting village with small houses and fences along a dirt road. 2. Large, seamless green grass planes with smooth rounded edges. 3. Clustered trees and rocks. 4. A desert area with cacti. The layout should feel designed, not random. High contrast between sand background and grass planes.',
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "9:16",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64Data = part.inlineData.data;
      // In a real app, we'd display this. Here I'm just simulating the thought process.
      console.log("Reference image generated.");
    }
  }
}
