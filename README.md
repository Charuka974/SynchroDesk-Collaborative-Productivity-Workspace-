# 🌐 SynchroDesk – Collaborative Productivity Workspace (CPW)

A MERN-based SaaS platform for personal productivity, team collaboration, and AI-powered workflows.

---

## Badges
![Platform](https://img.shields.io/badge/Platform-MERN-blue)
![Status](https://img.shields.io/badge/Status-In%20Development-green)
![Payment](https://img.shields.io/badge/Payment-Stripe-626CD9)
![AI](https://img.shields.io/badge/AI-OpenAI%20%7C%20Gemini-orange)

---

## 📘 Project Summary

**SynchroDesk (CPW)** is a modern, full-stack collaborative productivity workspace for individuals, teams, and organizations.  
It combines task management, chat, notes, calendars, AI-powered features, and subscription-based premium access.

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

### Personal Dashboard
- Today’s tasks, calendar, quick notes, team activity feed, prioritized tasks  

### Advanced Task Manager
- CRUD tasks, priority levels, tags/labels, due dates & reminders, comments  
- Subtasks *(premium)*, Kanban drag-and-drop, file attachments *(premium)*  

### Team Communication Hub
- Real-time chat using Socket.io, group channels, direct messages  
- Typing indicator, online status, file sharing, AI chat summaries *(premium)*  

### Notes & Knowledge Base
- Rich-text editor (TipTap/Quill), Markdown support  
- Folder organization, shareable notes, version history *(premium)*  

### Team Workspaces
- Create multiple teams, invite members, workspace-specific tasks  
- Role-based access (Owner/Admin/Member)  

### Calendar & Scheduling
- Monthly/weekly views, event creation, task deadlines, meeting scheduling, reminders  

### Notifications
- Real-time alerts for tasks, messages, calendar events  
- Push notifications *(optional PWA)*  

### AI Assistant *(Premium)*
- Summarize notes & chats, prioritize tasks, suggest subtasks  
- Generate meeting minutes, smart search, auto-drafted announcements  

### Subscription System (Stripe)
- Free vs Premium plans  
- Monthly/yearly billing, payment history, billing portal, auto-renewal  

---

## 🔥 Premium Features

- AI assistant  
- Subtasks & file attachments  
- Chat summaries  
- Note version history  
- Multiple workspaces  
- Gantt chart timeline  
- Analytics & priority notifications  

---

## 🧰 Tech Stack

### Frontend
- React.js, React Router, Redux Toolkit / Zustand  
- TailwindCSS / Material UI, Axios, Socket.io Client  
- FullCalendar, Stripe.js  

### Backend
- Node.js, Express.js, MongoDB + Mongoose, Socket.io  
- Stripe SDK, JWT, Multer, bcrypt  

### Database
**MongoDB Atlas** with collections: users, tasks, notes, messages, workspaces, notifications, events, subscriptions  

### AI Integration
- OpenAI API or Gemini API  

---

## 🔐 System Architecture

Client (React)
↓ REST / WebSocket
Backend (Node + Express)
↓
MongoDB Database


Additional: Socket.io (real-time), Stripe (payments), Cloudinary (files), JWT (authentication)

---

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
├── node_modules/
├── .env
├── package.json
└── README.md


---

## 📅 Development Timeline

**Week 1 – Core MVP**
1. Auth + DB setup  
2. Dashboard + UI skeleton  
3. Task manager + Kanban  
4. Notes + editor  
5. Chat + Socket.io  
6. Calendar + events  
7. Notifications  

**Week 2 – Premium & Production**
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
| Frontend  | Vercel / Netlify |
| Backend   | Render / Railway |
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
```bash
cd server
npm install
npm run dev
Frontend
bash
Copy code
cd client
npm install
npm run dev


⚙️ Environment Variables
Create a .env file in server/ with the following:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_secret


🌟 Author

Charuka Dev – Full-stack Developer
Focused on SaaS, AI, and cloud-based solutions.
