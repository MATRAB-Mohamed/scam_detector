# 🔍 Scam Detector

A web application that helps users detect potential scams in messages using AI and VirusTotal integration.

## Features

- 🔐 Multiple authentication methods:
  - Email/Password
  - Google Sign-in
  - Apple Sign-in
- 🤖 AI-powered message analysis
- 🛡️ VirusTotal integration for URL scanning
- 💳 Credit-based usage system
- 📱 Responsive design
- 📊 Analysis history tracking

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- VirusTotal API key
- Deepseek AI API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/scam-detector.git
cd scam-detector
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password, Google, and Apple providers
   - Create a Firestore database
   - Get your Firebase configuration from Project Settings

4. Configure environment variables:
   Create a `.env` file in the root directory with the following content:
```env
# Server Configuration
PORT=5001

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id

# API Keys
VIRUSTOTAL_API_KEY=your-virustotal-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
```

5. Update Firebase configuration in frontend files:
   - Replace the Firebase configuration in `frontend/login.html` and `frontend/script.js` with your project's configuration from the Firebase Console

## Running the Application

### Backend Server

1. Navigate to the backend directory:
```bash
cd backend
```

2. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

The backend server will start on `http://localhost:5001`

### Frontend Server

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Start the development server:
```bash
npm start
```

The frontend server will start on `http://localhost:8000`

### Verifying the Setup

1. Open your browser and navigate to `http://localhost:8000`
2. You should see the login page
3. Try creating a new account or signing in with Google
4. After successful authentication, you should be redirected to the main page
5. Check the browser console for any errors

### Troubleshooting

If you encounter issues:

1. Check if both servers are running:
```bash
# Check backend
curl http://localhost:5001/test

# Check frontend
curl http://localhost:8000
```

2. Verify environment variables:
```bash
# In backend directory
node -e "require('dotenv').config(); console.log(process.env)"
```

3. Check Firebase connection:
   - Open browser console
   - Look for Firebase initialization messages
   - Check for any authentication errors

4. Common issues:
   - Port conflicts: Make sure ports 5001 and 8000 are available
   - Firebase configuration: Verify all Firebase config values are correct
   - CORS issues: Ensure backend CORS settings match your frontend URL
   - Environment variables: Check if all required variables are set

## Project Structure

```
scam-detector/
├── backend/
│   ├── routes/
│   │   └── scam.js
│   ├── firebase.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── script.js
│   └── styles.css
├── .gitignore
└── README.md
```

## API Endpoints

- `POST /api/scam/analyze`: Analyze a message for potential scams
- `GET /api/scam/history`: Get user's analysis history
- `GET /api/scam/credits`: Get user's remaining credits

## Security Considerations

- All API endpoints require authentication
- API keys are stored securely in environment variables
- User data is protected by Firebase Security Rules
- HTTPS is enforced in production

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Firebase](https://firebase.google.com/) for authentication and database
- [VirusTotal](https://www.virustotal.com/) for URL scanning
- [Deepseek AI](https://deepseek.ai/) for message analysis
- [Inter](https://fonts.google.com/specimen/Inter) for the font

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
