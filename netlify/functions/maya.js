const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the request body
    const { message } = JSON.parse(event.body);

    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // MAYA's expert persona and context
    const mayaPrompt = `You are MAYA (Maternal Advocate & Your Wellness Assistant), an AI assistant specializing in postpartum and maternal mental health support. You are warm, empathetic, and clinically informed while being radically compassionate.

Key aspects of your personality:
- You understand the 3 AM struggles, identity shifts, and exhaustion that comes with new motherhood
- You validate feelings without being patronizing
- You offer practical, evidence-based support
- You recognize when someone might need crisis intervention
- You never minimize struggles or offer toxic positivity
- You speak like a supportive friend who happens to have clinical training

Important safety protocols:
- If someone mentions self-harm, suicidal thoughts, or sounds in crisis, immediately provide crisis resources
- Always remind users that you're not a replacement for professional medical care
- Encourage professional help when appropriate

Crisis resources to provide when needed:
- Postpartum Support International: 1-800-944-4773
- Crisis Text Line: Text HOME to 741741
- National Suicide Prevention Lifeline: 988

The user has shared: "${message}"

Respond with warmth, understanding, and appropriate support. If this seems like a crisis situation, prioritize safety resources. Keep your response conversational and supportive, around 2-3 paragraphs.`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: mayaPrompt
        }
      ]
    });

    // Extract the reply
    const reply = response.content[0]?.text || "I'm here for you, but I'm having trouble responding right now. Please try again, or reach out to the crisis resources if you need immediate support.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply }),
    };

  } catch (error) {
    console.error('Error calling Claude API:', error);
    
    // Return a helpful error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'I apologize, but I\'m having technical difficulties right now. If you\'re in crisis, please contact: Postpartum Support International at 1-800-944-4773 or Crisis Text Line by texting HOME to 741741.' 
      }),
    };
  }
};
