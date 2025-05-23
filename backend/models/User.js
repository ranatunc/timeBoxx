const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mail: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true
  },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'], 
    required: true 
  },
  profileImage: { 
    type: String, // Profil fotoğrafının URL'si veya base64 formatında olmasını sağlayabiliriz
    required: false, // Bu alan zorunlu değil
  },
  verificationCode: { 
    type: String 
  },
  channels: [{
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'Channel' 
  }],
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', // Burada Event modelini referans alıyoruz
  }],
  needs:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Need', 
}],
  notifications: [{  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification', // Kullanıcının bildirimlerini takip etmek için
  }],
  goals:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal', 
}],

});

// Koleksiyon adını verdik
const User = mongoose.model('User', userSchema);

module.exports = User;
