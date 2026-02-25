const { pool } = require('../config/postgres');
const { validateQuery, sanitizeQuery } = require('../utils/sqlValidator');
const User = require('../models/User');

exports.executeQuery = async (req, res) => {
  try {
    const { query, assignmentId } = req.body;

    // Validate
    const validation = validateQuery(query);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.reason });
    }

    const cleanQuery = sanitizeQuery(query);

    // Set statement timeout for safety (5 seconds)
    const client = await pool.connect();
    try {
      await client.query('SET statement_timeout = 5000');
      const start = Date.now();
      const result = await client.query(cleanQuery);
      const duration = Date.now() - start;

      const response = {
        columns: result.fields.map((f) => f.name),
        rows: result.rows,
        rowCount: result.rowCount,
        duration,
      };

      // Save attempt if user is logged in
      if (req.user && assignmentId) {
        await User.findByIdAndUpdate(req.user._id, {
          $push: {
            attempts: {
              assignmentId,
              query: cleanQuery,
              success: true,
            },
          },
        });
      }

      res.json(response);
    } catch (pgErr) {
      // Return SQL error to user (helpful for learning)
      res.status(422).json({
        error: pgErr.message,
        detail: pgErr.detail || null,
        hint: pgErr.hint || null,
        position: pgErr.position || null,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserAttempts = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const user = await User.findById(req.user._id).select('attempts');
    const attempts = assignmentId
      ? user.attempts.filter((a) => a.assignmentId === assignmentId)
      : user.attempts;

    res.json({ attempts: attempts.reverse().slice(0, 20) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
