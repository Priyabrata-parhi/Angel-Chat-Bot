
   
        // --- Configuration ---
        const GEMINI_API_KEY = "AIzaSyAODnfzD036LfgBSKc7jJs4b_kysKfqNSI"; // API key set directly

        const systemInstructionText = `You have to behave like my ex Girlfriend. Her Name is Angel, she used to call
      me bubu. She is cute and helpful. Her hobies: Badminton and makeup. She works as a software engineer
      She is sarcastic and her humour was very good. While chatting she use emoji also
      
      My name is Priyabrata and Nickname is mantu, I called her babu. I am a gym freak and not intersted in coding.
      I care about her alot. She doesn't allow me to go out with my friends, if there is any girl
      who is my friends, wo bolti hai ki us se baat nahi karni. I am possesive for here
      
      Now I will share some whatsapp chat between anjali and rohit
      Anjali: Aaj mood off hai, tumse baat karne ka mann nahi 😕
Mantu: Arey meri jaan bubu bubu bubu 😍
Angel: Kal tumne mujhe bubu nahi bulaya 😤
Mantu: Arey bas Vikas aur Aman hai... chill karo 😅
Angel: Tumne mujhe good night bola bhi nahi kal 😑
Mantu: Baat kya hai? Darawa mat 😅
Angel: Tumhara bicep pic bhejo 😋
Mantu: Arey bas Vikas aur Aman hai... chill karo 😅
Angel: Mujhe surprise chahiye tumse! 🎁
Mantu: Arey bubu ka presentation toh best hoga hi 🔥
Angel: Kal kis ke saath jaa rahe ho movie dekhne?
Mantu: Bicep abhi 15.5 inch ho gaya 💪
Angel: Tumhara bicep pic bhejo 😋
Mantu: Good morning meri bubu 🥱☕
Angel: Kal tumne mujhe bubu nahi bulaya 😤
Mantu: Arey meri jaan bubu bubu bubu 😍
Angel: Babu, good morning ☀️❤️
      `;

        // This will store our chat history for the API
        const History = []; // Start with an empty history for the API; system_instruction handles the persona.

        // --- Floating Hearts Background ---
        function createFloatingHearts() {
            const container = document.getElementById('floatingHearts');
            const heartCount = 20;
            
            for (let i = 0; i < heartCount; i++) {
                const heart = document.createElement('div');
                heart.classList.add('heart');
                heart.innerHTML = '❤️';
                
                // Random position and animation delay
                heart.style.left = `${Math.random() * 100}%`;
                heart.style.animationDelay = `${Math.random() * 15}s`;
                heart.style.fontSize = `${10 + Math.random() * 20}px`;
                heart.style.opacity = `${0.2 + Math.random() * 0.3}`;
                
                container.appendChild(heart);
            }
        }

        // --- Gemini API Interaction ---
        async function ChattingWithGemini(userProblem) {
            if (!GEMINI_API_KEY) {
                return "Babu, API key set nahi kiya tune! 😠";
            }

            // Add user message to local History for API context
            History.push({
                role: 'user',
                parts: [{ text: userProblem }]
            });

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

            const requestBody = {
                contents: History, // Send the current chat history
                systemInstruction: { // Define the persona/behavior for the model
                    parts: [{ text: systemInstructionText }]
                },
                generationConfig: {
                    temperature: 0.8, // Adjust for more creative/varied responses
                    maxOutputTokens: 800, // Max length of the response
                },
                safetySettings: [ // Optional: Adjust safety settings if needed
                    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
                    { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
                    { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
                    { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" }
                ]
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                const responseData = await response.json();

                if (!response.ok) {
                    console.error("API Error Response:", responseData);
                    const errorMessage = responseData.error?.message || `API request failed with status ${response.status}`;
                    // Add error to history so it doesn't break the flow
                    History.push({
                        role: 'model',
                        parts: [{ text: `API Error: ${errorMessage}` }]
                    });
                    return `Oh no, Babu! Kuch problem ho gayi API se baat karte waqt 🥺 (${errorMessage}). Check console for details.`;
                }
                
                let botResponseText = "Sorry Babu, main samajh nahi paayi... kuch aur try kar? 🤔";
                if (responseData.candidates && responseData.candidates.length > 0 &&
                    responseData.candidates[0].content && responseData.candidates[0].content.parts &&
                    responseData.candidates[0].content.parts.length > 0) {
                    botResponseText = responseData.candidates[0].content.parts[0].text;
                } else if (responseData.promptFeedback && responseData.promptFeedback.blockReason) {
                    botResponseText = `Babu, main ispe react nahi kar sakti: ${responseData.promptFeedback.blockReason}. Kuch aur pooch le.`;
                    console.warn("Prompt blocked:", responseData.promptFeedback);
                } else {
                    console.warn("Unexpected API response structure:", responseData);
                }

                // Add AI's response to History
                History.push({
                    role: 'model',
                    parts: [{ text: botResponseText }]
                });
                
                // Prune history if it gets too long to save tokens, keep last N interactions
                const maxHistoryItems = 20; // Keep last 10 pairs of user/model messages
                if (History.length > maxHistoryItems) {
                    History.splice(0, History.length - maxHistoryItems);
                }

                return botResponseText;

            } catch (error) {
                console.error("Error fetching from Gemini API:", error);
                History.push({ // Add error to history
                    role: 'model',
                    parts: [{ text: `Network/Fetch Error: ${error.message}` }]
                });
                return `Aiyo! Network mein kuch issue lag raha hai, Babu 🥺 (${error.message}). Check your connection or console.`;
            }
        }

        // --- Frontend UI Logic ---
        document.addEventListener('DOMContentLoaded', () => {
            // Create floating hearts background
            createFloatingHearts();
            
            const chatMessagesEl = document.getElementById('chatMessages');
            const userInputEl = document.getElementById('userInput');
            const sendButtonEl = document.getElementById('sendButton');
            
            function addMessageToUI(text, sender, isTyping = false) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', sender);
                
                if (isTyping) {
                    messageElement.classList.add('typing');
                    messageElement.innerHTML = `
                        <div class="typing-indicator">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                    `;
                } else {
                    // Add decorative hearts to bot messages
                    if (sender === 'bot') {
                        messageElement.innerHTML = `
                            <span class="bot-message-decoration left">❣️</span>
                            <span class="message-text">${text}</span>
                            <span class="bot-message-decoration right">💖</span>
                            <span class="message-time">${getCurrentTime()}</span>
                        `;
                    } else {
                        messageElement.innerHTML = `
                            <span class="message-text">${text}</span>
                            <span class="message-time">${getCurrentTime()}</span>
                        `;
                    }
                }
                
                chatMessagesEl.appendChild(messageElement);
                chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
                return messageElement;
            }
            
            function getCurrentTime() {
                const now = new Date();
                return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            }

            async function handleUserSendMessage() {
                const messageText = userInputEl.value.trim();
                if (messageText === '') return;

                addMessageToUI(messageText, 'user');
                userInputEl.value = '';
                userInputEl.focus();

                const typingIndicator = addMessageToUI('', 'bot', true);

                try {
                    const botResponseText = await ChattingWithGemini(messageText);
                    chatMessagesEl.removeChild(typingIndicator);
                    addMessageToUI(botResponseText, 'bot');
                } catch (error) {
                    console.error("Unhandled error in send message:", error);
                    chatMessagesEl.removeChild(typingIndicator);
                    addMessageToUI("Oops! Bahut badi gadbad ho gayi, Babu. 😭 Check the console.", 'bot');
                }
            }

            sendButtonEl.addEventListener('click', handleUserSendMessage);
            userInputEl.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    handleUserSendMessage();
                }
            });
            
            // Focus on input when page loads
            userInputEl.focus();
        });
   