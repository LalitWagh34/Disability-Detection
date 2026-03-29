<div align="center">

<img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss" />
<img src="https://img.shields.io/badge/Groq-LLaMA 3.3 70B-F55036?style=for-the-badge" />
<img src="https://img.shields.io/badge/Dexie-IndexedDB-FF6B35?style=for-the-badge" />

<br /><br />

# 🧠 LearnAble

### AI-Powered Learning Disability Screening & Intervention Platform for Children

*Early detection of Dyslexia, Dysgraphia & Dyscalculia — through adaptive games, real-time AI diagnosis, and personalised learning paths.*

<br />

</div>

---

## 📌 Overview

**LearnAble** is a web-based platform that helps identify and support children (ages 6–14) with learning disabilities. Instead of clinical assessments that require expensive specialists, LearnAble uses **interactive game-based tests**, a **weighted evidence-based screening engine**, and a **Groq-powered AI tutor** to screen children early and provide instant, actionable intervention.

> 

---

## ✨ Features

### 🎯 Assessment Engine
- **Dyslexia Test** — phonics, spelling, visual recognition, and working memory tasks with per-question response time tracking
- **Dysgraphia Test** — canvas-based handwriting with stroke analysis (pen lifts, path length, speed variance)
- **Dyscalculia Test** — arithmetic, number sequences, word problems, and estimation under timed conditions

### 🤖 AI Diagnosis (`AiDiagnosis.ts`)
Evidence-based screening engine replacing naive ML — mirrors published rubrics (DST, WRAT, Connelly 2006):
- Per-category accuracy breakdown
- Response latency analysis per question
- Answer-change frequency tracking (indecision signal)
- Stroke biomechanics for dysgraphia
- Returns `risk`, `probability`, `breakdown`, and human-readable `flags[]`

### 🦉 Owly — AI Tutor Chatbot
- Powered by **Groq API** (`llama-3.3-70b-versatile`)
- Full conversation history maintained per session
- System prompt tuned for child-friendly, encouraging, LearnAble-aware responses
- Animated typing indicator, error handling, disabled state during loading

### 🎮 Intervention Games
Post-assessment gamified learning modules per disability:

| Disability | Module 1 | Module 2 | Checkpoint |
|---|---|---|---|
| Dyslexia | Phonics Adventure | Sight Word Safari | Quiz |
| Dysgraphia | Maze Master | Tracing Game | Quiz |
| Dyscalculia | Math Race | Shape Sorter | Quiz |

### 🏆 Gamification System
- XP → Level progression (100 XP per level)
- Hearts (lives), Gems (currency), Day Streak
- Power-up shop, unit completion tracking
- All persisted locally via **Dexie (IndexedDB)** — no backend needed

### 📊 Reports & Parent Portal
- Full diagnostic report with radar chart, bar charts, confidence gauge
- PDF export via `jsPDF` + `html2canvas`
- Separate parent-facing dashboard
- Specialist finder page

### 🪪 Learner Identity Card (Profile)
- Unique generative **brain fingerprint** SVG — mathematically derived from each child's scores
- Holographic tilt effect on hover (3D CSS perspective)
- Physical card flip animation — front shows identity & sonar rings, back shows actions
- Sonar pulse rings per disability, animated on load

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS 3 + inline CSS variables |
| Animations | Framer Motion 12 |
| Local Database | Dexie (IndexedDB wrapper) |
| AI Tutor | Groq API — `llama-3.3-70b-versatile` |
| ML Runtime | TensorFlow.js (`@tensorflow/tfjs`) |
| PDF Export | jsPDF + html2canvas |
| Icons | Lucide React |
| Type Safety | TypeScript 5 |
| Auth | Custom context + localStorage session |
| i18n | Custom `i18n.ts` (English, Hindi, Marathi) |

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Landing page
│   ├── dashboard/              # Main learner dashboard
│   ├── profile/                # Learner Identity Card
│   ├── assessment/
│   │   ├── dyslexia/
│   │   ├── dysgraphia/
│   │   └── dyscalculia/
│   ├── learn/                  # Intervention modules (6 routes)
│   ├── report/                 # Full diagnostic report
│   ├── parent/                 # Parent dashboard
│   ├── specialists/            # Specialist finder
│   ├── login/
│   └── signup/
│
├── components/
│   ├── assessment/
│   │   ├── AssessmentManager.tsx
│   │   ├── AssessmentShell.tsx
│   │   ├── CanvasDraw.tsx      # Handwriting canvas
│   │   ├── DyslexiaTest.tsx
│   │   ├── DysgraphiaTest.tsx
│   │   ├── DyscalculiaTest.tsx
│   │   └── VoiceInput.tsx
│   ├── learning/
│   │   ├── dyslexia/           # PhonicsGame, SightWordSafari
│   │   ├── dysgraphia/         # MazeMaster, TracingGame
│   │   ├── dyscalculia/        # MathRace, ShapeSorter
│   │   ├── CheckpointQuiz.tsx
│   │   └── ModuleShell.tsx
│   ├── report/
│   │   └── DownloadReportButton.tsx
│   └── ui/
│       ├── AiChatWidget.tsx    # Owly — Groq-powered tutor
│       ├── RadarChart.tsx
│       ├── TextToSpeech.tsx
│       ├── Button.tsx
│       └── Input.tsx
│
├── context/
│   ├── AuthContext.tsx         # Auth + gamification state
│   └── ThemeContext.tsx        # Light/dark mode
│
├── db/
│   └── db.ts                  # Dexie schema (Users, Assessments)
│
├── hooks/
│   ├── useAdaptiveDifficulty.ts
│   ├── useAttention.ts
│   └── useGameSounds.ts
│
├── lib/
│   ├── NeuralNetwork.ts        # Custom feedforward NN (TypeScript)
│   └── i18n.ts                # Multilingual strings
│
└── services/
    ├── AiDiagnosis.ts          # Evidence-based screening engine
    ├── AttentionService.ts
    ├── GameAiService.ts
    └── VisionService.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm
