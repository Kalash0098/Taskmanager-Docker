const express = require('express');
const Task = require('../models/Task');
const { client: redisClient } = require('../redisClient');

const router = express.Router();
const CACHE_KEY = 'tasks:all';
const CACHE_TTL_SECONDS = 30;

// GET /api/tasks - list all tasks (Redis-cached)
router.get('/', async (req, res) => {
  try {
    const cached = await redisClient.get(CACHE_KEY);
    if (cached) {
      return res.json({ source: 'cache', tasks: JSON.parse(cached) });
    }

    const tasks = await Task.find().sort({ createdAt: -1 });
    await redisClient.setEx(CACHE_KEY, CACHE_TTL_SECONDS, JSON.stringify(tasks));

    res.json({ source: 'db', tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks - create a task
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const task = await Task.create({ title, description });
    await redisClient.del(CACHE_KEY); // invalidate cache

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id - update a task (e.g. toggle completed)
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await redisClient.del(CACHE_KEY);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await redisClient.del(CACHE_KEY);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
