const express = require('express');
const router = express.Router();
const { admin, db } = require('../firebase');

// Middleware to verify Firebase token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get user's analysis history
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const historyRef = db.collection('history')
            .where('userId', '==', req.user.uid)
            .orderBy('timestamp', 'desc')
            .limit(10);
        
        const snapshot = await historyRef.get();
        const history = [];
        
        snapshot.forEach(doc => {
            history.push({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp._seconds * 1000 // Convert to milliseconds
            });
        });

        res.json({ history });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get user's credits
router.get('/credits', authenticateToken, async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.user.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        res.json({ credits: userData.credits || 0 });
    } catch (error) {
        console.error('Error fetching credits:', error);
        res.status(500).json({ error: 'Failed to fetch credits' });
    }
});

// Analyze message
router.post('/analyze', authenticateToken, async (req, res) => {
    try {
        const { content, senderEmail } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        // Get user's credits
        const userRef = db.collection('users').doc(req.user.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        if (userData.credits <= 0) {
            return res.status(403).json({ error: 'No credits remaining' });
        }

        // Create analysis record
        const analysisRef = db.collection('history').doc();
        await analysisRef.set({
            userId: req.user.uid,
            content,
            senderEmail,
            status: 'Pending',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // Deduct credit
        await userRef.update({
            credits: admin.firestore.FieldValue.increment(-1)
        });

        res.json({
            id: analysisRef.id,
            status: 'Pending',
            creditsRemaining: userData.credits - 1
        });
    } catch (error) {
        console.error('Error analyzing message:', error);
        res.status(500).json({ error: 'Failed to analyze message' });
    }
});

module.exports = router; 