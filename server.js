require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server perpustakaan berjalan di http://localhost:${PORT}`);
  console.log(`📚 Endpoint Loans: http://localhost:${PORT}/loans`);
});
