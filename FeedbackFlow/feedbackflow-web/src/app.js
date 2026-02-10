const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('FeedbackFlow API running');
});

module.exports = app;
