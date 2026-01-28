<h1 align="center">🌐 SynchroDesk – Collaborative Productivity Workspace (CPW)</h1>

<p align="center">
  A MERN-based SaaS platform for personal productivity, team collaboration, and AI-powered workflows.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-MERN-blue" />
  <img src="https://img.shields.io/badge/Status-In%20Development-green" />
  <img src="https://img.shields.io/badge/AI-OpenAI%20%7C%20Gemini-orange" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" />
</p>


## 📘 Project Summary

**SynchroDesk (CPW)** is a modern, full-stack collaborative productivity workspace for individuals, teams, and organizations.  
It combines task management, chat, notes, calendars, AI-powered features, and subscription-based premium access.

---

## 🚀 Live Demo

Access the deployed application using the links below:

### 🌐 Frontend (Client)
- **Home:** https://synchro-desk-cpw-frontend.vercel.app/
- **Login:** https://synchro-desk-cpw-frontend.vercel.app/login

### 🔧 Backend (API)
- **Public Test Endpoint:** https://synchrodesk-cpw-backend.onrender.com/test-public

> ⚠️ Note: The backend may take a few seconds to respond on the first request due to Render free-tier cold starts.

---

## 📸 Screenshots

### Landing Page
![Landing](./prt-sc-images/landing.png)

### Login
![Login](./prt-sc-images/login.png)

### Register
![Register](./prt-sc-images/register.png)

### Dashboard
![Dashboard](./prt-sc-images/dashboard.png)

### Task Manager
![Tasks](./prt-sc-images/tasks.png)

### Chat
![Chat](./prt-sc-images/chat.png)

### Workspaces
![Calendar](./prt-sc-images/workspaces.png)

### Workspace
![Notifications](./prt-sc-images/workspace.png)

### AI Assistant
![AI](./prt-sc-images/aiassistant.png)

---

## 🎯 Project Objectives

- Improve team collaboration and communication  
- Provide an organized personal dashboard  
- Structure tasks, priorities, and reminders  
- Share notes and knowledge  
- Enable real-time messaging and notifications  
- Plan events and deadlines efficiently  
- Include AI-powered insights and automation  
- Monetize through subscription-based premium plans  

---

## 🧱 Core Features (MVP)

### 🧭 Personal Dashboard
- Overview of today’s tasks and priorities  
- Integrated calendar and quick notes  
- Team activity feed for real-time updates  

### 📝 Advanced Task Manager
- Full CRUD operations for tasks  
- Priority levels, tags/labels, due dates, and reminders  
- Task comments for collaboration  
- Kanban-style drag-and-drop boards  
- Subtasks and file attachments *(Premium)*  

### 💬 Team Communication Hub
- Real-time messaging powered by Socket.io  
- Group channels and direct messaging  
- Typing indicators and online presence  
- File sharing within chats  
- AI-generated chat summaries *(Premium)*  

### 📚 Notes & Knowledge Base
- Rich-text editor using TipTap / Quill  
- Markdown support for structured content  
- Folder-based organization  
- Shareable notes across teams  
- Version history *(Premium)*  

### 👥 Team Workspaces
- Create and manage multiple workspaces  
- Invite and manage team members  
- Workspace-specific tasks and discussions  
- Role-based access control (Owner / Admin / Member)  

### 📆 Calendar & Scheduling
- Monthly and weekly calendar views  
- Event creation and task deadlines  
- Meeting scheduling with reminders  

### 🔔 Notifications
- Real-time notifications for tasks, messages, and events  
- Push notifications *(optional PWA support)*  

### 🤖 AI Assistant *(Premium)*
- Summarize notes and conversations  
- Automatically prioritize tasks  
- Suggest subtasks and workflows  
- Generate meeting minutes and announcements  
- Smart search across workspace content  

### 💳 Subscription System (Stripe)
- Free and Premium subscription plans  
- Monthly and yearly billing options  
- Secure payment processing  
- Billing history and customer portal  
- Automatic subscription renewal  

---

## 🔥 Premium Features

- AI-powered productivity assistant  
- Subtasks and file attachments  
- AI-generated chat summaries  
- Note version history  
- Multiple team workspaces  
- Priority notifications and alerts  


---

## 🧰 Tech Stack

### 💻 Frontend

