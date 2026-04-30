const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/voice', require('./routes/voice'));
app.use('/api/profile', require('./routes/profile'));

app.get('/', (req, res) => {
  res.send('Doctor AI Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
