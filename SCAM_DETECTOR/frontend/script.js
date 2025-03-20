// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtrNhduCtEHKp0T1FsvG2ZrMHfhJJDxAM",
    authDomain: "scam-detector-7f45f.firebaseapp.com",
    projectId: "scam-detector-7f45f",
    storageBucket: "scam-detector-7f45f.firebasestorage.app",
    messagingSenderId: "497782676341",
    appId: "1:497782676341:web:355d27eb082aff8d27d13c",
    measurementId: "G-86N2JLD604"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const form = document.getElementById('scamForm');
const resultContainer = document.getElementById('result');
const resultDetails = document.getElementById('resultDetails');
const loadingSpinner = document.querySelector('.loading-spinner');
const historyList = document.getElementById('historyList');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const creditsCount = document.getElementById('creditsCount');
const logoutBtn = document.getElementById('logoutBtn');

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

// Load user's analysis history
async function loadHistory() {
    try {
        console.log('Loading history...');
        const idToken = await auth.currentUser.getIdToken();
        console.log('Got ID token, making API request...');
        
        const response = await fetch('http://localhost:5001/api/scam/history', {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('History data received:', data);
        
        if (!data.history || !Array.isArray(data.history)) {
            throw new Error('Invalid history data received');
        }

        historyList.innerHTML = data.history.map(item => `
            <div class="history-item">
                <div class="timestamp">${formatDate(new Date(item.timestamp))}</div>
                <div class="content">${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}</div>
                <span class="status status-${item.status.toLowerCase()}">${item.status}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading history:', error);
        historyList.innerHTML = `<p class="error">Failed to load history: ${error.message}</p>`;
    }
}

// Load user's credits
async function loadCredits() {
    try {
        console.log('Loading credits...');
        const idToken = await auth.currentUser.getIdToken();
        console.log('Got ID token, making API request...');
        
        const response = await fetch('http://localhost:5001/api/scam/credits', {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('Credits data received:', data);
        
        if (typeof data.credits !== 'number') {
            throw new Error('Invalid credits data received');
        }

        creditsCount.textContent = `Credits: ${data.credits}`;
    } catch (error) {
        console.error('Error loading credits:', error);
        creditsCount.textContent = `Credits: Error (${error.message})`;
    }
}

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const content = document.getElementById('content').value;
    const senderEmail = document.getElementById('senderEmail').value;

    // Show loading state
    resultContainer.classList.remove('hidden');
    loadingSpinner.classList.remove('hidden');
    resultDetails.innerHTML = '';

    try {
        const idToken = await auth.currentUser.getIdToken();
        const response = await fetch('http://localhost:5001/api/scam/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                content,
                senderEmail: senderEmail || undefined
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze message');
        }

        // Update credits display
        creditsCount.textContent = `Credits: ${data.creditsRemaining}`;

        // Display result
        resultDetails.innerHTML = `
            <div class="success">
                <p>Analysis request received successfully!</p>
                <p>Request ID: ${data.id}</p>
                <p>Status: ${data.status}</p>
            </div>
        `;

        // Reload history
        loadHistory();

    } catch (error) {
        // Display error
        resultDetails.innerHTML = `
            <div class="error">
                <p>Error: ${error.message}</p>
            </div>
        `;
    } finally {
        // Hide loading spinner
        loadingSpinner.classList.add('hidden');
    }
});

// Handle logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Failed to sign out. Please try again.');
    }
});

// Auth state observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('User authenticated:', user.uid);
        // Update UI with user info
        userAvatar.src = user.photoURL || 'default-avatar.png';
        userName.textContent = user.displayName || user.email;
        
        // Load initial data
        try {
            console.log('Loading initial data...');
            await Promise.all([
                loadCredits(),
                loadHistory()
            ]);
            console.log('Initial data loaded successfully');
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    } else {
        console.log('User not authenticated, redirecting to login');
        window.location.href = 'login.html';
    }
});
