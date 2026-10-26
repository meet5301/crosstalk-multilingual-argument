// Optional production translation proxy.
// Configure a TRANSLATION_API_URL and TRANSLATION_API_KEY in Netlify environment variables
// for the provider you choose. Do not expose secrets in browser JavaScript.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  return {
    statusCode: 501,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      error: "Production translation provider not configured.",
      message: "Use the browser demo or connect a translation provider here."
    })
  };
};
