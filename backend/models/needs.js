const mongoose = require('mongoose');
const User = require('./users');  // Kullanıcı modelini doğru import et

const needSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  note: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  channelId: { 
    type: mongoose.Schema.Types.ObjectId, // Kanalın ID'si
    ref: 'Channel', // Etkinlik, Channel modeline bağlı
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Burada kullanıcının kimliğiyle ilişkilendiriyoruz
    required: false,
  },
  users: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Etkinlikteki kullanıcılar User modeline referans
  }],
  username: {
    type: String,
  }, 
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed'],
    default: 'scheduled',
  },
    
});

const Need = mongoose.model('Need', needSchema);

module.exports = Need;
