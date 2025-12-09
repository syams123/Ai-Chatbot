document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatArea = document.getElementById('chat-area');
    const imageBtn = document.getElementById('image-btn');

    // --- Fungsi Bantuan Front-end ---

    /**
     * Menambahkan pesan (teks atau gambar) ke chat area.
     * @param {string} content - Konten pesan (teks atau URL gambar)
     * @param {string} sender - 'user' atau 'system'
     * @param {string} type - 'text' atau 'image'
     * @returns {HTMLElement} messageDiv yang baru dibuat
     */
    function addMessage(content, sender, type = 'text') {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'system-message');
        
        if (type === 'image') {
            const img = document.createElement('img');
            img.src = content;
            img.alt = 'Generated Image';
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            messageDiv.appendChild(img);
        } else {
            const p = document.createElement('p');
            p.textContent = content;
            messageDiv.appendChild(p);
        }
        
        chatArea.appendChild(messageDiv);
        
        // Gulir ke bawah otomatis
        chatArea.scrollTop = chatArea.scrollHeight;
        return messageDiv;
    }

    // --- Logika Integrasi Backend ---

    /**
     * Mengirim pesan teks ke Netlify Function dan menampilkan balasan.
     * @param {string} userText - Pesan yang diketik pengguna
     */
    async function sendMessageToAI(userText) {
        // Tampilkan indikator loading atau pesan 'mengetik'
        const loadingMessage = addMessage("AI sedang berpikir...", 'system'); 

        // Tentukan apakah pengguna meminta gambar
        const isImageRequest = userText.toLowerCase().includes('gambar') || userText.toLowerCase().includes('generate image');

        try {
            const endpoint = isImageRequest ? '/.netlify/functions/image-generate' : '/.netlify/functions/ai-chat';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userText })
            });

            const data = await response.json();

            // Hapus pesan loading
            loadingMessage.remove(); 

            if (response.ok) {
                if (isImageRequest) {
                    // Jika ini adalah permintaan gambar
                    if (data.image_url) {
                        addMessage('Gambar berhasil dibuat:', 'system');
                        addMessage(data.image_url, 'system', 'image'); // Tampilkan gambar
                    } else {
                        addMessage("API Gambar sedang maintenance. Balasan: " + (data.reply || "No URL provided."), 'system');
                    }
                } else {
                    // Tampilkan balasan teks dari AI
                    addMessage(data.reply, 'system');
                }
            } else {
                addMessage(`Error dari AI (${endpoint}): ${data.error || 'Server error.'}`, 'system');
            }

        } catch (error) {
            loadingMessage.remove();
            console.error('Error fetching AI response:', error);
            addMessage('Terjadi kesalahan koneksi atau endpoint.', 'system');
        }
    }

    // --- Event Listeners ---

    // Event listener untuk pengiriman formulir (tekan Enter/Tombol Kirim)
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userText = userInput.value.trim();

        if (userText) {
            // 1. Tampilkan pesan pengguna
            addMessage(userText, 'user');
            
            // 2. Kirim pesan ke Netlify Function
            sendMessageToAI(userText); 

            // 3. Bersihkan input
            userInput.value = '';
            userInput.style.height = 'auto'; // Reset tinggi textarea
        }
    });

    // Event listener untuk tombol Gambar (simulasi awal, akan memicu prompt generate jika input kosong)
    imageBtn.addEventListener('click', () => {
        if (!userInput.value.trim()) {
            userInput.value = "Generate gambar bertema...";
            userInput.focus();
        } else {
             // Jika ada teks, hanya fokuskan
             userInput.focus();
        }
        // Fungsi submit akan menangani logika generate gambar jika teksnya mengandung kata kunci
    });

    // Otomatis atur tinggi textarea saat mengetik
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    });
});