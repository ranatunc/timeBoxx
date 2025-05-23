const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  location: { type: String },
  date: { type: Date, required: true },
  time: { type: String },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  decisionDeadline: {
    type: Date,
    required: true
  },  
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  users: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['approved', 'rejected', 'pending'], required: true }
  }],  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String },
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
});
console.log("✅ Event schema paths for users:", eventSchema.paths['users.$.userId']); // BURAYA BAK


// 👇 Mongoose'un dupe model hatasından korunmak için:
module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);