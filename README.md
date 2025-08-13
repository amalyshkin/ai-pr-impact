# AI PR Impact - Hackathon Project

An e-commerce application with AI-powered PR impact analysis.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Configuration

#### Client-Side Configuration
Update the Firebase configuration in `AppContext.jsx`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

#### Server-Side Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Replace the placeholder values in `serviceAccountKey.json` with your actual credentials

**⚠️ Important:** Never commit `serviceAccountKey.json` to version control. It's already added to `.gitignore`.

### 3. Run the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

## Features

- 🔐 User authentication with Firebase Auth
- 🛍️ Product catalog with shopping cart
- 👨‍💼 Admin panel for product management
- 🛒 Persistent cart storage
- 📱 Responsive design with Tailwind CSS

## Project Structure

- `onlineShopApp.jsx` - Main React application
- `adminPage.jsx` - Admin panel component
- `AppContext.jsx` - Shared application context
- `server.js` - Express.js backend server
- `serviceAccountKey.json` - Firebase service account credentials
