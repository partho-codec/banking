const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const bankingRoutes = require('./banking');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: 'banking_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/banking', bankingRoutes);
app.use('/api/account', accountRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
