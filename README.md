Hackathon project - AI PR impact analyze

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
- 👤 User profile management with editable name and nickname
- 🛍️ Product catalog with shopping cart
- 🖼️ Product images displayed on all product pages
- 👨‍💼 Admin panel for product management (role-based access)
- 📊 CSV import functionality for bulk product upload
- 🛒 Persistent cart storage
- 📱 Responsive design with Tailwind CSS
- 🔒 Role-based access control (Admin/User roles)

## User Profile Features

### Profile Management
- View and edit user profile information
- Editable fields: Full Name and Nickname
- Email address display (read-only)
- Account creation and last sign-in information
- Real-time validation and error handling

### Profile Editing
- Toggle between view and edit modes
- Form validation for required fields
- Save changes with "Update Profile" button
- Cancel editing to revert changes
- Success/error feedback messages

## Admin Panel Features

### User Roles
- **User (default)**: Can browse products, add to cart, and make purchases
- **Admin**: Can access the admin panel to add/edit products

### Access Control
- Admin button only appears for users with admin privileges
- Direct URL access to admin panel is protected
- Non-admin users see an "Access Denied" page

### Admin Panel Features

#### Manual Product Addition
- Add individual products with name, description, price, and image URL
- Form validation and error handling
- Real-time product list updates
- Product images displayed in admin panel

#### CSV Import System
- Bulk import products from CSV files
- Automatic format validation before import
- Support for required columns: `name`, `description`, `price`
- Data is appended to existing products (no overwrite)
- Detailed error reporting for invalid files

##### CSV Format Requirements
- Header row with columns: `name, description, price`
- Price must be a positive number
- Sample file: `sample_products.csv`

##### Import Process
1. Choose a CSV file using the file picker
2. System validates format automatically
3. Import button is enabled only for valid files
4. Products are imported and added to the database
5. Success/error messages are displayed

## Project Structure

- `onlineShopApp.jsx` - Main React application
- `UserProfile.jsx` - User profile management component
- `adminPage.jsx` - Admin panel component with CSV import functionality
- `AppContext.jsx` - Shared application context with role management
- `server.js` - Express.js backend server with admin helper functions
- `serviceAccountKey.json` - Firebase service account credentials
- `sample_products.csv` - Example CSV file for testing imports
