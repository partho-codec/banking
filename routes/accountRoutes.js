const express = require('express');
const { getDashboard, getTransactionHistory } = require('../controllers/accountController');

const router = express.Router();

// GET /api/account/dashboard/:userId
router.get('/dashboard/:userId', getDashboard);

// GET /api/account/history/:userId
router.get('/history/:userId', getTransactionHistory);

module.exports = router;
