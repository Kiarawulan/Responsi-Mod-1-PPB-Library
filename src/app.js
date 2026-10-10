require('dotenv').config();
const express = require('express');
const cors = require('cors');
const loanRoutes = require('./routes/loanRoutes');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Library Loan API is running' });
});

app.use('/loans', loanRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
