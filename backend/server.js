const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/users');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors()); // React Native ile iletişim için gerekli
app.use(bodyParser.json()); // JSON verileri için

mongoose.connect('mongodb://127.0.0.1:27017/timeBox', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Login endpoint'i
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.status(200).json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Register endpoint'i
app.post('/api/register', async (req, res) => {
  const { username, password, mail } = req.body;

  console.log('Received data:', req.body); // Burada gelen verileri yazdırıyoruz

  if (!username || !password || !mail) {
    return res.status(400).json({ message: 'Please fill in all fields!' });
  }

  try {
    // Kullanıcı var mı kontrolü
    const existingUser = await User.findOne({ mail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered!' });
    }

    // Yeni kullanıcı oluşturma
    const newUser = new User({ username, password, mail });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!', user: newUser });
  } catch (err) {
    console.error("Error during registration:", err); // Detaylı hata loglaması yaptık
    res.status(500).json({ message: 'Server error', error: err.message }); // Hata mesajını JSON olarak döndürüyoruz
  }
});



app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Server başlatıyoruz
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
