# CivicFlow — AI-Powered Civic Issue Reporting & Verification Platform

CivicFlow is a production-quality, full-stack web application designed for modern smart-city organizations. It streamlines the complete civic issue lifecycle:

**REPORT → ANALYZE → PRIORITIZE → ASSIGN → RESOLVE → VERIFY**

---

## 🌟 Core Features

1. **AI-Powered Classification (Amazon Bedrock)**: Automatically categorizes reported issues, estimates severity, assigns responsible departments, and summarizes descriptions.
2. **Community Duplicate Detection**: Detects geographic proximity and similar categories to prevent redundant work and allow citizens to upvote existing reports.
3. **Citizen Dashboard & Reporting Wizard**: A 6-step reporting flow with image upload, location picker, AI preview, and duplicate check.
4. **Interactive Civic Map**: Spatial visualization of reports with color-coded severity and status markers.
5. **Community Verification (Differentiating Feature)**: When administrators mark an issue resolved, nearby citizens verify if it's actually fixed. If multiple citizens report it's not fixed, the issue automatically reopens.
6. **Separate Admin Console**: Comprehensive triage interface with metrics, category/priority charts, status updates, and internal staff notes.
7. **AWS-Ready Architecture**: Abstractions for Amazon S3 (image storage), Amazon Bedrock (AI), and Amazon EventBridge (event notifications).

---

## 🚀 Quick Start Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Install Dependencies
Run the install command from the root directory to install root, backend, and frontend dependencies:
```bash
npm run install:all
```

### 2. Run the Application
You can run the backend and frontend concurrently or in separate terminals:

- **Start Backend API Server** (Port 5000):
  ```bash
  npm run dev:server
  ```
- **Start Frontend React Client** (Port 3000):
  ```bash
  npm run dev:client
  ```

Access the application in your browser at **`http://localhost:3000`**.

---

## 🔑 Demo Access (Instant Hackathon Login)

Use the built-in instant demo buttons in the Sign In modal or login with:
- **Citizen Account**: `alex@example.com` / `password123`
- **Admin Account**: `admin@civicflow.org` / `password123`
- **Operator Account**: `electrical@civicflow.org` / `password123`

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory if connecting to live AWS or MongoDB services:

```env
PORT=5000
JWT_SECRET=civicflow-super-secret-jwt-key-2026
MONGO_URI=mongodb://localhost:27017/civicflow
USE_REAL_AWS=false
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=civicflow-evidence-bucket
```

*(Note: Without `.env`, CivicFlow runs fully out of the box using high-performance local JSON storage and simulated AWS Bedrock/S3 services).*

---

## 🏛️ Project Structure

```text
CivicFlow/
├── server/
│   ├── index.js          # Express API server & routes
│   ├── services/
│   │   ├── db.js         # JSON store & MongoDB fallback
│   │   └── aws.js        # Amazon Bedrock, S3, EventBridge abstractions
│   └── data/             # Seeded JSON database store
├── client/
│   ├── src/
│   │   ├── components/   # Navbar, Footer, AuthModal, ReportIssueModal
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Landing, CitizenDashboard, ExploreIssues, IssueDetailPage, MapView, AdminDashboard
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── package.json
└── README.md
```
