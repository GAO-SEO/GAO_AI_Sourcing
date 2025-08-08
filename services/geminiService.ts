import { GoogleGenAI } from "@google/genai";
import { ProductData, Source } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateProductData = async (productUrl: string, companyName: 'GAOTek' | 'GAORFID'): Promise<{ data: ProductData; sources: Source[] }> => {
  const prompt = `
    You are an expert product data processor for an e-commerce company, "${companyName}".
    Your task is to perform a deep and comprehensive scrape of the provided product URL, extracting ALL available information with the highest accuracy. Your goal is to avoid summarization and capture the full content from the page, sanitized and structured according to the rules below.
    You MUST ONLY output the raw JSON object, without any surrounding text, comments, or markdown formatting like \`\`\`json.

    You must follow these rules precisely:

    1.  **Generate \`productName\`**:
        *   Create a new product name that is between 50 and 70 characters long.
        *   It should be descriptive, including key features and the product category.
        *   It MUST NOT contain any original brand names or model numbers.
        *   It MUST end with " - ${companyName}".

    2.  **Generate \`productId\`**:
        *   Create a unique product ID for ${companyName}.
        *   The format should be "${companyName}-[CATEGORY_ABBREVIATION]-[NUMBER]". For example, for a "BLE Beacon" for GAOTek, a valid ID would be "GAOTek-BB-101". Use your best judgment for abbreviation and a sequential-like number.

    3.  **Extract \`category\`**:
        *   Identify and extract the product's main category from the text.

    4.  **Extract \`prices\`**:
        *   Find and extract all pricing tiers and structure them as an array of objects, each with a "quantity" string (e.g., "1 to 99 pieces") and a "price" string (e.g., "$ 5.00").

    5.  **Generate \`overview\`**:
        *   Create a comprehensive product overview.
        *   It MUST begin with "${companyName}'s " followed by the newly generated \`productName\`.
        *   Combine all descriptive paragraphs, marketing text, and introductions from the source page to create a full, detailed overview. Do not summarize; capture the full context.
        *   Throughout the overview, replace any original brand or model numbers with generic terms like "it", "this device", or "this product".
        *   If the source text does not contain enough information to create a meaningful overview, leave this field as an empty string.

    6.  **Generate \`metaDescription\`**:
        *   Create a concise meta description, optimized for SEO, between 140 and 150 characters long.
        *   This is generated in addition to the overview.
        *   It MUST NOT contain any original brand names, model numbers, or start with a number.

    7.  **Extract \`features\`**:
        *   Extract ALL listed features, not just the key ones. Be exhaustive. The result should be an array of strings.

    8.  **Process \`specifications\`**:
        *   Extract a COMPLETE list of all technical specifications into a list of key-value pairs. Do not omit any details.
        *   **Cleanup**: Remove any items related to 'brand', 'place of origin', 'model number', 'warranty', 'customized support', 'certification'.
        *   **Unit Conversion**:
            *   Celsius (°C) to Fahrenheit (°F), format: "32 °F to 104 °F (0 °C to 40 °C)"
            *   cm and mm to inches, format: "1.50 in x 0.47 in (38 mm x 12 mm)"
            *   m to feet, format: "49.21 ft (15 m)"
            *   km to miles, format: "1 mi (1.61 km)"
            *   kg to pounds (lb), format: "2.2 lb (1 kg)"
            *   g to ounces (oz), format: "0.76 oz (21.5 g)"
            *   mm² to AWG, format: "15 AWG (1.5 mm²)"
        *   **Symbol Replacement**: In the 'value' part of the specification:
            *   '-' becomes ' to '
            *   '~' becomes ' to '
            *   '/' becomes ' or '
            *   '@' becomes ' at '
            *   '*' becomes ' x '
        *   **Reordering**: The final list of specifications should be ordered with temperature specs first, then product weight, and finally dimensions/size at the very bottom.

    Based on the rules above, process the product found at this URL:
    ---
    ${productUrl}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("API returned an empty response. The URL may be invalid or inaccessible.");
    }
    
    // Clean potential markdown formatting from the response
    const cleanedJson = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');

    const parsedData = JSON.parse(cleanedJson);

    // Manually add the product link from the input URL
    if (productUrl) {
      parsedData.productLink = productUrl;
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => ({ uri: chunk.web?.uri, title: chunk.web?.title || 'Untitled' }))
      .filter((s: any) => s.uri);

    return { data: parsedData as ProductData, sources: sources };

  } catch (error) {
    console.error("Error generating product data from Gemini API:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to process the product data. The AI returned an invalid format.");
    }
    if (error instanceof Error) {
        throw new Error(`Failed to process the product data. Reason: ${error.message}`);
    }
    throw new Error("An unknown error occurred while processing the product data.");
  }
};