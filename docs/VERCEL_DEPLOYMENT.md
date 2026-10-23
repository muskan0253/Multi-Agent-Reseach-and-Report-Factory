# Vercel Deployment Guide

Deploying the **Multi-Agent Research and Report Factory** on Vercel takes 1 minute via the Vercel Web Dashboard.

---

## 1-Click Deployment via Vercel Dashboard (Recommended)

1. **Log in to Vercel**:
   Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account (`AnushkaTandon26`).

2. **Import Repository**:
   - Click **"Add New..."** &rarr; **"Project"**.
   - Select your repository: `AnushkaTandon26/Multi-Agent-Reseach-and-Report-Factory`.
   - Click **"Import"**.

3. **Configure Build Settings**:
   - **Framework Preset**: Next.js (automatically detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install --legacy-peer-deps` (pre-configured in `vercel.json`)

4. **Environment Variables (Optional)**:
   - `GEMINI_API_KEY`: *(Optional)* If you have a Google Gemini API key, add it here. If omitted, the factory will execute intelligent heuristics and live web search seamlessly.

5. **Deploy**:
   - Click **"Deploy"**.
   - In ~45 seconds, your app will be live with a URL like:
     `https://multi-agent-reseach-and-report-factory.vercel.app`

---

## Post-Deployment: Exam Studio Submission URL
Once deployed, copy your production Vercel URL and paste it into the **Project URL** field on the [Exam Studio Submission Portal](https://examstudioca3.thecoachdinesh.com/project/artifacts).
