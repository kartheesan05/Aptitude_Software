import express from 'express';
const router = express.Router();

// Search user by email
router.get('/search', async (req, res) => {
  try {
    const { email } = req.query;
    // For now, returning mock data
    const mockUser = {
      name: "Test User",
      email: email,
      department: "Computer Science",
      status: "completed",
      score: 85,
      startTime: "2024-03-20 10:00:00",
      completionTime: "2024-03-20 11:00:00"
    };
    
    res.json(mockUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset user test
router.post('/reset-test', async (req, res) => {
  try {
    const { email } = req.body;
    // Add your reset logic here
    res.json({ message: 'Test reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export { router };
