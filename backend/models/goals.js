const mongoose = require('mongoose');

const goalsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  selectedType: {
    type: String, // 'finansal' veya 'görev'
    required: true
  },
  amount: {
    type: Number,
    default: 0 // finansal hedefler için
  },
  SavedAmount: {
    type: Number,
    default: 0 // biriktirilen miktar için
  },
  progress: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String
  },
  contributions: [
    {
      username: String,
      amount: Number,
      date: String
    }
  ],
  tasks: [
    {
      name: String,
      completed: Boolean
    }
  ],
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
    required: true,
  },
  users: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Etkinlikteki kullanıcılar User modeline referans
  }],
  username: {
    type: String,
  }, 
});

const Goal = mongoose.model('Goal', goalsSchema);
module.exports = Goal;
