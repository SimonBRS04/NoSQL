const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect('mongodb://localhost:27017/feedbackflow')
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

app.listen(3000, () => {
  console.log('API sur http://localhost:3000');
});
