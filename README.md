# Internal CRM Ticket System

A simple system for residents to report issues and for staff to manage repairs, built to **learn how real-world business logic works**.

---

## Why I Built This

I wanted to go beyond basic tutorials and build something that actually solves a problem. This project was a way for me to practice:

1. **Real-world Logic**: Learn how to handle SLA like a pro — automatically flagging tickets as **OVERDUE** if they aren't fixed on time.
2. **Role Management**: Handling different views for **Residents**, **Staff**, and **Admins** using **RBAC** (Role-Based Access Control).
3. **Modern Tech Stack**: Get hands-on with **Next.js 14**, **Prisma**, and **Docker** to prepare for industry standards.

---

## Tech I Used

- **Frontend**: Next.js 14 (App Router), Tailwind CSS  
- **Backend**: Node.js (Express), Socket.io for real-time alerts  
- **Database**: PostgreSQL with Prisma ORM  
- **DevOps**: Docker & Docker Compose  

---

## Key Features

- **Smart Deadlines**: High-priority tickets get a **24-hour** deadline, while low-priority ones get **72 hours**.  
- **Auto-Status**: The system checks itself and moves slow tickets to **"Overdue"** automatically.  
- **Real-time Notifications**: Staff get notified immediately when an Admin assigns them a new task.  

---

## How to Run It

1. **Clone the repo**:

git clone https://github.com/Pungieee/Internal-crm.git
cd Internal-crm


2. **Start everything with Docker**:

docker-compose up --build


3. **Seed demo data (Admin/Staff/Resident accounts)**:

Invoke-RestMethod -Uri "http://localhost:4000/api/auth/seed-demo-users" -Method POST


4. **Open your browser:**:

Frontend: http://localhost:3000

Backend API: http://localhost:4000


