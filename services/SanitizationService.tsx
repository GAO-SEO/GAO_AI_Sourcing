
import { GoogleGenAI, Type } from "@google/genai";
import { SanitizedData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64encodedData = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      mimeType: file.type,
      data: base64encodedData as string,
    },
  };
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        productName: { type: Type.STRING },
        productId: { type: Type.STRING },
        productLink: { type: Type.STRING },
        overview: { type: Type.STRING },
        features: { type: Type.ARRAY, items: { type: Type.STRING } },
        specifications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    key: { type: Type.STRING },
                    value: { type: Type.STRING }
                },
                required: ['key', 'value']
            }
        },
    },
    required: ['productName', 'productId', 'productLink', 'overview', 'features', 'specifications']
};

export const sanitizeDocument = async (
  file: File,
  companyName: 'GAOTek' | 'GAORFID',
  productName: string,
  sku: string,
  productLink: string
): Promise<SanitizedData> => {

  const filePart = await fileToGenerativePart(file);

  const textPart = {
    text: `
      You are a document sanitization agent for the company "${companyName}".
      Your task is to process the content of the provided file, which is a competitor's product data sheet.
      Your primary goal is to extract the existing information and remove all mentions of the competitor's brand name and model numbers.
      You should NOT invent new features, specifications, or overviews. The output should be a sanitized version of the data found in the file.

      Follow these instructions precisely and output a single, raw JSON object without any surrounding text or markdown.

      1.  **Extraction and Sanitization**:
          *   **overview**: Extract the product overview from the document. Remove any competitor brand or model names. If the original overview starts with the competitor's name, replace it with "${companyName}'s".
          *   **features**: Extract the product features into an array of strings. Remove any brand or model names from each feature.
          *   **specifications**: Extract the technical specifications into an array of key-value objects. Remove any specifications related to "brand", "model number", or "place of origin".

      2.  **Product Identity Rules**:
          *   **productName**:
              *   If a product name is provided here: "${productName}", use it.
              *   Otherwise, extract the product name from the document and remove any competitor branding.
              *   The final product name MUST end with " - ${companyName}".
          *   **productId**:
              *   If a SKU/ID is provided here: "${sku}", use it.
              *   Otherwise, try to find a SKU or Product ID in the document. If found, use it.
              *   If no SKU is provided or found, generate a simple one: "${companyName}-SAN-${Math.floor(1000 + Math.random() * 9000)}".
          *   **productLink**:
              *   If a product link is provided here: "${productLink}", use it.
              *   Otherwise, set this field to "N/A".

      Analyze the provided file and generate the JSON object based on these rules. Do not add any information that is not present in the source document unless specified above.
    `
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [textPart, filePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("API returned an empty response. The file might be invalid or unreadable.");
    }
    
    return JSON.parse(jsonText) as SanitizedData;

  } catch (error) {
    console.error("Error sanitizing document from Gemini API:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to process the document. The AI returned an invalid format.");
    }
    if (error instanceof Error) {
        throw new Error(`Failed to process the document. Reason: ${error.message}`);
    }
    throw new Error("An unknown error occurred while processing the document.");
  }
};
