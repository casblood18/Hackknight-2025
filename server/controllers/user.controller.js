const userModel = require('../models/user.model');

async function getUsers(req, res) {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function createUser(req, res) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Invalid name' });
    }
    const user = await userModel.insert(name.trim());
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

module.exports = { getUsers, createUser };
