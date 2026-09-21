const express = require('express');
const router = express.Router();
const pool = require('./config/db');

// Deposit
router.post('/deposit', async (req, res) => {
  const { userId, amount } = req.body;
  if (!amount || amount <= 0) {
    return res.json({ success: false, message: 'Invalid amount' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, userId]);

    const [rows] = await conn.query('SELECT balance FROM users WHERE id = ?', [userId]);
    const newBalance = rows[0].balance;

    await conn.query(
      'INSERT INTO transactions (from_user, to_user, type, amount, balance_after, status) VALUES (?, ?, ?, ?, ?, ?)',
      [null, userId, 'DEPOSIT', amount, newBalance, 'SUCCESS']
    );

    await conn.commit();
    res.json({ success: true, newBalance });
  } catch (err) {
    await conn.rollback();
    res.json({ success: false, message: 'Deposit failed' });
  } finally {
    conn.release();
  }
});

// Withdraw
router.post('/withdraw', async (req, res) => {
  const { userId, amount } = req.body;
  if (!amount || amount <= 0) {
    return res.json({ success: false, message: 'Invalid amount' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT balance FROM users WHERE id = ?', [userId]);
    if (!rows.length || rows[0].balance < amount) {
      await conn.rollback();
      return res.json({ success: false, message: 'Insufficient balance' });
    }

    await conn.query('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, userId]);

    const [updated] = await conn.query('SELECT balance FROM users WHERE id = ?', [userId]);
    const newBalance = updated[0].balance;

    await conn.query(
      'INSERT INTO transactions (from_user, to_user, type, amount, balance_after, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, null, 'WITHDRAW', amount, newBalance, 'SUCCESS']
    );

    await conn.commit();
    res.json({ success: true, newBalance });
  } catch (err) {
    await conn.rollback();
    res.json({ success: false, message: 'Withdrawal failed' });
  } finally {
    conn.release();
  }
});

// Transfer
router.post('/transfer', async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;
  if (!amount || amount <= 0 || fromUserId == toUserId) {
    return res.json({ success: false, message: 'Invalid transfer' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [sender] = await conn.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [fromUserId]);
    if (!sender.length || sender[0].balance < amount) {
      await conn.rollback();
      return res.json({ success: false, message: 'Insufficient balance' });
    }

    const [recipient] = await conn.query('SELECT id FROM users WHERE id = ?', [toUserId]);
    if (!recipient.length) {
      await conn.rollback();
      return res.json({ success: false, message: 'Recipient not found' });
    }

    await conn.query('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, fromUserId]);
    await conn.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, toUserId]);

    const [senderAfter] = await conn.query('SELECT balance FROM users WHERE id = ?', [fromUserId]);

    await conn.query(
      'INSERT INTO transactions (from_user, to_user, type, amount, balance_after, status) VALUES (?, ?, ?, ?, ?, ?)',
      [fromUserId, toUserId, 'TRANSFER', amount, senderAfter[0].balance, 'SUCCESS']
    );

    await conn.commit();
    res.json({ success: true, newBalance: senderAfter[0].balance });
  } catch (err) {
    await conn.rollback();
    res.json({ success: false, message: 'Transfer failed' });
  } finally {
    conn.release();
  }
});

// Transaction history
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;
  const [rows] = await pool.query(
    'SELECT * FROM transactions WHERE from_user = ? OR to_user = ? ORDER BY created_at DESC',
    [userId, userId]
  );
  res.json(rows);
});

module.exports = router;