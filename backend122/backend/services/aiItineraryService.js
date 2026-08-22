const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const MODEL_NAME = 'gemini-3.6-flash';

/**
 * Builds the text prompt for Gemini API based on user preferences.
 */
function buildPrompt(prefs) {
  return `
    You are an expert travel planner. Generate a highly detailed and realistic travel itinerary based on the following constraints:
    - Destinations: ${prefs.destinations}
    - Travelers: ${prefs.traveler_count}
    - Total Budget: ${prefs.budget} ${prefs.currency}
    - Budget Tier: ${prefs.budget_tier}
    - Interests: ${prefs.interests.join(', ')}
    - Pace: ${prefs.pace}
    - Start Date: ${prefs.start_date}
    - Total Duration: ${prefs.duration_days} days
    - Additional Notes: ${prefs.notes || 'None'}
    
    IMPORTANT DATE RULES:
    1. The dates for the stops MUST be sequential and strictly non-overlapping.
    2. The very first stop MUST have an arrival_date of exactly "${prefs.start_date}".
    3. The last stop MUST have a departure_date that is exactly ${prefs.duration_days} days after the start date.
    4. Distribute the days logically among the destinations.
    5. Activities within a stop MUST have scheduled_date between the stop's arrival and departure date.

    BUDGET RULES:
    1. Distribute the estimated_cost realistically based on the budget tier.
    2. Ensure the sum of all estimated_costs roughly matches the total budget.
  `;
}

// Ensure the itinerary Schema exists
const itinerarySchema = {
  type: SchemaType.OBJECT,
  properties: {
    budget_summary: {
      type: SchemaType.OBJECT,
      properties: {
        total_estimated: { type: SchemaType.NUMBER },
        currency: { type: SchemaType.STRING },
        breakdown: {
          type: SchemaType.OBJECT,
          properties: {
            stay: { type: SchemaType.NUMBER },
            food: { type: SchemaType.NUMBER },
            activities: { type: SchemaType.NUMBER },
            transport: { type: SchemaType.NUMBER }
          },
          required: ["stay", "food", "activities", "transport"]
        }
      },
      required: ["total_estimated", "currency", "breakdown"]
    },
    stops: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          city_name: { type: SchemaType.STRING },
          country: { type: SchemaType.STRING },
          arrival_date: { type: SchemaType.STRING, description: "YYYY-MM-DD" },
          departure_date: { type: SchemaType.STRING, description: "YYYY-MM-DD" },
          activities: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                category: { 
                  type: SchemaType.STRING, 
                  description: "Must be one of: sightseeing, food, adventure, transport, stay, other" 
                },
                estimated_cost: { type: SchemaType.NUMBER },
                duration_hours: { type: SchemaType.NUMBER },
                scheduled_date: { type: SchemaType.STRING, description: "YYYY-MM-DD" },
                scheduled_time: { type: SchemaType.STRING, description: "HH:mm" },
                notes: { type: SchemaType.STRING }
              },
              required: ["name", "category", "estimated_cost", "duration_hours", "scheduled_date", "scheduled_time"]
            }
          }
        },
        required: ["city_name", "country", "arrival_date", "departure_date", "activities"]
      }
    }
  },
  required: ["budget_summary", "stops"]
};

/**
 * Calls Gemini API with structured output and returns the parsed itinerary object.
 */
async function callGeminiForItinerary(prefs, isRetry = false) {
  let promptText = buildPrompt(prefs);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  if (isRetry) {
    promptText += "\n\nCRITICAL: Your previous response was invalid. Ensure it exactly matches the requested JSON schema.";
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: "You are a professional travel planning assistant. Your sole purpose is to generate structured travel itineraries in strict JSON format based on user constraints.",
    generationConfig: {
      temperature: 0.2, // Low temperature for more deterministic, structured output
      responseMimeType: "application/json",
      responseSchema: itinerarySchema,
    }
  });

  const callApi = () => model.generateContent(promptText);

  // 60-second timeout guard using Promise.race
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => {
      const err = new Error('AI API Request Timeout');
      err.name = 'TimeoutError';
      reject(err);
    }, 60000)
  );

  try {
    const response = await Promise.race([callApi(), timeoutPromise]);
    const responseText = response.response.text();
    
    try {
      const data = JSON.parse(responseText.trim());
      return data;
    } catch (parseErr) {
      if (!isRetry) {
        console.warn("AI returned malformed JSON, attempting one retry...");
        return await callGeminiForItinerary(prefs, true);
      }
      throw new Error('Failed to parse AI response as JSON after retry.');
    }
  } catch (err) {
    console.error("AI Generation Error:", err.message);
    throw err;
  }
}

module.exports = {
  callGeminiForItinerary
};
