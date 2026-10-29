require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const twinRoutes = require('./routes/twinRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');
require('./models/Twin');
require('./models/TwinConversation');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Active', message: 'Digital Twin API is running' });
});

app.use('/api/twins', twinRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Sync Database & Start Server
sequelize
  .sync()
  .then(() => {
    console.log('MySQL Database Connected & Synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
  })
  .catch((err) => {
    console.error('Database sync failed:', err.message);
  });

// PDF Ingestion enabled
