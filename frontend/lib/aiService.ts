let activeController: AbortController | null = null;
let lastRequestTime = 0;
const COOLDOWN_MS = 2000;

export async function improveSection(section: "summary" | "experience" | "projects", content: string): Promise<string> {
    // 1. Safety mechanisms (Anti-spam / Cooldown)
    const now = Date.now();
    if (now - lastRequestTime < COOLDOWN_MS) {
        throw new Error("Please wait a moment before trying again.");
    }

    // 2. Cancellation logic (AbortController race-condition prevention)
    if (activeController) {
        activeController.abort(); // Cancel the previous ongoing request
    }

    activeController = new AbortController();
    const signal = activeController.signal;

    try {
        lastRequestTime = Date.now();

        const response = await fetch("/api/ai-improve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ section, content }),
            signal
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "An error occurred while improving the content.");
        }

        return data.improvedContent;
    } catch (error: any) {
        if (error.name === "AbortError") {
            // We aborted the request intentionally because a new one started
            throw new Error("Request cancelled by a newer request.");
        }
        throw new Error(error.message || "Failed to connect to the optimization service.");
    } finally {
        // Cleanup the controller if it's the one we just created
        if (activeController?.signal === signal) {
            activeController = null;
        }
    }
}
