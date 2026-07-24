# Examify 🎓

**Examify** is a role-based online examination management system designed to streamline test creation, student evaluation, and administrative workflows.

---

## 🚀 Live Demo

* **Frontend App:** [examify-4sm3klh0o-shovi.vercel.app](https://examify-4sm3klh0o-shovi.vercel.app)
* **Backend API:** [examify-uyha.onrender.com](https://examify-uyha.onrender.com)

---

## ✨ Features

* **Role-Based Dashboards:** Separate panels and access controls for **Students**, **Teachers**, and **Admins**.
* **Authentication & Authorization:** Secure registration, login, and route protection using JWT (JSON Web Tokens).
* **Exam Management:** Teachers can create, schedule, and manage examination modules.
* **Student Interface:** Intuitive dashboard for students to view upcoming assessments and submit responses.
* **Admin Control:** System administration, user verification, and role assignments.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React.js / Vite
* **Deployment:** Vercel

### **Backend**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB Atlas (Mongoose ORM)
* **Authentication:** JWT & bcrypt
* **Deployment:** Render

---

## 📁 Repository Structure

```text
Examify/
├── client/          # Frontend React application
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/          # Backend Express application
│   ├── config/      # Database & server configurations
│   ├── controllers/ # Route handlers
│   ├── middleware/  # Auth & error middleware
│   ├── models/      # MongoDB schema models
│   ├── routes/      # Express API routes
│   ├── utils/       # Utility functions
│   ├── index.js     # Entry point
│   └── package.json
│
└── README.md
