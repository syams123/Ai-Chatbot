// Contoh menggunakan Netlify Functions (memerlukan setup API Key)
const { GoogleGenAI } = require('@google/genai');

// Inisialisasi API Key dari Environment Variable (didefinisikan di Netlify UI)
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY); 

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
             contents: [{ role: "user", parts: [{ text: userMessage }] }]
        });
        
        const aiText = response.text; // Ambil teks balasan
        
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