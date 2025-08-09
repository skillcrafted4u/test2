// lib/openai.js
import OpenAI from 'openai'

// Replace 'your-api-key-here' with your actual OpenAI API key
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key-here',
  dangerouslyAllowBrowser: true // Allows browser use (for demo only)
})

// This function talks to OpenAI and asks it to create a trip itinerary
export const generateItinerary = async (tripDetails) => {
  // Extract the details we need
  const {
    destination,
    startDate,
    endDate,
    budget,
    travelers,
    moods
  } = tripDetails

  // Calculate how many days the trip is
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

  // Create a detailed prompt for the AI
  const prompt = `You are an expert travel planner. Create a detailed ${days}-day itinerary for:

TRIP DETAILS:
- Destination: ${destination}
- Dates: ${startDate} to ${endDate} 
- Budget: $${budget} USD total
- Number of travelers: ${travelers} people
- Preferred vibes: ${moods.join(', ')}
- Trip duration: ${days} days

REQUIREMENTS:
- Stay within the budget (divide evenly across days)
- Match the traveler's mood preferences
- Include specific times, locations, and costs
- Suggest morning, afternoon, and evening activities
- Include local food recommendations
- Add helpful travel tips

Return your response as a JSON object with exactly this structure:
{
  "summary": "Brief trip overview in one sentence",
  "days": [
    {
      "day": 1,
      "date": "2024-03-15",
      "theme": "Arrival and exploration",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Activity name",
          "description": "What you'll do and why it's special",
          "location": "Specific address or area",
          "cost": 25,
          "duration": "2 hours",
          "category": "culture",
          "tips": "Helpful tip for this activity"
        }
      ],
      "dailyBudget": 150
    }
  ],
  "totalCost": 1050,
  "packerTips": ["What to bring", "What to wear"],
  "localTips": ["Cultural etiquette", "Local customs"],
  "emergencyInfo": {
    "embassy": "Contact info if applicable",
    "emergency": "Local emergency numbers"
  }
}`

  try {
    console.log('🤖 Asking AI to create your itinerary...')
    
    // Send the request to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using GPT-3.5-turbo for reliable access
      messages: [
        {
          role: "system",
          content: "You are a professional travel planner with 20+ years of experience. Always return valid JSON exactly as requested. Make itineraries personal, practical, and magical."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8, // Makes responses creative but not random
      max_tokens: 3000 // Allows for detailed responses
    })
    
    // Get the AI's response
    const response = completion.choices[0].message.content
    console.log('🎉 AI finished creating your itinerary!')
    
    // Convert the text response to a JavaScript object
    const itinerary = JSON.parse(response)
    
    return {
      success: true,
      data: itinerary,
      error: null
    }
    
  } catch (error) {
    console.error('❌ OpenAI Error:', error)
    
    // Return user-friendly error
    return {
      success: false,
      data: null,
      error: 'Sorry, I had trouble creating your itinerary. Please try again!'
    }
  }
}

// Test function to make sure everything works
export const testOpenAI = async () => {
  const testTrip = {
    destination: "Paris, France",
    startDate: "2024-04-15",
    endDate: "2024-04-18",
    budget: 1500,
    travelers: 2,
    moods: ["culture", "food", "romance"]
  }
  
  console.log('🧪 Testing OpenAI connection...')
  const result = await generateItinerary(testTrip)
  
  if (result.success) {
    console.log('✅ OpenAI is working perfectly!')
    console.log('Sample itinerary:', result.data)
  } else {
    console.log('❌ OpenAI test failed:', result.error)
  }
  
  return result
}