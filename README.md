# 🚀 HireLens AI: Smart Resume Builder & ATS Analyzer

**HireLens AI** is a premium, deterministic SaaS platform designed to help job seekers build ATS-optimized resumes, score their current resumes against industry standards, match keywords with targeted Job Descriptions (JDs), and generate AI-driven cover letters.

![HireLens AI Cover](/public/dashboard-preview.png) *(Note: Consider adding a screenshot of your dashboard here later!)*

---

## 🔥 Key Features

### 1. 📄 Interactive Resume Builder
*   **Dual-Paned Editor & Live Preview**: Edit your resume on the left and see real-time A4 PDF rendering on the right.
*   **Multiple Premium Templates**: Switch instantly between "Professional" (Standard/Harvard), "Modern", and "Creative" templates.
*   **Overflow Detection**: Strict single-page boundary checks with visual warnings if content overflows.
*   **AI Rewrite Integration**: Use AI to shorten, polish, and add impactful metrics to your experience bullet points with one click.
*   **Export to Word & PDF**: Full client-side document generation. 

### 2. 📊 Deterministic ATS Analyzer
*   **Resume Quality Mode**: Upload a PDF and instantly receive a deterministic score (35-95) based on formatting, keyword presence, action verbs, and quantification.
*   **Detailed Breakdown & Flags**: See exact scoring weights (Formatting, Experience, Impact, etc.) and actionable "Rule-Based Flags" (e.g., "Missing Metrics", "Passive Verbs").
*   **AI Insights Generation**: Click to receive customized OpenRouter AI insights explaining *how* to improve your specific score.
*   **Live PDF Editor Overlay**: After uploading, toggle a live editor to fix typos directly on the parsed text.

### 3. 🎯 Job Description (JD) Matcher
*   **Builder or PDF Source**: Analyze your currently active Resume Builder draft, or upload a brand-new PDF.
*   **Keyword Extraction Algorithm**: Compare your resume against a pasted JD to calculate an exact Alignment Score.
*   **Missing vs. Matched Keywords**: See exactly which skills the employer wants that you are missing.

### 4. ✍️ AI Cover Letter Generator
*   **Context-Aware Generation**: The engine reads your resume *and* the target JD to write highly tailored phrasing.
*   **Tone Selection**: Choose to sound Professional, Enthusiastic, or Direct.
*   **Live Rich Text Editor**: Tweak the generated text inside an A4-styled `contentEditable` div.
*   **Post-Generation AI Refining**: Select buttons to instantly "Polish," "Shorten," or add "+ Impact" to the generated letter.

### 5. ⚙️ Cloud Profiles & History 
*   **Firebase Authentication**: Secure Google and Email/Password login.
*   **7-Day Activity History**: Every resume edit, ATS scan, and cover letter is saved as a snapshot in Firestore. Easily resume past sessions natively. (Auto-expires after 7 days to save space).
*   **Profile Settings**: Manage display names, default templates, theme preferences (Dark/Light), and upload Avatars (stored directly via base64 compression—*no storage limits!*).

---

## 🛠️ Technology Stack

*   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + React 18
*   **Styling**: Tailwind CSS + `lucide-react` (Icons)
*   **Authentication & Database**: [Firebase](https://firebase.google.com/) (Auth + Firestore)
*   **AI Provider**: OpenRouter API (`google/gemini-2.5-flash` for high-speed, cost-effective inferences)
*   **Document Processing**: 
    *   `pdfjs-dist` (Client-side PDF text extraction)
    *   `docx` & `file-saver` (Word document generation)
    *   `react-to-print` (DOM-to-PDF rendering)

---

## 🚀 Local Development Setup

### Prerequisites
Make sure you have **Node.js 18+** installed.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/hire-lens-ai-resume-builder.git
cd hire-lens-ai-resume-builder/frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Duplicate the example variable file:
```bash
cp .env.example .env.local
```
Fill in `.env.local` with your own Firebase and OpenRouter keys:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## ☁️ Setting Up Firebase (Firestore Rules)

Because user avatars and history snapshots are stored directly in Firestore (bypassing expensive Cloud Storage arrays), you must apply the following Security Rules in your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow the user to read/write their own profile
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow the user to read/write their own history subcollections
      match /history/{historyId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 📦 Deployment (Vercel)

The easiest way to deploy HireLens AI is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. In the environment variables step, paste the contents of your `.env.local` file.
4. Click Deploy! 

*(Since the app relies heavily on Next.js App Router API routes for AI calls and server functions, Vercel provides the most optimized serverless architecture natively).*

---

## 📝 License
This project is licensed under the MIT License.
