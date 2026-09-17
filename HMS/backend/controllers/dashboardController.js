const pool = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ activeUsers }]] = await pool.query(
      "SELECT COUNT(*) AS activeUsers FROM users WHERE status = 'active'"
    );
    const [[{ totalProjects }]] = await pool.query('SELECT COUNT(*) AS totalProjects FROM projects');
    const [[{ activeProjects }]] = await pool.query(
      "SELECT COUNT(*) AS activeProjects FROM projects WHERE status = 'active'"
    );
    const [[{ totalBudget }]] = await pool.query(
      'SELECT COALESCE(SUM(budget), 0) AS totalBudget FROM projects'
    );

    const [usersByRole] = await pool.query(
      'SELECT role, COUNT(*) AS count FROM users GROUP BY role'
    );
    const [projectsByStatus] = await pool.query(
      'SELECT status, COUNT(*) AS count FROM projects GROUP BY status'
    );
    const [recentUsers] = await pool.query(
      'SELECT id, name, email, role, avatar_color, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );
    const [recentProjects] = await pool.query(
      'SELECT id, name, status, progress, due_date FROM projects ORDER BY created_at DESC LIMIT 5'
    );

    res.json({
      totals: {
        totalUsers,
        activeUsers,
        totalProjects,
        activeProjects,
        totalBudget,
      },
      usersByRole,
      projectsByStatus,
      recentUsers,
      recentProjects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
};
