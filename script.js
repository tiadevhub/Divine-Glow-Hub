function searchProduct(){
    let input = document.getElementById("searchInput").value.toLowerCase();
    let cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        let text = card.innerText.toLowerCase();

        if(text.includes(input)){
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}
// ================================
// GLOWBOT CHATBOT
// ================================

const glowbotBtn = document.getElementById("glowbot-btn");
const glowbotChat = document.getElementById("glowbot-chat");
const glowbotClose = document.getElementById("glowbot-close");
const glowbotSend = document.getElementById("glowbot-send");
const glowbotInput = document.getElementById("glowbot-input");
const glowbotMessages = document.getElementById("glowbot-messages");

// Open chatbot
glowbotBtn.addEventListener("click", () => {
    glowbotChat.style.display = "block";
});

// Close chatbot
glowbotClose.addEventListener("click", () => {
    glowbotChat.style.display = "none";
});

// Send message
async function sendGlowbotMessage() {

    const message = glowbotInput.value.trim();

    if (message === "") {
        return;
    }

    // Show user's message
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = message;

    glowbotMessages.appendChild(userMessage);

    // Clear input
    glowbotInput.value = "";

    // Scroll to bottom
    glowbotMessages.scrollTop = glowbotMessages.scrollHeight;

    try {

        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        // Show bot reply
        const botMessage = document.createElement("div");
        botMessage.className = "bot-message";
        botMessage.textContent = data.reply || "Sorry, I couldn't understand that.";

        glowbotMessages.appendChild(botMessage);

        // Scroll to bottom
        glowbotMessages.scrollTop = glowbotMessages.scrollHeight;

    } catch (error) {

        console.error("GlowBot Error:", error);

        const errorMessage = document.createElement("div");
        errorMessage.className = "bot-message";
        errorMessage.textContent =
            "Sorry, I'm having trouble connecting right now. 😕";

        glowbotMessages.appendChild(errorMessage);
    }
}

// Send when button is clicked
glowbotSend.addEventListener("click", sendGlowbotMessage);

// Send when Enter is pressed
glowbotInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        sendGlowbotMessage();
    }

});