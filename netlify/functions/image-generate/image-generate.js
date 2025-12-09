// Contoh menggunakan OpenAI DALL-E untuk Image Generation
const OpenAI = require('openai');

// Inisialisasi API Key untuk OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }
    
    try {
        const data = JSON.parse(event.body);
        const prompt = data.message;
        
        // Panggil API DALL-E 
        const response = await openai.images.generate({
            model: "dall-e-3", // Atau "dall-e-2"
            prompt: prompt,
            n: 1, 
            size: "1024x1024",
        });
        
        const imageUrl = response.data[0].url; 
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                reply: `Gambar untuk "${prompt}" berhasil dibuat.`,
                image_url: imageUrl 
            }),
        };

    } catch (error) {
        console.error("Image API Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Gagal membuat gambar." }),
        };
    }
};