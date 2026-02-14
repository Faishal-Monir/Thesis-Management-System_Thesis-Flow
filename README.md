# CSE 471 - Thesis Management System

![Course](https://img.shields.io/badge/Course-CSE%20471-blue)
![Stack](https://img.shields.io/badge/Stack-MERN-0aa6a6)
![Backend](https://img.shields.io/badge/Backend-Express-000000?logo=express&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=000)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-2ea44f)

A web-based Thesis Management System to streamline thesis registration, supervision, progress tracking, and department workflows for students, faculty, and admins.

<div align="center">
  <a href="https://thesis-flow-delta.vercel.app" target="_blank" rel="noreferrer">
    <img alt="Live System" src="https://img.shields.io/badge/Live%20System-Open-2ea44f?logo=googlechrome&logoColor=white" />
  </a>
  <a href="https://www.youtube.com/watch?v=e9UFlQ8Vb-o" target="_blank" rel="noreferrer">
    <img alt="Demo Video" src="https://img.shields.io/badge/Demo%20Video-Watch-FF0000?logo=youtube&logoColor=white" />
  </a>
</div>

> Built as part of our **CSE-471 (System Analysis and Design)** course in **June 2025** (Semester: **Summer 2025**).

---

## Table of contents

- [Repository highlights](#repository-highlights)
- [Live system & demo](#live-system--demo)
- [Key highlights](#key-highlights)
- [Tech stack](#tech-stack)
- [Folder structure](#folder-structure)
- [Key features](#key-features)
- [How to run (Local / VS Code)](#how-to-run-local--vs-code)
- [Environment variables](#environment-variables)
- [Security note (important)](#security-note-important)
- [Project group members](#project-group-members)
- [License](#license)

---

## Repository highlights

- Separate `frontend/` (React) and `backend/` (Express) apps
- MongoDB-backed workflows via `mongoose`
- File uploads + serving static resources from the backend
- Integrations: Google auth, email (Nodemailer), Cloudinary, Groq AI

---

## Live system & demo

- **Live system:** https://thesis-flow-delta.vercel.app
- **Demo video:** https://www.youtube.com/watch?v=e9UFlQ8Vb-o

---

## Key highlights

| Area | Highlight |
| --- | --- |
| ![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socketdotio&logoColor=white) | Real-time collaboration using Socket.IO |
| ![Google OAuth](https://img.shields.io/badge/Google%20OAuth-4285F4?logo=google&logoColor=white) | Secure authentication via Google OAuth with role-based access control |
| ![AI Advisor](https://img.shields.io/badge/AI-Advisor-7c3aed) | AI-powered advisor for academic and career guidance |
| ![Workflows](https://img.shields.io/badge/Workflow-Automation-0aa6a6?logo=githubactions&logoColor=white) | Automated progress tracking and approval workflows |
| ![Cloud](https://img.shields.io/badge/Cloud-File%20Management-1f6feb) | Cloud-based file management and communication modules |
| ![Panels](https://img.shields.io/badge/Panels-Students%20%7C%20Faculty%20%7C%20Admins-6c757d) | Dedicated panels for students, faculty, and administrators |
| ![Plagiarism](https://img.shields.io/badge/Upcoming-Plagiarism%20Detection-f97316) | Upcoming feature: Plagiarism detection integration |

It is designed with scalability and security at its core, ensuring reliable performance and data protection as user demand grows.

---

## Tech stack

- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), Multer
- **Realtime:** Socket.IO (where enabled)
- **Auth/Integrations:** Google auth (OAuth) + role-based access control, Nodemailer, Cloudinary, Groq SDK

---

## Folder structure

### Backend

```text
backend/
  index.js
  package.json
  models/
  routes/
  files/
  uploads/
  .env.example
```

### Frontend

```text
frontend/
  src/
    components/
    pages/
    api.js
    App.js
  package.json
  tailwind.config.js
  .env.example
```

---

## Key features

### Student

- Thesis registration and group management
- Thesis progress submissions (P1/P2/P3-style uploads)
- Synopsis and proposal workflows
- Meeting booking requests
- Resources browsing / downloads

### Faculty

- Supervision dashboard (view groups, downloads, progress review)
- Feedback and correction requests
- Meeting approvals / management
- Domain management

### Admin

- Approval queues and request processing
- User and workflow administration

### AI features (if configured)

- Chatbot / advisor endpoints (backed by Groq) to guide users through platform features

---

## How to run (Local / VS Code)

### Prerequisites

- Node.js (recommended: **18+**)
- A MongoDB instance (local or cloud)

### Setup

1) Install dependencies

```bash
cd backend && npm install
cd ..\frontend && npm install
```

2) Configure environment variables

- Backend: copy `backend/.env.example` to `backend/.env`
- Frontend: copy `frontend/.env.example` to `frontend/.env`

3) Start backend (defaults to port `5005`)

```bash
cd backend
npm start
```

4) Start frontend (defaults to port `3000`)

```bash
cd frontend
npm start
```

---

## Environment variables

This repo ships with safe templates:

- `backend/.env.example`
- `frontend/.env.example`

---

## Security note (important)

If you accidentally committed secrets before:

- **Rotate the credentials immediately** (MongoDB URI, Cloudinary keys, email password, Google OAuth secrets, Groq API key, etc.)
- Make sure `backend/.env` and `frontend/.env` stay **untracked** and **ignored**

---

## Project group members

- [Nafiz Khan](https://github.com/Nafiz68)
- [Tahsin Tanni](https://github.com/TahsinTanni)
- [Umma Salma Mim](https://github.com/ummasalmamim)
- [Faishal Monir](https://github.com/Faishal-Monir)


---

## License

MIT License. See `LICENSE`.
