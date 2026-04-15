# Cogno-Learn: AI-Powered Cognitive Journey

Cogno-Learn is a modern, real-time learning and productivity platform designed to enhance your cognitive journey. It combines AI-driven tutoring, structured study planning, and emotional intelligence tracking with a unique "Neural Web" task visualization.

## 🚀 Features

- **Neural Web Graph**: Visualize your tasks and knowledge as an interactive network of nodes.
- **AI Tutor**: Real-time chat powered by Google Gemini for instant learning support.
- **Smart Study Planner**: Generate structured, timeframe-based learning paths for any topic.
- **Mood & Focus Analysis**: AI-driven emotional tracking to optimize your learning state.
- **Productivity Dashboard**: Track your daily focus points and neural milestones.
- **Cosmic Glassmorphism UI**: A high-performance, visually stunning interface built with Tailwind CSS and Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion (Animations)
- **Database & Auth**: Firebase (Firestore & Authentication)
- **AI Engine**: Google Gemini 2.5 Flash
- **Visualization**: react-force-graph-2d

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

## ⚙️ Local Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd cogno-learn
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add your Google Gemini API Key:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
*You can get a free API key from the [Google AI Studio](https://aistudio.google.com/app/apikey).*

### 4. Firebase Configuration
1. Create a new project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Authentication** (Google Sign-in).
3. Add a Web App to your Firebase project to get your configuration object.
4. Create a file named `firebase-applet-config.json` in the root directory with your credentials:
```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT.appspot.com",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "firestoreDatabaseId": "(default)"
}
```

### 5. Authorized Domains
To use Google Login locally, go to **Firebase Console > Authentication > Settings > Authorized domains** and add:
- `localhost`
- `127.0.0.1`

### 6. Run the Application
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 🛡️ Firestore Security Rules
To protect your data, use the following rules in your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }
    
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    match /tasks/{taskId} {
      allow read, write: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
    // Add similar rules for chatMessages, studyPlans, and moodLogs
  }
}
```

## 📄 License
This project is licensed under the MIT License.
