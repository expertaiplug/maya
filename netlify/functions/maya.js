// Try alternative import syntax
let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch (error) {
  console.log('Failed to import Anthropic SDK:', error.message);
}

exports.handler = async (event, context) => {
  console.log('Function started');
  console.log('Anthropic SDK available:', !!Anthropic);

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Check if SDK loaded
    if (!Anthropic) {
      throw new Error('Anthropic SDK not available');
    }

    console.log('Creating Anthropic client...');
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    console.log('Parsing request body...');
    const { message } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    console.log('Message received:', message.substring(0, 50) + '...');

    const mayaPrompt = `You are MAYA, a warm postpartum assistant who understands the 3 AM struggles and identity shifts of new motherhood. You are clinically informed but radically compassionate.

The user said: "${message}"

Respond with warmth and understanding in 2-3 paragraphs. If they mention crisis or self-harm, provide crisis resources: Postpartum Support International: 1-800-944-4773, Crisis Text: HOME to 741741, Suicide Prevention: 988.`;

    console.log('Calling Claude API...');
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: mayaPrompt }]
    });

    console.log('Claude API response received');
    const reply = response.content[0]?.text || "I'm here for you. Please try again.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply }),
    };

  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      status: error.status,
      type: error.type,
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: `MAYA is having technical difficulties. If you're in crisis, contact: 1-800-944-4773` 
      }),
    };
  }
};
