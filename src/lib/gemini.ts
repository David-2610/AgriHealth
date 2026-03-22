import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export function isGeminiConfigured(): boolean {
  return !!API_KEY && API_KEY !== "your_gemini_api_key_here";
}

/**
 * Generate a soil analysis report using Gemini AI
 */
export async function generateSoilReport(
  soilType: string,
  location?: string,
  additionalInfo?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", safetySettings });

  const prompt = `You are an expert agricultural scientist and soil analyst. Generate a comprehensive soil analysis report for the following soil:

**Soil Type:** ${soilType}
${location ? `**Location:** ${location}` : ""}
${additionalInfo ? `**Additional Information from Farmer:** ${additionalInfo}` : ""}

Please provide a detailed report in the following structured format using markdown:

## ${soilType.charAt(0).toUpperCase() + soilType.slice(1)} Soil Analysis Report

**Soil Composition:**
(Describe the mineral and organic composition)

**Key Characteristics:**
- (List 4-6 key characteristics)

**Best Crops:**
- (List 5-8 recommended crops for this soil type${location ? " and location" : ""})

**Improvement Strategies:**
- (List 4-6 strategies to improve soil health)

**Optimal pH Range:** (specify range)

**Recommended Fertilizers:**
- (List 3-5 fertilizer recommendations)

**Watering Guidelines:**
(Provide specific watering advice)

**Seasonal Considerations:**
(Advice based on seasons)

${additionalInfo ? `**Response to Farmer's Notes:**\n(Address the farmer's specific concerns: "${additionalInfo}")` : ""}

Keep the report practical, actionable, and easy for a farmer to understand. Use simple language.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

/**
 * Chat with the agricultural AI assistant
 */
export type ChatMessage = {
  role: "user" | "model";
  parts: string;
};

export async function chatWithAssistant(
  message: string,
  history: ChatMessage[] = []
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", safetySettings });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "You are AgriHealth AI, an expert agricultural assistant. You help farmers with questions about crops, soil, diseases, fertilizers, pest control, irrigation, weather impact, and farming best practices. Always provide practical, actionable advice. Keep answers concise but thorough. If you're unsure, say so and recommend consulting a local agricultural extension officer." }],
      },
      {
        role: "model",
        parts: [{ text: "I understand. I'm AgriHealth AI, your expert agricultural assistant. I'm here to help you with all aspects of farming including crop selection, soil management, disease identification, fertilizer recommendations, pest control, irrigation practices, and weather-related farming advice. I'll provide practical, actionable guidance based on established agricultural science. How can I help you today?" }],
      },
      ...history.map((msg) => ({
        role: msg.role as "user" | "model",
        parts: [{ text: msg.parts }],
      })),
    ],
  });

  const result = await chat.sendMessage(message);
  const response = result.response;
  return response.text();
}

/**
 * Analyze a crop image for diseases using Gemini Vision
 */
export async function analyzeCropImage(imageBase64: string, mimeType: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", safetySettings });

  const prompt = `You are an expert plant pathologist and agricultural scientist. Analyze this image of a crop/plant and provide a detailed assessment.

Please respond in the following structured format using markdown:

## Crop Disease Analysis Report

**Plant/Crop Identified:** (What crop or plant do you see?)

**Health Status:** (Healthy / Mild Issue / Moderate Disease / Severe Disease)

**Disease/Issue Identified:** (Name of disease or issue, if any)

**Symptoms Observed:**
- (List visible symptoms)

**Possible Causes:**
- (List possible causes)

**Recommended Treatment:**
1. (Immediate actions)
2. (Treatment plan)
3. (Prevention measures)

**Organic Alternatives:**
- (List organic treatment options)

**When to Seek Professional Help:**
(Describe when the farmer should consult an expert)

If the image doesn't show a plant or crop, politely indicate that and ask the user to upload a plant/crop image. If the plant appears healthy, confirm that and provide general care tips.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    },
  ]);

  const response = result.response;
  return response.text();
}

/**
 * Get farming recommendations based on weather data using Gemini
 */
export async function getWeatherFarmingAdvice(
  weatherDescription: string,
  temperature: number,
  humidity: number,
  location: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", safetySettings });

  const prompt = `You are an expert agricultural advisor. Based on the following weather conditions, provide farming recommendations:

**Location:** ${location}
**Weather:** ${weatherDescription}
**Temperature:** ${temperature}°C
**Humidity:** ${humidity}%

Provide brief, practical farming advice covering:
1. **Crop Protection** - What to watch out for
2. **Irrigation Advice** - Watering recommendations
3. **Best Activities** - What farming tasks are ideal today
4. **Warnings** - Any weather-related risks

Keep it concise (under 200 words) and actionable.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}
