const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');
const Candidate = require('../models/candidate');

// Function to check if a user has admin role
const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    return user?.role === "admin";
  } catch (err) {
    return false;
  }
};

// Signup route
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!await checkAdminRole(req.user.id))
      return res.status(403).json({ message: 'User does not have admin role' });

    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    console.log('Candidate saved');
    res.status(200).json({ response });
  } catch (err) {
    console.error('Error during signup:', err.message);
    res.status(500).json({ error: 'Internal Server Error!' });
  }
});

// Update candidate route
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!await checkAdminRole(req.user.id))
      return res.status(403).json({ message: 'User does not have admin role' });

    const candidateID = req.params.candidateID;
    const updatedCandidateData = req.body;
    const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
      new: true,
      runValidators: true,
    });

    if (!response) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    console.log('Candidate updated');
    res.status(200).json(response);
  } catch (err) {
    console.error('Error updating candidate:', err.message);
    res.status(500).json({ error: 'Internal Server Error!' });
  }
});

// Delete candidate route
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!await checkAdminRole(req.user.id))
      return res.status(403).json({ message: 'User does not have admin role' });

    const candidateID = req.params.candidateID;
    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    console.log('Candidate deleted');
    res.status(200).json({ message: 'Candidate deleted successfully' });
  } catch (err) {
    console.error('Error deleting candidate:', err.message);
    res.status(500).json({ error: 'Internal Server Error!' });
  }
});

// Voting route
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
  const candidateID = req.params.candidateID;
  const userId = req.user.id;

  try {
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: 'Vote cast successfully' });
  } catch (err) {
    console.error('Error while voting:', err.message);
    res.status(500).json({ error: 'Internal Server Error!' });
  }
});

// Route to get vote counts
router.get('/vote/count', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: 'desc' });
    const votesRecord = candidates.map((data) => ({
      party: data.party,
      count: data.voteCount,
    }));
    return res.status(200).json(votesRecord);
  } catch (err) {
    console.error('Error fetching vote count:', err.message);
    res.status(500).json({ error: 'Internal Server Error!' });
  }
});

module.exports = router;
