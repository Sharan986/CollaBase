# CollaBase 🚀

A modern team collaboration platform built with React, Firebase, and Vite. CollaBase enables users to create teams, manage applications, and collaborate effectively with integrated WhatsApp group functionality.

## 🌟 Features

- **User Authentication** - Secure login/signup with college email validation
- **Team Management** - Create, join, and manage teams
- **Application System** - Apply to teams, accept/reject applications
- **Real-time Notifications** - Toast notifications and dashboard updates
- **WhatsApp Integration** - Team communication through WhatsApp groups
- **Responsive Design** - Mobile-friendly interface with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Routing**: React Router DOM
- **State Management**: React Context API

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git**
- A **Firebase** account

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Sharan986/CollaBase.git
cd CollaBase
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### 3.1 Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Authentication and Firestore Database

#### 3.2 Enable Authentication Methods
1. In Firebase Console, go to **Authentication > Sign-in method**
2. Enable **Email/Password** authentication

#### 3.3 Set up Firestore Database
1. Go to **Firestore Database**
2. Create database in **test mode** (you can configure security rules later)
3. Choose a location for your database

#### 3.4 Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select **Web app** (</>)
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 4. Environment Variables

Create a `.env` file in the root directory:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Replace the placeholder values** with your actual Firebase configuration values.

### 5. Firestore Security Rules

In Firebase Console, go to **Firestore Database > Rules** and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Teams are readable by authenticated users, writable by team owners
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.createdBy || 
         request.auth.uid in resource.data.members);
      allow delete: if request.auth != null && request.auth.uid == resource.data.createdBy;
    }
    
    // Applications are readable/writable by applicant and team owner
    match /applications/{applicationId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.applicantId || 
         request.auth.uid == resource.data.teamOwnerId);
      allow create: if request.auth != null;
    }
    
    // Dashboard notifications are readable/writable by the user
    match /dashboardNotifications/{notificationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

### 6. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📚 Usage Guide

### First Time Setup
1. **Sign Up**: Create an account with a valid college email
2. **Complete Profile**: Fill in your profile information
3. **Explore Teams**: Browse available teams or create your own

### Creating a Team
1. Go to **Create Team** page
2. Fill in team details (name, description, skills, etc.)
3. Optionally add a WhatsApp group link
4. Submit to create your team

### Joining a Team
1. Browse teams on the **Teams** page
2. Click **Apply** on teams you're interested in
3. Wait for team owner approval
4. Check **Dashboard** for application status

### Team Management
1. Go to **My Teams** to manage your created teams
2. **Accept/Reject** applications in the "Created Teams" tab
3. **View team members** and manage WhatsApp groups
4. **Remove members** if needed

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
CollaBase/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Profile.jsx
│   │   └── ToastContainer.jsx
│   ├── contexts/
│   │   ├── ApplicationContext.jsx
│   │   ├── AuthContext.jsx
│   │   ├── DashboardNotificationContext.jsx
│   │   └── ToastContext.jsx
│   ├── firebase/
│   │   └── firebase.js
│   ├── layouts/
│   │   └── Layout.jsx
│   ├── pages/
│   │   ├── ApplicationsPage.jsx
│   │   ├── AuthPage.jsx
│   │   ├── CreateTeamPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LandingPage.jsx
│   │   ├── ManageTeamsPage.jsx
│   │   ├── TeamDetailsPage.jsx
│   │   └── TeamsPage.jsx
│   ├── utils/
│   │   └── validation.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Troubleshooting

### Common Issues

**1. Firebase Configuration Errors**
- Ensure all environment variables are correctly set
- Check that your Firebase project has Authentication and Firestore enabled

**2. Build Errors**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (should be 18+)

**3. Authentication Issues**
- Verify email/password authentication is enabled in Firebase Console
- Check Firestore security rules are properly configured

**4. Permission Errors**
- Ensure Firestore security rules match the provided configuration
- Check that user profiles are created properly after signup

### Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration
3. Ensure all environment variables are set correctly
4. Check Firestore security rules

## 🔮 Future Enhancements

- [ ] Real-time chat functionality
- [ ] File sharing capabilities
- [ ] Advanced team filtering and search
- [ ] Email notifications
- [ ] Mobile app development
- [ ] Integration with other collaboration tools

---

**Happy Collaborating! 🎉**
