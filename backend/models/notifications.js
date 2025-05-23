const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    title: {
        type: String, // Burada eksik olan "type" eklendi
        required: false,
    },
    message: {
        type: String,
        required: false
    },  
    titleKey: { type: String, required: false },
    messageKey: { type: String, required: false },
    messageParams: { type: Object, required: false },
    eventId: {
        type: mongoose.Schema.Types.ObjectId, // Etkinliğe referans için ObjectId olmalı
        ref: "Event",
        required: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Kullanıcıya referans eklendi
        ref: "User",
        required: true
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    channels: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Channel' 
    }],
    needs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Need', 
    }],
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event', // Burada Event modelini referans alıyoruz
      }],
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Burada kullanıcının kimliğiyle ilişkilendiriyoruz
        required: false,
    },
    username: {
        type: String,
    }, 
    users: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Etkinlikteki kullanıcılar User modeline referans
    }],
},{ timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
