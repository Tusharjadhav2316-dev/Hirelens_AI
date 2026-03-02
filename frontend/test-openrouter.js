const fs = require('fs');

// Read the .env.local file to get the key directly
const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/OPENROUTER_API_KEY=(.+)/);
const key = match ? match[1].trim() : null;

async function test() {
    console.log("Testing with key starting with:", key ? key.substring(0, 6) : "null");

    if (!key) {
        console.log("No key found in .env.local");
        return;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "google/gemini-1.5-flash",
            messages: [{ role: "user", content: "Hi" }]
        })
    });

    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text);
}

test();
