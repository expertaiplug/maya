const fetch = require('node-fetch');

exports.handler = async function (event) {
  const body = JSON.parse(event.body);
  const userInput = body.message;

  const claudePrompt = `
You are MAYA, a warm, trauma-informed postpartum wellness assistant.
Use compassion, clarity, and evidence-based care to support the user.

Here’s what she asked:
"${userInput}"

Respond with:
- Emotional validation
- Practical wellness tools
- Short paragraphs (not a list)
- Friendly, non-clinical tone
- A gentle suggestion or resource

If unsure, ask a thoughtful question to continue the conversation.
  `;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 400,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: claudePrompt
          }
        ]
      })
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || "I'm not sure how to respond just yet, but I'm here with you.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    console.error("Claude API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong talking to MAYA.' })
    };
  }
};
