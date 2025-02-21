let submit = document.querySelector(".submit");
let input_text = document.querySelector(".inputField");
let user_content = document.querySelector(".user-content");
let user_text = document.querySelector(".user-text");
let content = document.querySelector(".content");
let bot_text = document.querySelector(".bot-text");
let bot_content = document.querySelector(".bot-content");
let fileUpload = document.querySelector(".fileUpload");
let fileButton = document.querySelector(".file");

API_KEY = "{Your_API_KEY}";
API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userMsg = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
};

const createMsg = (content, classes) => {
    const div = document.createElement("div");
    div.classList.add("message", classes);
    div.innerHTML = content;
    return div;
};

submit.addEventListener("click", () => {
    const get_msg = input_text.value.trim();
    if (!get_msg) return; // Prevent empty messages

    const textUser = `<div class="user-text">${get_msg}</div>`;
    const userDiv = createMsg(textUser, "user-content");
    content.appendChild(userDiv);
    userMsg.message = get_msg;
    input_text.value = "";

    // Auto-scroll to the latest message
    content.scrollTo({ top: content.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        const botMsg = `<span class="material-symbols-rounded tBot">local_cafe</span>
                        <p class="bot-text">Just a sec...</p>`;
        const botDiv = createMsg(botMsg, "bot-content");
        content.appendChild(botDiv);
        content.scrollTo({ top: content.scrollHeight, behavior: "smooth" });

        generateResponse(botDiv);
    }, 600);
});

const generateResponse = async (botDiv) => {
    const textElement = botDiv.querySelector(".bot-text");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: userMsg.message },
                        ...(userMsg.file.data ? [{ inline_data: userMsg.file }] : [])
                    ]
                }]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);
        const responseText = data.candidates[0].content.parts[0].text.trim();
        textElement.textContent = responseText;

        content.scrollTo({ top: content.scrollHeight, behavior: "smooth" });
    } catch (error) {
        textElement.textContent = "Sorry, an error occurred.";
    }
};

fileUpload.addEventListener("change", () => {
    const file = fileUpload.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
        const base64string = e.target.result.split(",")[1];

        userMsg.file = {
            data: base64string,
            mime_type: file.type
        }
        fileUpload.value = "";
    }

    reader.readAsDataURL(file);
});

fileButton.addEventListener("click", () => fileUpload.click());
