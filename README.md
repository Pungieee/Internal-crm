Internal CRM Ticket System
A simple system for residents to report issues and for staff to manage repairs, built to learn how real-world business logic works.

Why I built this?
I wanted to go beyond basic tutorials and build something that actually solves a problem. This project was a way for me to practice:


1. Real-world Logic: Learning how to handle SLA like a pro —automatically flagging tickets as OVERDUE if they aren't fixed on time.

2. Role Management: Handling different views for Residents, Staff, and Admins using RBAC.

3. Modern Tech Stack: Getting hands-on with Next.js 14, Prisma, and Docker to prepare for industry standards.


Tech I used
Frontend: Next.js 14 (App Router), Tailwind CSS

Backend: Node.js (Express), Socket.io for real-time alerts

Database: PostgreSQL with Prisma ORM

DevOps: Docker & Docker Compose


Key Features
Smart Deadlines: High-priority tickets get a 24-hour deadline, while Low-priority ones get 72 hours.

Auto-Status: The system checks itself and moves slow tickets to "Overdue" automatically.

Real-time: Staff get notified immediately when an Admin assigns them a new task.


How to run it
Clone the repo.

Run docker-compose up --build to start everything.

Seed Data: Use the provided script to create demo accounts (Admin/Staff/Resident).
