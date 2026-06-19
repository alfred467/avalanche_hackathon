# K-ELF (Kenyan Equity Legal Framework) System Architecture

## Overview
K-ELF is an interactive web-based legal document generator tailored to the Kenyan startup ecosystem, compliant with the Companies Act 2015, Constitution of Kenya, and internationally recognized legal standards.

## Tech Stack
- **Backend:** Node.js, TypeScript
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla)
- **AI Integration:** Groq API (Llama3-8b)

## Core Components

### 1. Backend Server (`server.ts`)
A custom lightweight TypeScript server responsible for:
- Serving static assets (`/frontend/*`).
- Clean URL routing (e.g., `/generator` -> `/frontend/generator.html`).
- Handling AI generation requests (`/api/ai` and `/api/ai-generate`) by proxying to the Groq API securely using `dotenv`.
- Smart fallback logic to prevent 404s on static files.

### 2. Frontend App (`app.js`)
The core controller for the document generator.
- **Form State & Calculators:** Real-time updates of company details, valuation caps, and stamp duty.
- **Undo/Redo System:** Captures form and document state into memory stacks to allow seamless rollbacks.
- **Live Document Editing:** Transforms the HTML view into a full rich-text editor, behaving like Microsoft Word, complete with a formatting toolbar.
- **AI Wizard Integration:** Manages the conversational modal where users describe their company, taking the Groq API JSON response and mapping it directly to form fields.

### 3. Legal Templates (`templates/`)
- `safe.js`: Defines the K-SAFE (Simple Agreement for Future Equity) document structure, boilerplate clauses, plain English translations, and Kenyan legal context.
- `founder.js`: Defines the K-FOUNDER agreement for co-founder vesting schedules and IP assignment.

### 4. User Interface (`generator.html` & `wizard.css`)
Provides a dual-pane workspace:
- **Left Panel:** Settings and variables.
- **Center Canvas:** The document itself, resembling a real A4 paper page.
- **Right Panel:** The "Clause Translator" sidebar, which surfaces plain English annotations, Swahili translations, and risk assessments for any highlighted clause.

## Key Features
- **Conversational Onboarding:** Tell the AI about the deal, and it fills the document.
- **Clause Actions:** Instantly simplify, strengthen, translate, or assess risk via Groq AI.
- **Rich Text Editing:** Edit the document exactly like Microsoft Word.
- **Version Control:** Save and load document versions locally.
- **Exporting:** Download as Markdown (`.md`) or Microsoft Word (`.docx`), or email the draft instantly.
- **Offline Reliability:** Auto-saves progress to `localStorage`.