- A [Groq API key](https://console.groq.com) (free tier available)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/learnable.git
cd learnable

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

```bash
# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_GROQ_API_KEY` | ✅ Yes | Groq API key for Owly AI tutor |

> **Note:** No backend or database server required. All user data is stored locally in the browser via IndexedDB (Dexie). The app works fully offline after the initial load except for the AI chat feature.

---

## 🧪 How the Screening Works

```
User completes interactive test
        ↓
Raw signals collected per question
(score, timeTaken, penLifts, strokeVariance, answerChanges...)
        ↓
AiDiagnosis.ts — Evidence-based scoring engine
        ↓
Weighted risk score (0–100) across sub-categories
        ↓
Risk Level: Low / Moderate / High
+ Probability score (0.0–1.0)
+ Breakdown per category
+ Human-readable flags[]
        ↓
Saved to IndexedDB → Report generated
```

### Screening Signal Weights

**Dyslexia**
| Signal | Max Weight |
|---|---|
| Phonetic accuracy | 14 pts |
| Spelling accuracy | 12 pts |
| Phonics/visual split | 20 pts |
| Response latency | 12 pts |
| Answer change rate | 15 pts |

**Dyscalculia**
| Signal | Max Weight |
|---|---|
| Arithmetic accuracy | 16 pts |
| Sequence accuracy | 14 pts |
| Word problem accuracy | 10 pts |
| Arithmetic latency | 25 pts |
| Indecision rate | 15 pts |

---

## 📸 Pages

| Route | Description |
|---|---|
| `/` | Landing page with feature overview |
| `/signup` `/login` | Auth pages |
| `/dashboard` | Learner hub — XP, hearts, lesson map |
| `/assessment/dyslexia` | Interactive dyslexia screening test |
| `/assessment/dysgraphia` | Canvas handwriting test |
| `/assessment/dyscalculia` | Math screening test |
| `/learn/dyslexia_1` | Phonics Adventure game |
| `/learn/dyslexia_2` | Sight Word Safari |
| `/learn/dysgraphia_1` | Maze Master |
| `/learn/dyscalculia_1` | Math Race |
| `/profile` | Learner Identity Card (holographic) |
| `/report` | Full diagnostic report + PDF export |
| `/parent` | Parent-facing dashboard |
| `/specialists` | Find local specialists |
| `/practice` | Free practice mode |

---

## 🌐 Multilingual Support

LearnAble supports **English**, **Hindi**, and **Marathi** via a custom `i18n.ts` utility — making it accessible to children across Maharashtra and beyond.

---

## 🔒 Privacy

- **Zero data leaves the device.** All assessment results, user profiles, and progress are stored entirely in the browser's IndexedDB.
- No analytics, no tracking, no server-side storage.
- Account deletion wipes all local data immediately.
- The only external call is to the Groq API for the AI chat feature (no user data is included in the prompt beyond the conversation text).

---

## 🛣️ Roadmap

- [ ] Python ML training pipeline on real behavioural dataset
- [ ] TensorFlow.js model inference replacing rule-based engine
- [ ] Teacher / school dashboard
- [ ] Progress tracking over multiple sessions
- [ ] Voice-first mode for non-readers
- [ ] Android PWA packaging

---



---

## 📄 License

This project is for academic and educational purposes.

---

<div align="center">
  <i>Built with ❤️ to make learning accessible for every child.</i>
</div>