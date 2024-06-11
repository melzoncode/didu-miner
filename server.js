const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/auth', async (req, res) => {
    const { telegramUsername } = req.body;
    let userRef = db.collection('users').where('telegramUsername', '==', telegramUsername);
    let snapshot = await userRef.get();
    let user = null;

    if (snapshot.empty) {
        const referralCode = Math.random().toString(36).substring(2, 15);
        user = {
            telegramUsername,
            referralCode,
            coins: 0,
            referrals: []
        };
        await db.collection('users').add(user);
    } else {
        snapshot.forEach(doc => {
            user = { id: doc.id, ...doc.data() };
        });
    }
    res.json({ user });
});

app.get('/referrals', async (req, res) => {
    const { userId } = req.query;
    let userRef = db.collection('users').doc(userId);
    let doc = await userRef.get();

    if (!doc.exists) {
        res.status(404).send('No such user!');
    } else {
        let user = doc.data();
        let referrals = [];

        for (let refId of user.referrals) {
            let refDoc = await db.collection('users').doc(refId).get();
            if (refDoc.exists) {
                let refData = refDoc.data();
                referrals.push({
                    username: refData.telegramUsername,
                    earnedCoins: refData.coins * 0.2
                });
            }
        }
        res.json(referrals);
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
