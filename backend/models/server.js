const { MongoClient } = require('mongodb');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./users');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require("nodemailer");
const Channel =require('./channels.js')
const Event = require('./events')
const Need = require('./needs')
const Notification = require('./notifications')
const Goal = require('./goals')

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
  const { username, password  } = req.body;
  try {
    const user = await User.findOne({ username});
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
  let { username, password, mail, firstName, lastName, gender } = req.body;

  console.log('Received data:', req.body); // Gelen verileri kontrol etme
  
  if (!username || !password || !mail || !firstName || !lastName || !gender) {
    return res.status(400).json({ message: 'Tüm alanları doldurun!' });
  }

  // E-posta küçük harfe çevrilsin
  mail = mail.toLowerCase();


  try {
    // Kullanıcı var mı kontrolü
    const existingUser = await User.findOne({ mail });

    if (existingUser) {
      return res.status(400).json({ message: 'Email zaten kayıtlı!' });
    }

    
    // Yeni kullanıcı oluşturma
    const newUser = new User({
      username,
      password,
      mail,
      firstName,
      lastName,
      gender,
    });

    // Kullanıcıyı kaydetme işlemi
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!', user: newUser });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const verificationCodes = {}; 
const tempUsers = {};


app.post('/api/send-code', async (req, res) => {
  const { username, password, mail, firstName, lastName, gender } = req.body;
  
  if (!username || !password || !mail || !firstName || !lastName || !gender) {
    return res.status(400).json({ message: 'Tüm alanları doldurun!' });
  }

  const updatedMail = mail.toLowerCase();
  const existingUser = await User.findOne({ mail: updatedMail });

  if (existingUser) {
    return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı!' });
  }

  // **Rastgele 6 Haneli Doğrulama Kodu Üretme**
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[updatedMail] = verificationCode;

  // **Geçici Kullanıcı Bilgilerini Sakla**
  tempUsers[updatedMail] = { username, password, mail: updatedMail, firstName, lastName, gender };

  const mailOptions = {
    from: 'timeBoxxR.A@gmail.com',
    to: updatedMail,
    subject: 'Doğrulama Kodu',
    text: `Doğrulama kodunuz: ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: 'Mail gönderilemedi', error: error.message });
    }
    res.status(200).json({ success: true, message: 'Kod gönderildi!' });
  });
});

// **2. Doğrulama Kodu Kontrolü ve Kullanıcı Kaydı**
app.post('/api/verify-code', async (req, res) => {
  const { mail, verificationCode } = req.body;
  const updatedMail = mail.toLowerCase();

  if (!verificationCodes[updatedMail] || verificationCodes[updatedMail] !== verificationCode) {
    return res.status(400).json({ message: 'Geçersiz veya yanlış kod!' });
  }

  if (!tempUsers[updatedMail]) {
    return res.status(400).json({ message: 'Geçici kullanıcı verisi bulunamadı!' });
  }

  // **Geçici Kullanıcı Verisini Al ve MongoDB'ye Kaydet**
  const newUser = new User(tempUsers[updatedMail]);
  await newUser.save();

  // **Başarılı Olursa Geçici Verileri Temizle**
  delete verificationCodes[updatedMail];
  delete tempUsers[updatedMail];

  res.status(201).json({ success: true, message: 'Kullanıcı kaydı tamamlandı!' });
});
// Kullanıcıları listeleme
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}); 
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Kullanıcı Bilgisi Getirme
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('channels');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});


app.put('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName,username, lastName, telephone, mail, gender, profileImage } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, username,lastName, telephone, mail, gender, profileImage },
      { new: true } // Güncellenmiş kullanıcıyı döndürmesi için
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/username/:id', async (req, res) => {
  
  try {
    const user = await User.findById(req.params.id).select('username');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.status(200).json({ username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});




//------------------------Channel-----------------

//------------------------Channel-----------------

app.post('/api/channelCreate', async (req, res) => {
  console.log("İstek verileri:", req.body); // Gelen verileri gör
  
  const { name, communityName, channelCode, userId, username } = req.body;
  
  if (!name || !communityName || !channelCode || !userId || !username) {
      return res.status(400).json({ message: "Tüm alanları doldurun!" });
  }
  
  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
      }
  
      const existingChannel = await Channel.findOne({ name });
      if (existingChannel) {
          return res.status(400).json({ message: "Bu kanal adı zaten kayıtlı!" });
      }
  
      const newChannel = new Channel({
          name,
          createdAt: new Date(),
          communityName,
          channelCode,
          users: [userId],
          username,
      });
      await newChannel.save();
  
      user.channels.push(newChannel._id);
      await user.save();
  
      res.status(201).json({ message: "Kanal başarıyla oluşturuldu!", channel: newChannel });
  } catch (error) {
      res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Kanala Katılma
app.post('/api/join-channel', async (req, res) => {
  const { userId, channelId } = req.body;

  if (!userId || !channelId) {
    return res.status(400).json({ message: 'Kullanıcı ID ve Kanal ID gerekli!' });
  }

  try {
    const user = await User.findById(userId);
    const channel = await Channel.findById(channelId);

    if (!user || !channel) {
      return res.status(404).json({ message: 'Kullanıcı veya Kanal bulunamadı!' });
    }

    if (!user.firstName || !user.lastName || !user.gender) {
      return res.status(400).json({ message: 'Kullanıcı bilgileri eksik! Lütfen profilinizi tamamlayın.' });
    }

    let isNewJoin = false;

    if (!user.channels.includes(channelId)) {
      user.channels.push(channelId);
      await user.save();
      isNewJoin = true;
    }

    if (!channel.users.includes(userId)) {
      channel.users.push(userId);
      await channel.save();
      isNewJoin = true;
    }

    // 📢 **Bildirim oluştur (Yeni katılanlara bildirim gönder)**
    if (isNewJoin) {
      // Kanalın tüm kullanıcılarına bildirim gönder
      for (const channelUserId of channel.users) {
        if (channelUserId.toString() !== userId) {
          const channelUser = await User.findById(channelUserId); // Kullanıcı bilgilerini al
          if (channelUser) {
            await new Notification({
              title: 'Yeni Kanal Üyesi', // Bildirim başlığı
              userId: channelUserId, // Bildirimi alan kullanıcı
              message: `Kanala ${user.username} katıldı.`, // Bildirim mesajı
              channelId: channel._id,
              createdAt: new Date(),
            }).save();
          }
        }
      }
    }

    res.status(200).json({ message: 'Kanala başarıyla katıldınız!', user });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});



// Kullanıcının Kanallarını Getirme
app.get('/api/user-channels/:id', async (req, res) => {
  try {
    const channels = await Channel.find({ users: req.params.id });
    res.status(200).json(channels);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kanal Bilgisi Getirme
app.get('/api/channel/:id', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).populate('users');
    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı' });
    }

    // Eğer `users` alanı yoksa, boş bir dizi ekleyelim
    if (!channel.users) {
      channel.users = [];
    }

    res.status(200).json(channel);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

app.get('/api/channel-by-code/:code', async (req, res) => {
  try {
    const channel = await Channel.findOne({ channelCode: req.params.code });
    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı' });
    }
    res.status(200).json(channel);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});
app.get('/api/channel/:channelId/users', async (req, res) => {
  try {
    const { channelId } = req.params;
    console.log(channelId)

    // Kanal ID'sinin eksik olup olmadığını kontrol et
    if (!channelId) {
      console.log("HATA: Kanal ID gelmedi!");
      return res.status(400).json({ message: 'Eksik kanal ID!' });
    }

    // Kanal ID'sinin geçerli MongoDB ObjectId formatında olup olmadığını kontrol et
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      console.log("HATA: Geçersiz kanal ID formatı!");
      return res.status(400).json({ message: 'Geçersiz kanal ID!' });
    }

    // Kanalı bulmak için ObjectId oluştur
    const objectId = new mongoose.Types.ObjectId(channelId);

    // Kanalı ve ilişkili kullanıcıları (katılımcıları) bul
    const channel = await Channel.findById(objectId).populate('users');

    // Eğer kanal bulunamazsa, hata mesajı döndür
    if (!channel) {
      console.log("HATA: Kanal bulunamadı!");
      return res.status(404).json({ message: 'Kanal bulunamadı' });
    }

    // Kanalın kullanıcılarını (katılımcıları) al ve her birinin durumu (status) ile birlikte döndür
    const participants = channel.users.map(user => ({
      _id: user._id.toString(),
      username: user.username,
      status: user.status || 'pending',  // Eğer user.status yoksa, varsayılan 'pending' değeri kullanılır
    }));

    // Katılımcıları başarılı bir şekilde döndür
    return res.status(200).json({ participants });

  } catch (err) {
    // Hata oluşursa, sunucu hatasını loglayarak döndür
    console.error("Sunucu Hatası:", err);
    return res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});


//--------ETKİNLİK----------------------- 

app.post('/api/create-event', async (req, res) => {
  const { username, description, date, time, location, channelId, userId, communityName } = req.body;

  if (!username || !description || !date || !channelId || !userId || !location || !time) {
    return res.status(400).json({ message: 'Tüm alanlar gereklidir!' });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: 'Geçersiz channelId formatı!' });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Geçersiz userId formatı!' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (!channel.users.includes(userId)) {
      return res.status(400).json({ message: 'Kullanıcı kanalın üyesi değil' });
    }

    const username = user.username;

    // Etkinlik oluşturuluyor
    const newEvent = new Event({
      description,
      date: new Date(date),
      time,
      location,
      channelId,
      users: [userId],
      username,
      communityName,
    });

    await newEvent.save();

    // Kanalın etkinlik listesine yeni etkinliği ekleyelim
    channel.events.push(newEvent._id);
    await channel.save();

    // **📢 Bildirimleri oluştur ve gönder**
    const notifications = channel.users
      .filter((channelUserId) => channelUserId.toString() !== userId) // Etkinlik oluşturan hariç
      .map((channelUserId) => ({
        userId: channelUserId,
        message: `${username} yeni bir etkinlik oluşturdu: ${description}`,
        eventId: newEvent._id,
        createdAt: new Date(),
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ message: 'Etkinlik başarıyla oluşturuldu!', event: newEvent });

  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Sunucu hatası', error: err.message });
    }
  }
});

// 📌 **Etkinliğe Katılma (Bildirimli)**
app.post('/api/join-event', async (req, res) => {
  const { eventId, userId } = req.body;

  if (!eventId || !userId) {
    return res.status(400).json({ message: 'Etkinlik ID ve Kullanıcı ID gereklidir!' });
  }

  try {
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);

    if (!event || !user) {
      return res.status(404).json({ message: 'Etkinlik veya kullanıcı bulunamadı' });
    }

    if (!event.users.includes(userId)) {
      event.users.push(userId);
      await event.save();

      // 📢 **Bildirim oluştur** (Etkinlik sahibine gönder)
      const eventOwnerId = event.users[0]; // İlk kullanıcı etkinlik sahibidir
      if (eventOwnerId.toString() !== userId) {
        await new Notification({
          title: 'Yeni Etkinlik!',
          userId: eventOwnerId,
          message: `${user.username} etkinliğinize katıldı: ${event.description}`,
          eventId: event._id,
          createdAt: new Date(),
        }).save();
      }

      res.status(200).json({ message: 'Etkinliğe başarıyla katıldınız' });
    } else {
      res.status(400).json({ message: 'Kullanıcı zaten etkinlikte' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});



// Etkinlik Detaylarını Getirme
app.get('/api/event/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    // Etkinlik detaylarını ve katılımcıları getir
    const event = await Event.findById(eventId).populate('userId');
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});
app.delete('/api/event/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const { userId, username } = req.body;
  try {
    // Etkinliği sil
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }
    const notifications = event.users
      .filter((channelUserId) => channelUserId.toString() !== userId) // Etkinlik oluşturan hariç
      .map((channelUserId) => ({
        userId: channelUserId,
        message: `${username} etkinliği sildi: ${event.description}`,
        eventId: event._id,
        createdAt: new Date(),
      }));

    res.status(200).json({ message: 'Etkinlik başarıyla silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

app.get('/api/events/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    
    if (!channelId) {
      console.log("HATA: Kanal ID gelmedi!");
      return res.status(400).json({ message: 'Eksik kanal ID!' });
    }
    // Kanal ID'sinin geçerli olup olmadığını kontrol et
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      console.log("HATA: Geçersiz kanal ID formatı!");
      return res.status(400).json({ message: 'Geçersiz kanal ID!' });
    }

    // ObjectId oluştur
    const objectId = new mongoose.Types.ObjectId(channelId);

    // Kanalı bul
    const channel = await Channel.findById(objectId).populate('events');
    
    if (!channel) {
      console.log("HATA: Kanal bulunamadı!");
      return res.status(404).json({ message: 'Kanal bulunamadı' });
    }

     // Etkinliklerin ID'lerini düzelt
     const eventsWithId = channel.events.map(event => ({
      id: event._id.toString(), 
      title: event.title,
      date: event.date,
      username: event.username,
      location: event.location,
      description: event.description,
    }));

    // Güncellenmiş etkinlik listesini döndür
    return res.status(200).json({ events: eventsWithId });

  } catch (err) {
    console.error("Sunucu Hatası:", err);
    return res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});
app.post('/api/events/update-status', async (req, res) => {
  try {
    const { eventId, userId, status, channelId } = req.body;

    // **Gelen verileri logla**
    console.log("🛠 Gelen Veriler:", { eventId, userId, status, channelId });

    // Eksik bilgi kontrolü
    if (!eventId || !userId || !status || !channelId) {
      console.error("❌ Eksik bilgi:", { eventId, userId, status, channelId });
      return res.status(400).json({ message: "Eksik bilgi: eventId, userId, status ve channelId gereklidir." });
    }

    // **channelId'nin MongoDB ObjectId formatında olup olmadığını kontrol et**
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      console.error("❌ Geçersiz kanal ID:", channelId);
      return res.status(400).json({ message: "Geçersiz kanal ID!" });
    }

    // Güncellenebilir durumları kontrol et
    const validStatuses = ['approved', 'rejected', 'pending', 'scheduled'];
    if (!validStatuses.includes(status)) {
      console.error("❌ Geçersiz durum değeri:", status);
      return res.status(400).json({ message: "Geçersiz durum değeri." });
    }

    // Etkinliği MongoDB'de ara
    const event = await Event.findById(eventId);
    if (!event) {
      console.error("❌ Etkinlik bulunamadı:", eventId);
      return res.status(404).json({ message: "Etkinlik bulunamadı." });
    }



    // Kullanıcının etkinlikteki durumunu güncelle
    await Event.findByIdAndUpdate(eventId, { status }, { new: true });

    console.log("✅ Durum başarıyla güncellendi:", { eventId, newStatus: status });

    return res.status(200).json({ message: "Durum başarıyla güncellendi.", newStatus: status });

  } catch (error) {
    console.error("❌ Sunucu hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası. Lütfen tekrar deneyin." });
  }
});
app.get('/api/channels/:channelId', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId)
      .populate('users', 'username')  // 'users' alanını popüle ediyoruz ve sadece username'lerini alıyoruz
      .exec();
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    res.json(channel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/events/:eventId/participants', async (req, res) => {
  try {
    const { eventId } = req.params;
    console.log('alınan Event Id', eventId)
    // eventId boş veya geçersizse hata verelim
    if (!eventId || eventId.length !== 24) {
      console.log('alınan Event Id', eventId)
      console.log('event uzunluğu', eventId.length)

      return res.status(400).json({ message: "Geçersiz eventId" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Etkinlik bulunamadı." });
    }

    const channelId = event.channelId;
    const channel = await Channel.findById(channelId).populate('users', 'username status');
    
    if (!channel) {
      return res.status(404).json({ message: "Kanal bulunamadı." });
    }

    const participants = channel.users.map(user => ({
      _id: user._id.toString(),
      username: user.username,
      status: user.status || 'pending',
    }));

    return res.status(200).json({ participants });

  } catch (error) {
    console.error("❌ Sunucu hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası. Lütfen tekrar deneyin." });
  }
});



//-------------Yapılacaklar-----------------
app.post('/api/create-need', async (req, res) => {
  console.log("Gelen request body:", req.body); 
  const { userId, username, title, note, channelId, communityName, } = req.body;

  if (!userId || !username || !title || !channelId ) { // type burada kontrol ediliyor
    return res.status(400).json({ message: 'Gerekli alanlar eksik!' });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: 'Geçersiz kanal ID!' });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı!' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı ID!' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });
    }

    if (!channel.users.includes(userId)) {
      return res.status(400).json({ message: 'Kullanıcı bu kanalın üyesi değil!' });
    }

    const username = user.username;

    const newNeed = new Need({
      title,
      note,
      channelId,
      users: [userId],
      username, 
      communityName,
    });

    await newNeed.save();

    if (!channel.needs) {
      channel.needs = [];
    }

    // Yeni ihtiyacı kanalın 'needs' dizisine ekliyoruz
    channel.needs.push(newNeed._id);
    await channel.save();

    const notifications = channel.users
    .filter((channelUserId) => channelUserId.toString() !== userId) // Kendisi hariç
    .map((channelUserId) => ({
      title: 'Yeni İhtiyaç Paylaşıldı', // 🔴 title eklendi
      userId: channelUserId,
      message: `${username} yeni bir ihtiyaç oluşturdu: ${title}`,
      needId: newNeed._id,
      createdAt: new Date(),
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ message: 'İhtiyaç başarıyla oluşturuldu!', need: newNeed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

// İhtiyaca Katılma
app.post('/api/join-need', async (req, res) => {
  const { needId, userId } = req.body;

  if (!needId || !userId) {
    return res.status(400).json({ message: 'İhtiyaç ID ve Kullanıcı ID gereklidir!' });
  }

  try {
    const need = await Need.findById(needId);
    const user = await User.findById(userId);

    if (!need || !user) {
      return res.status(404).json({ message: 'İhtiyaç veya kullanıcı bulunamadı!' });
    }

    if (!need.users.includes(userId)) {
      need.users.push(userId);
      await need.save();
      res.status(200).json({ message: 'İhtiyaca başarıyla katıldınız' });
    } else {
      res.status(400).json({ message: 'Kullanıcı zaten bu ihtiyaca katılmış' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

// Belirli Bir İhtiyacı Getirme
app.get('/api/need/:needId', async (req, res) => {
  const { needId } = req.params;

  // Geçersiz ID kontrolü
  if (!mongoose.Types.ObjectId.isValid(needId)) {
    return res.status(400).json({ message: 'Geçersiz ID formatı' });
  }

  try {
    // İhtiyacı veritabanından al
    const need = await Need.findById(needId).populate('userId');
    if (!need) {
      return res.status(404).json({ message: 'İhtiyaç bulunamadı' });
    }
    res.status(200).json(need); // İhtiyacın detaylarını döndür
  } catch (err) {
    console.error("Sunucu Hatası:", err); // Detaylı hata logu
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

app.delete('/api/need/:needId', async (req, res) => {
  const { needId } = req.params;
  const { userId, username } = req.body;

  // Geçersiz ID kontrolü
  if (!mongoose.Types.ObjectId.isValid(needId)) {
    return res.status(400).json({ message: 'Geçersiz ID formatı' });
  }

  try {
    // Silinecek ihtiyacı veritabanından bul
    const need = await Need.findByIdAndDelete(needId);
    if (!need) {
      return res.status(404).json({ message: 'İhtiyaç bulunamadı' });
    }

    // Bildirimler (İhtiyacın oluşturucusu hariç)
    const notifications = need.users
      .filter((channelUserId) => channelUserId.toString() !== userId) // İhtiyacı oluşturan hariç
      .map((channelUserId) => ({
        userId: channelUserId,
        message: `${username} ihtiyacı sildi: ${need.description}`, // İhtiyacın açıklaması
        needId: need._id,
        createdAt: new Date(),
      }));

    // Bildirimleri kaydedebilirsiniz (Eğer bir bildirim koleksiyonunuz varsa)
    // Örnek: await Notification.insertMany(notifications);

    res.status(200).json({ message: 'İhtiyaç başarıyla silindi' });
  } catch (err) {
    console.error("Sunucu Hatası:", err); // Detaylı hata logu
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});


// Belirli Bir Kanalın Tüm İhtiyaçlarını Getirme
app.get('/api/needs/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: 'Geçersiz kanal ID!' });
    }

    const channel = await Channel.findById(channelId).populate('needs');

    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı!' });
    }


    const needsWithDetails = channel.needs.map(need => ({
      id: need._id.toString(),
      title: need.title,
      note: need.note,
      username: need.username,
      users: need.users, 
    }));

    return res.status(200).json({ needs: needsWithDetails });
  } catch (err) {
    console.error("Sunucu Hatası:", err);
    return res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});
//-----------Bildirimler-------------
// 📩 Bildirim Oluşturma
app.post('/api/notifications', async (req, res) => {
  const { title, message, eventId, userId, channelId } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Başlık ve mesaj zorunludur' });
  }

  try {
    const newNotification = new Notification({
      title,
      message,
      eventId: eventId || null, // Etkinliğe bağlıysa ekleriz, değilse null
      userId: userId || null, // Kullanıcıya özelse ekleriz, değilse null
      channelId: channelId || null, // Kanal bazlı bildirimler için
    });

    await newNotification.save();
    res.status(201).json({ message: 'Bildirim başarıyla oluşturuldu', notification: newNotification });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

app.get('/api/notifications/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Geçersiz kullanıcı ID' });
  }

  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

// 📌 **Bildirimleri Okundu Olarak İşaretleme**
app.put('/api/notifications/mark-as-read/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Geçersiz kullanıcı ID' });
  }

  try {
    await Notification.updateMany({ userId }, { $set: { read: true } });
    res.status(200).json({ message: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});


//-----HEDEFLER--------------------------------------
// GET: Tüm hedefleri getir

app.get('/api/goals', async (req, res) => {
  try {
    const goals = await Goal.find();
    res.status(200).json(goals);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

// POST: Yeni hedef oluştur
app.post('/api/goals', async (req, res) => {
  const { title, description, amount,communityName, selectedType, userId, username,date,channelId } = req.body;
  
  if (!title || !amount || !username || !date ||!userId || !channelId|| !selectedType || !description) {
    return res.status(400).json({ message: 'Gerekli alanlar eksik!' });

  }
  try {
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: 'Geçersiz kanal ID!' });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı ID!' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (!channel.users.includes(userId)) {
      return res.status(400).json({ message: 'Kullanıcı bu  kanalın üyesi değil' });
    }

    const username = user.username;

    const goalData = req.body;
    console.log('Received Goal Data:', goalData); // Burada gelen veriyi kontrol et

    const goal = new Goal({
      title,  
      channelId,
      description, 
      amount, 
      selectedType,
      userId,
      users: [userId],
      date , 
      progress: 0,
      communityName,
      username
      });

      const validationError = goal.validateSync(); // Mongoose validation
      if (validationError) {
        console.error('Validation Error:', validationError);
        return res.status(400).json({ error: validationError.message });
      }
    await goal.save();

    channel.goals.push(goal._id);
    await channel.save();

    const notifications = goal.users
      .filter((channelUserId) => channelUserId.toString() !== userId) // İhtiyacı oluşturan hariç
      .map((channelUserId) => ({
      userId: channelUserId,
      message: `${username} yeni bir hedef oluşturdu: ${title}`,
      goalId: goal._id,
      createdAt: new Date(),
      date,
      channelId: channelId,
    }));

    await Notification.insertMany(notifications);
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message, stack: err.stack });
  }
});

// PUT: Hedefi güncelle
app.put('/api/goals/:goalId', async (req, res) => {
  const { goalId } = req.params;
  const { title, description, amount, selectedType, userId, username } = req.body;

  try {
    const updatedGoal = await Goal.findByIdAndUpdate(
      goalId,
      { title, description, amount, selectedType },
      { new: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ message: 'Hedef bulunamadı' });
    }

    const usersToNotify = await getOtherUsers(userId);

    const notifications = usersToNotify.map((uid) => ({
      userId: uid,
      message: `${username} bir hedefi güncelledi: ${title}`,
      goalId: updatedGoal._id,
      createdAt: new Date(),
    }));

    await Notification.insertMany(notifications);
    res.status(200).json(updatedGoal);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

// DELETE: Hedefi sil
app.delete('/api/goals/:goalId', async (req, res) => {
  const { goalId } = req.params;
  const { userId, username } = req.body;

  try {
    const deletedGoal = await Goal.findByIdAndDelete(goalId);

    if (!deletedGoal) {
      return res.status(404).json({ message: 'Hedef bulunamadı' });
    }

    const usersToNotify = await getOtherUsers(userId);

    const notifications = usersToNotify.map((uid) => ({
      userId: uid,
      message: `${username} bir hedefi sildi: ${deletedGoal.title}`,
      goalId: deletedGoal._id,
      createdAt: new Date(),
    }));

    await Notification.insertMany(notifications);
    res.status(200).json({ message: 'Hedef başarıyla silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});
// Belirli Bir Hedefi Getirme
app.get('/api/goals/:goalId', async (req, res) => {
  const { goalId } = req.params;

  // Geçersiz ID kontrolü
  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    return res.status(400).json({ message: 'Geçersiz ID formatı' });
  }

  try {
    // İhtiyacı veritabanından al
    const goal = await Goal.findById(goalId).populate('userId');
    if (!goal) {
      return res.status(404).json({ message: 'İhtiyaç bulunamadı' });
    }
    res.status(200).json(goal); // İhtiyacın detaylarını döndür
  } catch (err) {
    console.error("Sunucu Hatası:", err); // Detaylı hata logu
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});



// Belirli Bir Kanalın Tüm Hedeflerini Getirme
app.get('/api/goals/channel/:channelId:', async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: 'Geçersiz kanal ID!' });
    }

    const channel = await Channel.findById(channelId).populate('goals');

    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı!' });
    }


    const goalsWithDetails = channel.goals.map(goal => ({
      id: goal._id.toString(),
      title: goal.title,
      description: goal.description,
      amount: goal.amount,
      selectedType: goal.selectedType,
      username: goal.username,
      users: goal.users, 
    }));

    return res.status(200).json({ goals: goalsWithDetails });
  } catch (err) {
    console.error("Sunucu Hatası:", err);
    return res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

// Server başlatıyoruz
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
