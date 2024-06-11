document.addEventListener('DOMContentLoaded', () => {
  // Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCo7nK9J1un7mYIco_rJWcj8AYW2RSdohI",
    authDomain: "didu-miner.firebaseapp.com",
    projectId: "didu-miner",
    storageBucket: "didu-miner.appspot.com",
    messagingSenderId: "271033294031",
    appId: "1:271033294031:web:a57dac4a0dd93f9356abba",
    measurementId: "G-XZKRL15FTX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
  const auth = firebase.auth();
  const db = firebase.firestore();
  const mineButton = document.getElementById('mine-button');
  const coinCountElement = document.getElementById('coin-count');
  const totalCoinCountElement = document.getElementById('total-coin-count');
  const timerElement = document.getElementById('timer');
  const messageElement = document.getElementById('message');
  const authForm = document.getElementById('auth-form');
  const authContainer = document.getElementById('auth-container');
  const appContainer = document.getElementById('app-container');
  const referralLinkElement = document.getElementById('referral-link');
  const referralListElement = document.getElementById('referral-list');
  
  let coinCount = 0;
  let totalCoinCount = 0;
  let user = null;
  const sixHoursInMilliseconds = 6 * 60 * 60 * 1000;
  const lastMineTimeKey = 'lastMineTime';
  const totalCoinCountKey = 'totalCoinCount';
  const coinCountKey = 'coinCount';
  const userKey = 'user';
  let miningInterval;

  // Load user data from localStorage
  user = JSON.parse(localStorage.getItem(userKey));

  // If user is not logged in, show the auth form
  if (!user) {
    authContainer.style.display = 'block';
    appContainer.style.display = 'none';
  } else {
    authContainer.style.display = 'none';
    appContainer.style.display = 'block';
    initializeApp();
  }

  authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const telegramUsername = document.getElementById('telegram-username').value;
    // Simulate a backend call with a delay
    setTimeout(() => {
      const referralCode = Math.random().toString(36).substring(2, 15);
      user = { telegramUsername, referralCode, coins: 0, referrals: [] };
      localStorage.setItem(userKey, JSON.stringify(user));
      authContainer.style.display = 'none';
      appContainer.style.display = 'block';
      initializeApp();
    }, 1000);
  });

  function initializeApp() {
    referralLinkElement.textContent = `https://t.me/yourbot?start=${user.referralCode}`;
    updateCoinCount();
    updateTotalCoinCount();
    checkLastMineTime();
    loadReferrals();
  }

  function updateCoinCount() {
    coinCountElement.textContent = coinCount;
  }

  function updateTotalCoinCount() {
    totalCoinCountElement.textContent = totalCoinCount;
  }

  function enableButton() {
    mineButton.disabled = false;
    mineButton.textContent = 'Start Mining';
    messageElement.textContent = '';
    clearInterval(miningInterval);
    timerElement.textContent = '';
  }

  function disableButtonFor(duration) {
    mineButton.disabled = true;
    mineButton.textContent = 'Mining...';
    miningInterval = setInterval(() => {
      coinCount += 1;
      totalCoinCount += 1;
      updateCoinCount();
      updateTotalCoinCount();
      localStorage.setItem(totalCoinCountKey, totalCoinCount);
    }, 1000);

    const endTime = Date.now() + duration;
    const timerInterval = setInterval(() => {
      const remainingTime = endTime - Date.now();
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        enableButton();
        coinCount = 0; // Reset coin count after mining session
        updateCoinCount();
        localStorage.setItem(coinCountKey, coinCount);
      } else {
        const hours = Math.floor(remainingTime / 1000 / 60 / 60);
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / 1000 / 60);
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        timerElement.textContent = `Time remaining: ${hours}h ${minutes}m ${seconds}s`;
      }
    }, 1000);
  }

  mineButton.addEventListener('click', () => {
    const now = Date.now();
    localStorage.setItem(lastMineTimeKey, now);
    disableButtonFor(sixHoursInMilliseconds);
  });

  function checkLastMineTime() {
    const lastMineTime = localStorage.getItem(lastMineTimeKey);
    if (lastMineTime) {
      const timeElapsed = Date.now() - lastMineTime;
      if (timeElapsed < sixHoursInMilliseconds) {
        disableButtonFor(sixHoursInMilliseconds - timeElapsed);
      }
    }
  }

  const taskRewards = {
    twitter: 10,
    telegram: 15,
    instagram: 20,
    youtube: 25
  };

  function completeTask(task, url) {
    const reward = taskRewards[task] || 0;
    totalCoinCount += reward;
    localStorage.setItem('totalCoinCount', totalCoinCount);
    updateTotalCoinCount();
    alert(`Task completed! You earned ${reward} coins. Wait 1 hour for moderation checks.`);
    window.open(url, '_blank');
  }

  function loadReferrals() {
    // Load referrals from local storage for offline mode
    const referrals = JSON.parse(localStorage.getItem('referrals')) || [];
    referralListElement.innerHTML = '';
    referrals.forEach(referral => {
      const li = document.createElement('li');
      li.textContent = `Referral: ${referral.username} - Earned Coins: ${referral.earnedCoins}`;
      referralListElement.appendChild(li);
    });
  }

  function openTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';
  }
});
