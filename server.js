const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost/mining-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  telegramUsername: String,
  referralCode: String,
  coins: Number,
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const User = mongoose.model('User', userSchema);

app.post('/auth', async (req, res) => {
  const { telegramUsername } = req.body;
  let user = await User.findOne({ telegramUsername });
  if (!user) {
    const referralCode = Math.random().toString(36).substring(2, 15);
    user = new User({ telegramUsername, referralCode, coins: 0 });
    await user.save();
  }
  res.json({ user });
});

app.get('/referrals', async (req, res) => {
  const { userId } = req.query;
  const user = await User.findById(userId).populate('referrals');
  const referrals = user.referrals.map(referral => ({
    username: referral.telegramUsername,
    earnedCoins: referral.coins * 0.2
  }));
  res.json(referrals);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});