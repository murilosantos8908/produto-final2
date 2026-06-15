const db = require('../db');
const bcrypt = require('bcrypt');
const express = require('express');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, senha } = req.body;
    const senhaHash = await bcrypt.hashSync(senha, 10);

    if (!name || !email || !senha) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    await db.query('INSERT INTO users (name, email, senha) VALUES (?, ?, ?)', [name, email, senhaHash]);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};