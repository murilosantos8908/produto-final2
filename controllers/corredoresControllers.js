const db = require('../db');
const express = require('express');

exports.getAllCorredores = async (req, res) => {
  try {
    const [corredores] = await db.query('SELECT * FROM corredores');
    res.json(corredores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCorredor = async (req, res) => {
  try {
    const { name, equipe } = req.body;
    await db.query('INSERT INTO corredores (name, equipe) VALUES (?, ?)', [name, equipe]);
    res.status(201).json({ message: 'Corredor created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCorredor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, equipe } = req.body;
    await db.query('UPDATE corredores SET name = ?, equipe = ? WHERE id = ?', [name, equipe, id]);
    res.json({ message: 'Corredor updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCorredor = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM corredores WHERE id = ?', [id]);
    res.json({ message: 'Corredor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRanking = async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT c.id, c.name, SUM(v.tempo) AS tempoTotal
      FROM corredores c
      JOIN voltas v ON c.id = v.corredorId
      GROUP BY c.id, c.name
      ORDER BY tempoTotal ASC
    `);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};