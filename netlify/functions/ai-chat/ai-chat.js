// Contoh menggunakan Netlify Functions (memerlukan setup API Key)
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inisialisasi API Key dari Environment Variable (didefinisikan di Netlify UI)
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async (event, context) => {
  try {
    // Hanya izinkan metode POST
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const data = JSON.parse(event.body);
    const userMessage = data.message;

    // Panggil API Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
    });

    // Ambil teks balasan dari response
    const aiText = response.response.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: aiText }),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Gagal memproses permintaan AI." }),
    };
  }
};

