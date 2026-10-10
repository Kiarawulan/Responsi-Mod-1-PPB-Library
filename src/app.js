require('dotenv').config();
const express = require('express');
const cors = require('cors');
const loanRoutes = require('./routes/loanRoutes');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Library Loan API is running'
  });
});

// Routes
app.use('/loans', loanRoutes);
app.use('/api/loans', loanRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
