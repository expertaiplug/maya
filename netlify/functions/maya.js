const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event, context) => {
  console.log('Function started');
  console.log('Environment variables check:', {
    hasApiKey: !!process.env.CLAUDE_API_KEY,
    apiKeyLength: process.env.CLAUDE_API_KEY?.length || 0,
    apiKeyPrefix: process.env.CLAUDE_API_KEY?.substring(0, 10) || 'missing'
  });

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

    const mayaPrompt = `You are MAYA, a warm postpartum assistant who understands the 3 AM struggles and identity shifts of new motherhood.

The user said: "${message}"

Respond with warmth and understanding in 2-3 paragraphs.`;

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
        error: `Debug info: ${error.message}` 
      }),
    };
  }
};
