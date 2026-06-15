const db = require('../db');
const express = require('express');

exports.getAllVoltas = async (req, res) => {
  try {
    const [voltas] = await db.query('SELECT id, id_corredor, tempo_segundos, data_volta FROM voltas');
    res.json(voltas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createVolta = async (req, res) => {
  try {
    const { id_corredor, tempo_segundos, data_volta } = req.body;
    if (!id_corredor || !tempo_segundos || !data_volta) {
      return res.status(400).json({ error: 'id_corredor, tempo_segundos e data_volta são obrigatórios.' });
    }
    await db.query(
      'INSERT INTO voltas (id_corredor, tempo_segundos, data_volta) VALUES (?, ?, ?)',
      [id_corredor, tempo_segundos, data_volta]
    );

    res.status(201).json({ message: 'Volta criada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateVolta = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_corredor, tempo_segundos, data_volta } = req.body;

    if (!id_corredor || !tempo_segundos || !data_volta) {
      return res.status(400).json({ error: 'id_corredor, tempo_segundos e data_volta são obrigatórios.' });
    }
    await db.query(
      'UPDATE voltas SET id_corredor = ?, tempo_segundos = ?, data_volta = ? WHERE id = ?',
      [id_corredor, tempo_segundos, data_volta, id]
    );

    res.json({ message: 'Volta atualizada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteVolta = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM voltas WHERE id = ?', [id]);
    res.json({ message: 'Volta deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMelhorVolta = async (req, res) => {
  try {
    const { id_corredor } = req.params;
    const [result] = await db.query(
      'SELECT MIN(tempo_segundos) AS melhorVolta FROM voltas WHERE corredorId = ?',
      [id_corredor]
    );
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// tempo_segundos total de um corredor
exports.getTempoTotal = async (req, res) => {
  try {
    const { id_corredor } = req.params;
    const [result] = await db.query(
      'SELECT SUM(tempo_segundos) AS tempoTotal FROM voltas WHERE corredorId = ?',
      [id_corredor]
    );
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Quantidade de voltas de um corredor
exports.getQuantidadeVoltas = async (req, res) => {
  try {
    const { id_corredor } = req.params;
    const [result] = await db.query(
      'SELECT COUNT(*) AS quantidadeVoltas FROM voltas WHERE corredorId = ?',
      [id_corredor]
    );
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ranking dos id_corredor (ordenado pelo menor tempo_segundos total)
exports.getRanking = async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT c.id, c.name, SUM(v.tempo_segundos) AS tempoTotal
      FROM id_corredor c
      JOIN voltas v ON c.id = v.id_corredor
      GROUP BY c.id, c.name
      ORDER BY tempoTotal ASC
    `);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};