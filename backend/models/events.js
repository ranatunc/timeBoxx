const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    createdAt: { 
        type: Date,
        default: Date.now,
    },
    location: {
        type: String,
    },
    users: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Etkinlikteki kullanıcılar User modeline referans
        status: { // Durum her bir kullanıcı için ekleniyor
            type: String, 
            enum: ['approved', 'rejected', 'pending'],  
            default: 'pending', // Varsayılan durum 'pending' olarak ayarlanıyor
        }
    }],
      
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
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
    username: {
        type: String,
    },
    notifications: [{  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification', // Etkinlikle ilgili bildirimleri saklamak için
    }],
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
