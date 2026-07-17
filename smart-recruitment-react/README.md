# 🧠 SmartRecruit AI — AI-Powered Smart Recruitment Management System (React Edition)

A full-stack recruitment platform: **React (Vite) frontend + Node/Express backend + MySQL
database**, with real Create/Read/Update/Delete on every dashboard — jobs, candidates,
interviews, and users all update live from the database, not demo/mock data.

---

## 📁 Project Structure

```
smart-recruitment-react/
├── frontend/                      # React app (Vite)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx                 # App entry point
│       ├── App.jsx                  # Route definitions
│       ├── api/                     # Axios service layer (one file per resource)
│       │   ├── client.js              # Axios instance + JWT header injection
│       │   ├── authApi.js
│       │   ├── jobsApi.js
│       │   ├── candidatesApi.js
│       │   ├── interviewsApi.js
│       │   ├── adminApi.js
│       │   └── resumeApi.js
│       ├── context/
│       │   ├── AuthContext.jsx        # Logged-in user + login/register/logout
│       │   └── ToastContext.jsx       # Toast notifications
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── DashboardLayout.jsx    # Sidebar shell shared by all 3 dashboards
│       │   ├── ProtectedRoute.jsx     # Role-based route guard
│       │   ├── Modal.jsx
│       │   └── ScoreRing.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── NotFound.jsx
│       │   └── dashboards/
│       │       ├── CandidateDashboard.jsx
│       │       ├── RecruiterDashboard.jsx
│       │       └── AdminDashboard.jsx
│       └── styles/                    # Same navy-glassmorphism CSS as before
│
├── backend/                        # Node.js + Express REST API (unchanged core, extended CRUD)
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── config/db.js
│   ├── middleware/
│   ├── controllers/
│   ├── routes/
│   └── utils/
│       ├── aiEngine.js
│       └── parseResume.js
│
└── database/
    ├── schema.sql
    └── seed.sql
```

---

## 🔄 What changed from the plain HTML version

1. **Real React app** — Vite + React Router, not static HTML pages.
2. **No more demo/local fallback data** — every dashboard calls the real backend API.
   If the backend or database isn't reachable, you'll see a toast error instead of fake data.
3. **Full CRUD wired end-to-end**:
   - **Jobs**: Create, edit, delete, toggle Active/Paused — recruiter & admin.
   - **Candidates/Applications**: Change pipeline stage (dropdown or Kanban "Move" button),
     remove application — updates MySQL immediately, dashboard re-fetches automatically.
   - **Interviews**: Schedule, mark completed, cancel — persisted in MySQL.
   - **Users** (Admin): Add, edit (name/email/role), suspend/activate, delete.
4. Every create/update/delete action **re-fetches the list from the database** right after,
   so what you see on screen always matches what's actually stored — no manual refresh needed.

---

## 🔧 Full Setup

### 1. Database (you already have MySQL running)
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p smart_recruitment_db < database/seed.sql
```
This creates `smart_recruitment_db` with all tables and demo accounts
(all passwords: `Password123`).

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_recruitment_db
JWT_SECRET=some_long_random_string
CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173
```
Then run:
```bash
npm run dev
```
API runs at `http://localhost:5000`. Test: `http://localhost:5000/api/health`

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
This opens `http://localhost:5173` automatically. The `.env` already points to
`http://localhost:5000/api` by default — only change it if your backend runs elsewhere.

> **Run backend first, then frontend** — the frontend expects the API to be reachable
> immediately on login/register.

### Demo accounts (after seeding)
| Role      | Email                          | Password      |
|-----------|--------------------------------|---------------|
| Admin     | admin@smartrecruit.ai          | Password123   |
| Recruiter | vikram.singh@company.com       | Password123   |
| Candidate | ananya.sharma@email.com        | Password123   |

---

## ✅ How to verify the "live database" behavior

1. Log in as the recruiter (`vikram.singh@company.com`).
2. Go to **Jobs → New Job**, create a job, save it.
3. Open MySQL and run `SELECT * FROM jobs ORDER BY id DESC LIMIT 1;` — your new job is there.
4. Edit that job's title in the dashboard, save — refresh the page — the new title persists
   (it's reading from MySQL, not local state).
5. Delete it from the dashboard — confirm — it's gone from `SELECT * FROM jobs`.

Same pattern applies to candidates' pipeline stage, interviews, and admin user management.

---

## 🤖 AI Resume Analysis

Unchanged in logic from the previous version — `backend/utils/aiEngine.js` scores resumes
against job descriptions using weighted skill-matching, action-verb detection, experience
parsing, and completeness. Both the Candidate "Resume Analysis" tab and the Recruiter
"Resume Analysis" (bulk screening) tab call the same `POST /api/resume/analyze` endpoint —
no client-side fallback anymore, so this also requires the backend to be running.

---

## 🎨 Design

Same navy-gradient glassmorphism theme as before — colors, blur, hover-lift cards, animated
gradient background, and full responsiveness (phone/tablet/laptop/desktop) — now implemented
as reusable CSS files imported once in `main.jsx` and applied globally via class names,
exactly like the original.

---

## 🌐 Deployment Guide

### Frontend (Vite build) → Netlify / Vercel
```bash
cd frontend
npm run build     # outputs to frontend/dist
```
Deploy the `dist` folder (Netlify: drag-and-drop or connect Git with **Build command:**
`npm run build`, **Publish directory:** `frontend/dist`). Set the environment variable
`VITE_API_URL` in your host's dashboard to your deployed backend URL before building.

### Backend → Render / Railway
Same as before: root directory `backend`, build command `npm install`, start command
`npm start`, environment variables from `.env.example`. Update `CLIENT_URL` to your deployed
frontend's URL(s).

### Database → PlanetScale / Railway MySQL / Aiven
Run `schema.sql` + `seed.sql` against your hosted MySQL instance, then point the backend's
`DB_*` environment variables at it.

### Post-deployment checklist
- [ ] `VITE_API_URL` (frontend) points to your live backend.
- [ ] `CLIENT_URL` (backend) includes your live frontend domain — comma-separated if you have
      more than one (e.g. staging + production).
- [ ] Strong random `JWT_SECRET` in production.
- [ ] HTTPS on both frontend and backend.
- [ ] Change/remove demo seed accounts before real users sign up.

---

## 🛠️ Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, Vite, React Router 6, Axios, Chart.js + react-chartjs-2, Font Awesome |
| Backend   | Node.js, Express.js, JWT, bcrypt.js, Multer, pdf-parse, mammoth |
| Database  | MySQL 8 |
| AI Engine | Custom rule-based NLP scoring (keyword extraction + heuristics) |

---

Built with ❤️ and AI-powered innovation.
