// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginWithGoogleBtn = document.getElementById('loginWithGoogle');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const creditsInfo = document.getElementById('creditsInfo');
const creditsCount = document.getElementById('creditsCount');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');

// Handle Google Sign In
loginWithGoogleBtn.addEventListener('click', async () => {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        
        // Check if this is a new user
        const userDoc = await db.collection('users').doc(result.user.uid).get();
        
        if (!userDoc.exists) {
            // Create new user document with initial credits
            await db.collection('users').doc(result.user.uid).set({
                email: result.user.email,
                name: result.user.displayName,
                credits: 4, // Initial daily credits
                lastCreditReset: new Date(),
                createdAt: new Date()
            });
        }
        
        window.location.href = 'index.html'; // Redirect to main page after login
    } catch (error) {
        console.error('Error during sign in:', error);
        alert('Failed to sign in. Please try again.');
    }
});

// Handle Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error during sign out:', error);
        alert('Failed to sign out. Please try again.');
    }
});

// Auth state observer
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in
        loginWithGoogleBtn.classList.add('hidden');
        userInfo.classList.remove('hidden');
        creditsInfo.classList.remove('hidden');

        // Update UI with user info
        userAvatar.src = user.photoURL || 'default-avatar.png';
        userName.textContent = user.displayName;
        userEmail.textContent = user.email;

        // Get user credits
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            
            // Check if credits need to be reset (new day)
            const lastReset = userData.lastCreditReset.toDate();
            const now = new Date();
            if (lastReset.getDate() !== now.getDate()) {
                // Reset credits
                await db.collection('users').doc(user.uid).update({
                    credits: 4,
                    lastCreditReset: now
                });
                creditsCount.textContent = '4';
            } else {
                creditsCount.textContent = userData.credits;
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            creditsCount.textContent = 'Error';
        }
    } else {
        // User is signed out
        loginWithGoogleBtn.classList.remove('hidden');
        userInfo.classList.add('hidden');
        creditsInfo.classList.add('hidden');
        
        // If on main page, redirect to login
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
}); 