require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./db');
const { initRedis } = require('./redisClient');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check - useful for container orchestration (Docker HEALTHCHECK, ECS, k8s probes)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'taskmanager-backend' });
});

app.use('/api/tasks', taskRoutes);

async function start() {
  await connectDB();
  await initRedis();

  app.listen(PORT, () => {
    console.log(`[Server] Backend listening on port ${PORT}`);
  });
}

start();
