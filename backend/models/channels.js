const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: { // "crearedAt" yerine "createdAt" düzeltilmeli
        type: Date,
        default: Date.now,
    },
    communityName: {
        type: String,
        required: true,
    },
    channelCode: {
        type: String,
        required: true,
        unique: true,
    },
    users: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users' // Eğer User modeli "users" koleksiyonuna bağlıysa, burada da "users" olmalı
    }],
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event', // Bu, kanalın etkinlikleriyle ilişkilendirilmesini sağlar
      }],
    needs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Need', // Bu, kanalın yapılacaklarla ilişkilendirilmesini sağlar
    }],
    notifications: [{  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification', // Kanala gelen bildirimleri takip etmek için
    }],
    goals:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Goal', 
    }],
});

const Channel = mongoose.model('channels', channelSchema);
module.exports = Channel;