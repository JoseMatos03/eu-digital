require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const ingestRoutes = require('./routes/injest');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/eu-digital')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Mongo Error:', err));

// Config
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', ingestRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backoffice running on port ${PORT}`));
