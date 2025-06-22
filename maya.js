
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const userMessage = body.message;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 500,
        messages: [
          { role: "user", content: userMessage },
          {
            role: "system",
            content: "You are MAYA, a warm, trauma-informed postpartum wellness assistant. Respond with compassion, clarity, and clinically grounded care."
          }
        ]
      })
    });

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: result?.content?.[0]?.text || "I'm here for you." })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Error contacting MAYA. Please try again later." })
    };
  }
};
