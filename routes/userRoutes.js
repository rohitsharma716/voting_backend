const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

// Signup route
router.post('/signup', async (req, res) => {
     
  try {
    const data = req.body;

    // Check if epicNo already exists
    const existingUser = await User.findOne({ epicNo: data.epicNo });
    if (existingUser) {
      return res.status(400).json({ error: 'Epic Number already registered' });
    }

    const newUser = new User(data);
    const response = await newUser.save();
    console.log('Data saved');

    const payload = { id: response.id };
    const token = generateToken(payload);

    res.status(200).json({ user: response, token });
  } catch (err) {
    console.error('Error during signup:', err.message);
    res.status(500).json({ error: 'Internal Server Error!' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { epicNo, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ epicNo });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if the password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate token
    const payload = { id: user.id };
    const token = generateToken(payload);

    res.status(200).json({ token });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ error: 'Internal Server Error!' });
  }
});

// Profile route
router.get('/', jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ error: 'Internal Server Error!' });
  }
});

// Update password route
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    // Hash the new password before saving
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    console.log('Password updated successfully');
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err.message);
    res.status(500).json({ error: 'Internal Server Error!' });
  }
});

module.exports = router;
