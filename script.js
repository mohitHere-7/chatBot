let prompt = document.querySelector("#prompt");
let submit = document.querySelector("#submit");

let chatContainer = document.querySelector(".chat-container");
let imageBtn = document.querySelector("#image");
let imageInput = document.querySelector("#image input");
let image = document.querySelector("#image img");

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDpSXABP1C8s5GZHTdKslkJwHJq_zGs8Lo";

let user = {
  message: null,
  file: { mime_type: null, data: null },
};

function formatText(text) {
  // Replace markdown-like formatting with HTML tags

  return (
    text
      // Headings (## or ### or #)
      .replace(/^### (.+)$/gm, "<h3>$1</h3>") // H3
      .replace(/^## (.+)$/gm, "<h2>$1</h2>") // H2
      .replace(/^# (.+)$/gm, "<h1>$1</h1>") // H1

      // Bold (**text** or __text__)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // Bold with **
      .replace(/__(.+?)__/g, "<strong>$1</strong>") // Bold with __

      // Italics (*text* or _text_)
      .replace(/\*(.+?)\*/g, "<em>$1</em>") // Italics with *
      .replace(/_(.+?)_/g, "<em>$1</em>") // Italics with _

      // Inline code `code`
      .replace(/`(.+?)`/g, "<code>$1</code>") // Inline code

      // Code block ```code```
      .replace(/```([\s\S]+?)```/g, "<pre><code>$1</code></pre>") // Code block

      // Unordered list (* or -)
      .replace(/^\* (.+)$/gm, "<ul><li>$1</li></ul>") // Unordered list with *
      .replace(/^- (.+)$/gm, "<ul><li>$1</li></ul>") // Unordered list with -

      // Ordered list (1. 2. etc.)
      .replace(/^\d+\. (.+)$/gm, "<ol><li>$1</li></ol>") // Ordered list

      // Line breaks for new lines
      .replace(/\n/g, "<br>")
  ); // New lines
}

async function generateResponse(aiChatBox) {
  let text = aiChatBox.querySelector(".ai-chat-area");

  let requestOption = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: user.message },
            user.file.data
              ? [
                  {
                    inline_data: user.file,
                  },
                ]
              : [],
          ],
        },
      ],
    }),
  };
  try {
    let response = await fetch(API_URL, requestOption);
    let data = await response.json();

    let apiResponse = formatText(data.candidates[0].content.parts[0].text);

    text.innerHTML = apiResponse;
  } catch (err) {
    console.log(err);
    console.log("api error");
  } finally {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
    image.src = 'gallery.png';
    image.classList.remove("choose")
    user.file = { mime_type: null, data: null }
  }
}

function createChatBox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;

  div.classList.add(classes);

  return div;
}

function handleChatResponse(message) {
  user.message = message;


  let html = ` 
        <div class="user-chat-area">
          ${user.message}
          ${
            user.file.data
              ? `<img src="data:${user.file.mime_type};base64, ${user.file.data}" class="choosing" />`
              : ""
          }
        <img id="user-image" src="user.png" alt="" width="9%" class="user-chat-img" />
        </div>`;
  let userChatBox = createChatBox(html, "user-chat-box");
  chatContainer.appendChild(userChatBox);
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth",
  });

  setTimeout(() => {
    let html = `<div><img src="ai.jpg" alt="" id="ai-image" width="4%"/></div>
        <div class="ai-chat-area">
        <img src="loading.gif" alt="" class="load" width="175" height="49px" style="mix-blend-mode: multiply; border-radius:50%">
        </div>`;

    let aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    generateResponse(aiChatBox);
  }, 600);
}

prompt.addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    handleChatResponse(prompt.value);
    prompt.value = "";
  }
});

submit.addEventListener("click", ()=>{
  handleChatResponse(prompt.value)
})

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  // console.log(file);
  if (!file) return;
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    console.log(e);
    let base64String = e.target.result.split(",")[1];

    user.file = { mime_type: file.type, data: base64String };
    // console.log(user.file);

    image.src = `data:${user.file.mime_type};base64,${user.file.data}`
    image.classList.add("choose")
  };


});

imageBtn.addEventListener("click", () => {
  imageBtn.querySelector("input").click();
});


