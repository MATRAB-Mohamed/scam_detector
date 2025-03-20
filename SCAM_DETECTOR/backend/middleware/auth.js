const { admin } = require('../firebase');

const verifyAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Add user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

const checkCredits = async (req, res, next) => {
    try {
        const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
        const userData = userDoc.data();

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if credits need to be reset (new day)
        const lastReset = userData.lastCreditReset.toDate();
        const now = new Date();
        
        if (lastReset.getDate() !== now.getDate()) {
            // Reset credits
            await admin.firestore().collection('users').doc(req.user.uid).update({
                credits: 4,
                lastCreditReset: now
            });
            req.user.credits = 4;
        } else {
            req.user.credits = userData.credits;
        }

        // Check if user has enough credits
        if (req.user.credits <= 0) {
            return res.status(403).json({ 
                error: 'No credits remaining today',
                resetTime: new Date(now.setHours(24, 0, 0, 0))
            });
        }

        next();
    } catch (error) {
        console.error('Credits check error:', error);
        res.status(500).json({ error: 'Failed to check credits' });
    }
};

module.exports = { verifyAuth, checkCredits }; 