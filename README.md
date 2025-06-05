# CalPal - Your Task and Group Scheduling Companion

A Website that helps you organize your tasks everyday with a built in calendar and also create groupa to schedule and plan over multiple people, see when your group members are free to plan effectively all while keeping things needed private.

---

## Tech Stack

- Frontend - ReactJS, HTML, TailwindCSS, ShadCN UI
- Backend - ExpressJS, NodeJS
- DataBase - MongoDB (no-sql)
- Hosting - Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)
- Authenticatication - Firebase

---

## Features

1. **Secure Firebase Authentication**
    
    Login with email and password — auth is safely handled by Firebase, completely separate from your main app data.
    
2. **Daily Task Management**
    
    Stay on top of your personal goals. Add, track, and complete tasks effortlessly — one day at a time.
    
3. **Clean, Visual Calendar**
    
    Navigate through weeks and months with a smooth calendar view that gives you a full picture of your upcoming tasks.
    
4. **Group Scheduling with Friends**
    
    Create groups to sync calendars with other users — plan events together without the chaos.
    
5. **Invite-First Group Creation**
    
    When you create a group, members get invites they must approve before joining — no forced additions here.
    
6. **Request-Only Group Joining**
    
    Users can request to join groups, and owners approve them. Keeps things secure and spam-free by default.
    
7. **Private Groups by Design**
    
    Want a secret hangout for just you and your people? Private groups are invisible to everyone else.
    
8. **See Availability, Not Details**
    
    Know when your groupmates are free — without seeing what they’re working on. Respect their time *and* privacy.
    
9. **Your Tasks, Your Business**
    
    Task titles and details stay private. Others only see if you're free or busy. Period.
    
10. **Built-in Dark & Light Mode**
    
    Supports both themes out of the box. Looks good day or night, no setting-hunting required.
    
11. **Mobile-First, Desktop-Ready**
    
    Whether you’re on a phone or full screen, the layout adapts cleanly with a responsive, app-like experience.
    
12. **Smart Notifications**
    
    Stay in the loop with real-time group and user request alerts — no more “wait, when did that happen?”
    
13. **User-Driven Improvements**
    
    CalPal’s not done growing. New features will roll out based on what *you* need — feedback always welcome.
    

---

## Setup/Deployment Instructions

### Run Locally

Follow these steps to run CalPal on your machine:

### 1. **Clone the repositories**

```bash
#frontend
git clone https://github.com/kart8ik/CALPAL_2.0.git
cd CALPAL_2.0
#backend
git clone https://github.com/kart8ik/calpal-backend.git
cd calpal-backend
```

### 2. **Install dependencies**

In both folders:

```bash
npm install

```

---

### 3. **Set up environment variables**

Each folder includes a `.env.example` file.

Create a `.env` file in both frontend and backend and fill in the required fields.

---

### 4. **Create a MongoDB Atlas Cluster or make a collection locally on your system on MongoDB compass or the terminal.**

If you don’t already have a database:

- Go to [https://cloud.mongodb.com](https://cloud.mongodb.com/)
- Create a free cluster
- Whitelist your IP
- Create a user
- Copy the connection string (e.g., `mongodb+srv://<user>:<pass>@...`)
- Replace `MONGO_URI` with this string
- if you are using a local server for the database, put the the address (usually localhost:27017) in the `MONGO_URI` instead.

> Want help? Use the .env.example as a template
> 

---

### 5. **Run the app**

```bash
# In backend
npm start

# In frontend
npm run dev

```

- Frontend will be at: `http://localhost:5173`
- Backend will be at: `http://localhost:8080`
