import os
import httpx
from typing import Optional

MODELS_TO_TRY = ["google/gemini-2.5-flash", "meta-llama/llama-3.3-70b-instruct"]

def call_openrouter_api(system_prompt: str, user_prompt: str, max_tokens: int = 1000) -> Optional[str]:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key or not api_key.strip():
        return None

    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "Content-Type": "application/json"
    }

    for model in MODELS_TO_TRY:
        payload = {
            "model": model,
            "temperature": 0.3,
            "max_tokens": max_tokens,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        }

        try:
            with httpx.Client(timeout=15.0) as client:
                resp = client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                    if content:
                        return content
                else:
                    print(f"[OpenRouter Client] Model {model} returned HTTP {resp.status_code}")
        except Exception as e:
            print(f"[OpenRouter Client] Exception for model {model}: {str(e)}")

    return None
