require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/empties-returns', require('./routes/emptiesReturns'));
app.use('/api/route-bills', require('./routes/routeBills'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Beverage Inventory API Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));