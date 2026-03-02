// Playwright script to test the JD Matcher UI
const { chromium } = require('playwright');
const fs = require('fs');

async function run() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Navigating to builder...');
        await page.goto('http://localhost:3000/dashboard/builder', { waitUntil: 'networkidle' });

        // Wait for the panel to load
        await page.waitForSelector('text="Job Description Matcher"');
        console.log('Panel found!');

        // Click the panel to expand it
        const panelHeader = await page.locator('button:has-text("Job Description Matcher")');
        await panelHeader.click();
        console.log('Expanded panel');

        // Type in a sample job description
        const sampleJD = `
      We are looking for a Senior Frontend Engineer to join our team.
      Requirements:
      - 5+ years of experience with React.js and Next.js
      - Strong knowledge of TypeScript and JavaScript
      - Experience with Tailwind CSS
      - Understanding of CI/CD pipelines
      - Familiarity with Node.js and REST APIs
      - Experience with testing (Jest, Cypress, Playwright)
      - Excellent communication skills
      - Ability to lead a team
    `;

        const textarea = await page.locator('textarea[placeholder*="Paste the job description"]');
        await textarea.fill(sampleJD);
        console.log('Filled job description');

        // Take a screenshot before analyzing
        await page.screenshot({ path: 'jd-matcher-before.png' });

        // Click Analyze Match
        const analyzeBtn = await page.locator('button:has-text("Analyze Match")');
        await analyzeBtn.click();
        console.log('Clicked Analyze');

        // Wait a brief moment for animation/results to show up
        await page.waitForTimeout(1000);

        // The circular match score should be present
        await page.waitForSelector('text="Match Results"');
        console.log('Analysis complete!');

        // Take a screenshot of the results
        await page.screenshot({ path: 'jd-matcher-results.png' });

        // Click Get AI Insights
        const aiBtn = await page.locator('button:has-text("Get AI Insights")');
        await aiBtn.click();
        console.log('Clicked AI Insights...');

        // Wait for insights (usually takes a few seconds)
        // Looking for the loaded content specifically - the Deep Alignment Analysis header tells us it's the right section
        await page.waitForSelector('.prose', { timeout: 15000 });
        console.log('AI Insights loaded!');

        // Add slightly more wait to let the CSS transitions slide perfectly
        await page.waitForTimeout(500);

        // Take a screenshot of the insights
        await page.screenshot({ path: 'jd-matcher-ai-insights.png' });

        console.log('Test completed successfully!');

        // Copy the screenshots to the artifacts directory
        const copyPromises = [
            fs.promises.copyFile('jd-matcher-before.png', 'C:\\Users\\vishal\\.gemini\\antigravity\\brain\\bbdf0eb9-a10a-4b1c-9109-68abceac9a39\\jd-matcher-before.png'),
            fs.promises.copyFile('jd-matcher-results.png', 'C:\\Users\\vishal\\.gemini\\antigravity\\brain\\bbdf0eb9-a10a-4b1c-9109-68abceac9a39\\jd-matcher-results.png'),
            fs.promises.copyFile('jd-matcher-ai-insights.png', 'C:\\Users\\vishal\\.gemini\\antigravity\\brain\\bbdf0eb9-a10a-4b1c-9109-68abceac9a39\\jd-matcher-ai-insights.png')
        ];
        await Promise.all(copyPromises);

    } catch (error) {
        console.error('Test failed:', error);
        await page.screenshot({ path: 'error-screenshot.png' });
    } finally {
        await browser.close();
    }
}

run();