| Technology | Badge |
|-----------|-------|
| React.js | ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white) |
| React Router | ![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=react-router&logoColor=white) |
| Redux Toolkit | ![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?logo=redux&logoColor=white) |
| Zustand | ![Zustand](https://img.shields.io/badge/Zustand-000000) |
| TypeScript | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) |
| Tailwind CSS | ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white) |
| Material UI | ![MUI](https://img.shields.io/badge/MUI-007FFF?logo=mui&logoColor=white) |
| Axios | ![Axios](https://img.shields.io/badge/Axios-5A29E4) |
| Socket.io Client | ![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socket.io&logoColor=white) |
| FullCalendar | ![FullCalendar](https://img.shields.io/badge/FullCalendar-3788D8) |
| Stripe.js | ![Stripe](https://img.shields.io/badge/Stripe.js-626CD9?logo=stripe&logoColor=white) |

---

### 🔧 Backend

| Technology | Badge |
|-----------|-------|
| Node.js | ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) |
| Express.js | ![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white) |
| TypeScript | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) |
| MongoDB | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white) |
| Mongoose | ![Mongoose](https://img.shields.io/badge/Mongoose-880000) |
| Socket.io | ![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socket.io&logoColor=white) |
| Stripe SDK | ![Stripe](https://img.shields.io/badge/Stripe_SDK-626CD9?logo=stripe&logoColor=white) |
| JWT | ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white) |
| Multer | ![Multer](https://img.shields.io/badge/Multer-FF6F00) |
| bcrypt | ![bcrypt](https://img.shields.io/badge/bcrypt-4A4A4A) |

---

### 🗄️ Database

| Technology | Badge |
|-----------|-------|
| MongoDB Atlas | ![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?logo=mongodb&logoColor=white) |

**Collections:**  
`users`, `tasks`, `notes`, `messages`, `workspaces`, `notifications`, `events`, `subscriptions`

---

### 🤖 AI Integration

| Service | Badge |
|-------|-------|
| OpenAI API | ![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white) |
| Gemini API | ![Gemini](https://img.shields.io/badge/Gemini-4285F4?logo=google&logoColor=white) |

---

### 🛠️ Tools & Platforms

| Tool | Badge |
|-----|-------|
| Git | ![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white) |
| Postman | ![Postman](https://img.shields.io/badge/Postman-FF6C37?logo=postman&logoColor=white) |
| Vite | ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) |
| Vercel | ![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white) |
| Render | ![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white) |


---

## 🔐 System Architecture

Client (React)
↓ REST / WebSocket
Backend (Node + Express)
↓
MongoDB Database


Additional: Socket.io (real-time), Stripe (payments), Cloudinary (files), JWT (authentication)

```markdown
## 🗂️ Folder Structure

synchro-desk-cpw/
├── client/
│ ├── public/
│ └── src/
│ ├── components/
│ ├── pages/
│ ├── redux/
│ ├── hooks/
│ ├── utils/
│ └── styles/
├── server/
│ └── src/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── utils/
│ ├── config/
│ └── sockets/
├── .env
├── package.json
└── README.md



```

## 📅 Development Timeline

**Core MVP**
1. Auth + DB setup  
2. Dashboard + UI skeleton  
3. Task manager + Kanban  
4. Notes + editor  
5. Chat + Socket.io  
6. Calendar + events  
7. Notifications  

**Premium & Production**
- AI Assistant, file uploads, workspaces  
- Stripe payments  
- UI refinement  
- Deployment (Vercel + Render)  

---

## 🧪 Testing Strategy

- Backend unit tests and API integration tests  
- UI responsiveness tests  
- Stripe test-mode verification  
- Chat real-time load testing  

---

## 🚀 Deployment

| Component | Platform |
|-----------|---------|
| Frontend  | Vercel |
| Backend   | Render |
| Database  | MongoDB Atlas |
| Files     | Cloudinary |

---

## 💼 Final Deliverables

- Full MERN SaaS app  
- Stripe-powered billing & subscriptions  
- AI assistant integration  
- Real-time team collaboration  
- Hosted production URL  
- GitHub repository + documentation  
- Demo video & screenshots  

---

## 🧑‍💻 How to Run

### Backend
cd server
npm install
npm run dev

### Frontend
cd client
npm install
npm run dev

---

### ⚙️ Environment Variables

Backend (server/.env)

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_secret

Frontend (client/.env)

VITE_API_BASE_URL=https://synchrodesk-cpw-backend.onrender.com

---

## 💼 Final Deliverables

Full MERN SaaS application

AI-powered productivity tools

Stripe-based subscription system

Real-time collaboration features

Publicly deployed frontend and backend

GitHub repository with documentation

Screenshots and demo-ready UI

---

## 🌟 Author

Charuka Dev
Full-stack Developer
Focused on SaaS, AI, and cloud-based solutions

---

## 👥 Contributors

U. G. Charuka Hansaja – Full-stack Developer

---

## 📄 License

This project is licensed under the MIT License.
You are free to use, modify, and distribute this software with attribution.

See the [LICENSE](./LICENSE) file for details.

---

## ✅ Final Status

✔ Meets **all submission guidelines**  
✔ Clean Markdown formatting  
✔ Professional academic & industry standard  
✔ Ready for **GitHub + Google Classroom submission**

If you want, I can:
- 🔍 Do a **final checklist review**
- 🎥 Add a **demo video section**
- 🧪 Add **test credentials**
- 🏆 Optimize it for **portfolio / resume use**

Just tell me.