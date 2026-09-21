const pool = require('../config/db');

// GET /api/account/dashboard/:userId
// Returns: { name, email, balance }
const getDashboard = async (req, res) => {
  const { userId } = req.params;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT name, email, balance, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = rows[0];
    return res.status(200).json({
      success: true,
      name: user.name,
      email: user.email,
      balance: user.balance,
      memberSince: user.created_at
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/account/history/:userId
// Returns: array of transactions
const getTransactionHistory = async (req, res) => {
  const { userId } = req.params;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT
         t.id,
         t.type,
         t.amount,
         t.balance_after,
         t.status,
         t.created_at,
         t.from_user,
         t.to_user,
         fu.name AS from_name,
         tu.name AS to_name
       FROM transactions t
       LEFT JOIN users fu ON t.from_user = fu.id
       LEFT JOIN users tu ON t.to_user = tu.id
       WHERE t.from_user = ? OR t.to_user = ?
       ORDER BY t.created_at DESC`,
      [userId, userId]
    );

    return res.status(200).json({ success: true, transactions: rows });
  } catch (error) {
    console.error('History error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getDashboard, getTransactionHistory };
