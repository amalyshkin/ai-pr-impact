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

### 3. Setting Up Admin Users

#### Method 1: Using the Server Helper Function
1. In `server.js`, uncomment and modify the line:
   ```javascript
   setUserAsAdmin('user@example.com').catch(console.error);
   ```
2. Replace `'user@example.com'` with the email of the user you want to make admin
3. Run the server once: `npm run server`
4. Comment out the line again for security

#### Method 2: Manual Database Update
1. Go to Firebase Console > Firestore Database
2. Find the `users` collection
3. Locate the user document by email
4. Update the `role` field to `"admin"`

### 4. Run the Application

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
- 👨‍💼 Admin panel for product management (role-based access)
- 🛒 Persistent cart storage
- 📱 Responsive design with Tailwind CSS
- 🔒 Role-based access control (Admin/User roles)

## Admin System

### User Roles
- **User (default)**: Can browse products, add to cart, and make purchases
- **Admin**: Can access the admin panel to add/edit products

### Access Control
- Admin button only appears for users with admin privileges
- Direct URL access to admin panel is protected
- Non-admin users see an "Access Denied" page

### Admin Panel Features
- Add new products with name, description, price, and image URL
- Real-time product list updates
- Form validation and error handling

## Project Structure

- `onlineShopApp.jsx` - Main React application
- `adminPage.jsx` - Admin panel component
- `AppContext.jsx` - Shared application context with role management
- `server.js` - Express.js backend server with admin helper functions
- `serviceAccountKey.json` - Firebase service account credentials
