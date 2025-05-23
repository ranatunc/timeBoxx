require('dotenv').config({ path: '/Users/ranatunc/Desktop/timeBoxx/backend/.env' });
const { MongoClient } = require('mongodb');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./User');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Channel = require('./channels.js');
const Event = require('./events');
const Need = require('./needs');
const Notification = require('./notifications');
const Goal = require('./goals');
const app = express();


app.use(cors()); // React Native ile iletişim için gerekli
app.use(bodyParser.json()); // JSON verileri için

mongoose.connect(process.env.MONGO_URI, { 
  dbName:'timeboxx',
 })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


// Çevresel değişkenleri kontrol et
console.log(process.env.PORT); // Portu kontrol et
console.log('MONGO_URI:', process.env.MONGO_URI); // Burada çevresel değişkeni konsola yazdırıyoruz
console.log(process.env);  
// Login endpoint'i
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Düz metin karşılaştırma (şifreler hash'lenmediyse)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', user });

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
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'timeBoxxr.a@gmail.com',
      pass: 'uipf wwir xrlu xzql', 
    },
    tls: {
      rejectUnauthorized: false,  
    }  });


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

app.post('/api/change-password', async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Eski şifre kontrolü (güvenlik için hash karşılaştırması önerilir)
    if (user.password !== oldPassword) {
      return res.status(400).json({ message: 'Eski şifre yanlış' });
    }

    user.password = newPassword; // Şifre hashlenmiyorsa doğrudan atanıyor
    await user.save();

    res.status(200).json({ message: 'Şifre başarıyla güncellendi' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});



//------------------------Channel-----------------

//------------------------Channel-----------------

app.post('/api/channelCreate', async (req, res) => {

  const { name, communityName, channelCode, userId, username } = req.body;

  if (!name || !communityName || !channelCode || !userId || !username) {
    return res.status(400).json({ message: "Tüm alanları doldurun!" });
  }

  // Kanal adı normalize ediliyor (boşluklar temizlenip küçük harfe çevriliyor)
  const normalize = (str) => str.trim().toLowerCase();
  const normalizedName = normalize(name);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }

    // Normalize adı kontrol et
    const existingChannel = await Channel.findOne({ normalizedName });
    if (existingChannel) {
      return res.status(400).json({ message: "Bu kanal adı zaten kayıtlı!" });
    }

    const newChannel = new Channel({
      name,
      normalizedName,
      createdAt: new Date(),
      communityName,
      channelCode,
      users: [userId],
      username,
    });

    await newChannel.save();

    user.channels.push(newChannel._id);
    await User.findByIdAndUpdate(userId, {
      $push: { channels: newChannel._id }
    });

    res.status(201).json({ message: "Kanal başarıyla oluşturuldu!", channel: newChannel });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});


// Kanala Katılma
app.post('/api/join-channel', async (req, res) => {
  const { userId, channelId } = req.body;
  const channel = await Channel.findById(channelId);

  if (!userId || !channel) {
    return res.status(404).json({ message: 'Kullanıcı veya Kanal bulunamadı!' });
  }
  if (!userId || !channelId) {
    return res.status(400).json({ message: 'Kullanıcı ID ve Kanal ID gerekli!' });
  }

  if (!channel || !channel.name || !channel.normalizedName) {
    return res.status(400).json({ message: 'Geçersiz kanal!' });
  }
  
  try {
    const user = await User.findById(userId);
    const channel = await Channel.findById(channelId);

    if (!user || !channel) {
      return res.status(404).json({ message: 'Kullanıcı veya Kanal bulunamadı!' });
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
              messageKey: 'channel_joined',
              messageParams: {username: user.username , title},
              userId: channelUserId, // Bildirimi alan kullanıcı
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
  const { username, description, date, time, location, channelId, userId, communityName,decisionPeriod } = req.body;

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

    // Karar süresi hesapla
    let decisionDeadline = new Date(); // şimdi

    if (decisionPeriod === 'test-3dk') {
      decisionDeadline.setMinutes(decisionDeadline.getMinutes() + 3); // 🔧 3 dakika ekle
    } else if (decisionPeriod === '1g') {
      decisionDeadline.setDate(decisionDeadline.getDate() + 1);
    } else if (decisionPeriod === '7g') {
      decisionDeadline.setDate(decisionDeadline.getDate() + 7);
    } else if (decisionPeriod === '30g') {
      decisionDeadline.setDate(decisionDeadline.getDate() + 30);
    } else {
      // Default: 1 gün
      decisionDeadline.setDate(decisionDeadline.getDate() + 1);
    }

    // Etkinlik oluşturuluyor
    const newEvent = new Event({
      description,
      date: new Date(date),
      time,
      location,
      channelId,
      users: [{ userId, status: 'pending' }],
      username,
      communityName,
      creatorId: req.body.userId,
      decisionDeadline,
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
        messageKey: 'event_created',
        messageParams: {
          date,
          description
        },
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

// 📅 Belirli bir tarihteki tüm etkinlikleri getir
app.get('/api/events', async (req, res) => {
  const { date } = req.query;
  console.log("📥 Gelen date parametresi:", date);

  // Tarih parametresi kontrolü
  if (!date) {
    return res.status(400).json({ message: 'Tarih parametresi gerekli (gg/aa/yyyy)' });
  }

  // gg/aa/yyyy formatını kontrol et
  const dateParts = date.split('/');
  if (dateParts.length !== 3) {
    return res.status(400).json({ message: 'Geçersiz tarih formatı (gg/aa/yyyy bekleniyor)' });
  }

  const [day, month, year] = dateParts.map(part => parseInt(part, 10));

  // Tarih doğrulaması
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return res.status(400).json({ message: 'Geçersiz tarih bileşeni' });
  }

  // Date objesi oluştur
  const start = new Date(year, month - 1, day); // Aylar sıfırdan başladığı için month - 1
  const end = new Date(start);
  end.setDate(start.getDate() + 1); // Bir gün sonrası için 'end' tarihi ayarla

  // Tarih doğrulama
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ message: 'Geçersiz tarih formatı (gg/aa/yyyy bekleniyor)' });
  }

  try {
    // Etkinlikleri tarih aralığında bul
    const events = await Event.find({
      date: {
        $gte: start,
        $lt: end,
      },
    }).sort({ date: 1 });

    res.status(200).json(events);
  } catch (err) {
    console.error('Etkinlikler alınamadı:', err);
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

// Etkinlik Detaylarını Getirme
app.get('/api/event/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId)
    .populate('users.userId', 'username').populate('userId'); // Eğer event'in sahibi veya oluşturucusu gibi bir şeyse

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
  const { userId, username } = req.query;

  try {
    // Etkinliği sil
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }
    const notifications = event.users
    .filter(u => u.userId.toString() !== userId)
    .map(u => ({
      userId: u.userId,
      messageKey: 'event_deleted',
      messageParams: {
        date,
        description
      },      
      eventId: event._id,
      createdAt: new Date(),
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

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

    // Kanalı al ve kullanıcı listesini çek
    const channel = await Channel.findById(objectId);
    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı' });
    }

    // Kanalın kullanıcı ID listesini al
    const channelUserIds = channel.users.map(userId => userId.toString());

    // Bu kanala ait ve oluşturanı kanal üyesi olan etkinlikleri çek
    const events = await Event.find({ 
      channelId: objectId, 
      creatorId: { $in: channel.users } 
    });


     // Etkinliklerin ID'lerini düzelt
     const eventsWithId = events.map(event => ({
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
app.get('/api/events/channel/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: 'Geçersiz kanal ID!' });
    }

    if (!date) {
      return res.status(400).json({ message: 'Tarih eksik!' });
    }

    // Tarihi başlangıç ve bitiş saatine çevir
    const [day, month, year] = date.split('/');
    const startOfDay = new Date(`${year}-${month}-${day}T00:00:00`);
    const endOfDay = new Date(`${year}-${month}-${day}T23:59:59`);

    // Kanalı doğrula
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı' });
    }

    // Etkinlikleri çek
    const events = await Event.find({
      channelId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate('users.userId'); // Eğer kullanıcı bilgileri lazımsa

    res.status(200).json(events);
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});
app.post('/api/events/update-status', async (req, res) => {
  console.log("🧪 Event users schema:", Event.schema.paths['users.$.userId']);
  try {
    const { eventId, userId, status, channelId, username } = req.body;

    console.log("📥 Status update request:", { eventId, userId, status, channelId });

    if (!eventId || !userId || !status || !channelId) {
      return res.status(400).json({ message: "Eksik bilgi gönderildi." });
    }

    const validStatuses = ['approved', 'rejected', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Geçersiz durum değeri." });
    }

    if (
      !mongoose.Types.ObjectId.isValid(eventId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ message: "Geçersiz ID formatı." });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Etkinlik bulunamadı." });
    }
    const now = new Date();
    const decisionDeadline = new Date(event.decisionDeadline);
    const timeExpired = now > decisionDeadline;

    if (timeExpired) {
      return res.status(403).json({ message: "Karar verme süresi sona erdi." });
    }


     // Kullanıcıyı bul ve güncelle
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const userIndex = event.users.findIndex(
      (u) => u.userId && u.userId.toString() === userObjectId.toString()
    );
    console.log("📌 typeof userObjectId:", typeof userObjectId);
    console.log("📌 userObjectId instanceof ObjectId:", userObjectId instanceof mongoose.Types.ObjectId);
    
    if (userIndex !== -1) {
      event.users[userIndex].status = status;
      console.log(`✅ Kullanıcı statüsü güncellendi: ${status}`);
    } else {
      event.users = event.users.filter(u => u.userId && u.status); // 👈 BOZUK KULLANICILARI TEMİZLE
    
      const newUser = {
        userId: new mongoose.Types.ObjectId(userId),
        status
      };
    
      event.users.push(newUser);
      console.log(`✅ Yeni kullanıcı eklendi: ${status}`);
    }
    
    

    await event.save();

    await Notification.create({
      userId: event.userId,
      title: 'Etkinlik Yanıtı',
      message: `${username}, etkinliğe "${status}" dedi.`,
      eventId,
      createdAt: new Date()
    });

    return res.status(200).json({ message: "Durum başarıyla güncellendi." });

  } catch (error) {
    console.error("❌ Status update server error:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
});



app.get('/api/channel/:channelId', async (req, res) => {
  const { channelId } = req.params;

  console.log("📥 channelId alındı:", channelId);

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    console.warn("❌ Geçersiz channelId:", channelId);
    return res.status(400).json({ message: 'Geçersiz kanal ID!' });
  }

  try {
    const channel = await Channel.findById(channelId).populate('users', 'username');
    if (!channel) {
      console.warn("❌ Kanal bulunamadı:", channelId);
      return res.status(404).json({ message: 'Kanal bulunamadı!' });
    }

    console.log("✅ Kanal bulundu:", channel.name);
    res.json(channel);
  } catch (err) {
    console.error('❌ Kanal detaylarında hata:', err);
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});


app.get('/api/events/:eventId/participants', async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId || eventId.length !== 24) {
      return res.status(400).json({ message: "Geçersiz eventId" });
    }

    const event = await Event.findById(eventId).populate('users.userId', 'username');
    if (!event) {
      return res.status(404).json({ message: "Etkinlik bulunamadı." });
    }

    const participants = event.users.map(u => ({
      _id: u.userId._id,
      username: u.userId.username,
      status: u.status || 'pending',
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
  const { userId, title, note, channelId, communityName, singleCompletion, allMustComplete, users } = req.body;
  const user = await User.findById(userId);
  const username = user.username; // Artık bu hata vermez
  
  console.log("users:", users); // 🔍 KONTROL NOKTASI

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
      userId, 
      users: req.body.users, // 👈 BU SATIR!
      username, 
      communityName,
      singleCompletion,
      allMustComplete,
      completedUsers: [],
      endDate: '',
    });
    
    
    users.forEach(uid => newNeed.completedStatus.set(uid.toString(), false));

 
    // İhtiyacı veritabanına kaydediyoruz
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
      userId: channelUserId,
      messageKey:'need_created', 
      messageParams:{ username, title },
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
    const need = await Need.findById(needId).populate('userId').populate('users', 'username').populate('completedUsers', 'username');

    if (!need) {
      return res.status(404).json({ message: 'İhtiyaç bulunamadı' });
    }
    res.status(200).json(need); // İhtiyacın detaylarını döndür
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

 // GÜNCELLENMİŞ backend kodu
const channel = await Channel.findById(channelId)
.populate({
  path: 'needs',
  populate: [
    { path: 'users', select: 'username' },
    { path: 'completedUsers', select: 'username' }
  ]
});


    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı!' });
    }

    const needsWithDetails = channel.needs.map(need => ({
      id: need._id.toString(),
      title: need.title,
      note: need.note,
      username: need.username,
      users: need.users,               // ✅ artık dolu geliyor
      completedUsers: need.completedUsers, // ✅ artık dolu geliyor
      completed: need.completed,
      singleCompletion: need.singleCompletion,
    }));
    

    return res.status(200).json({ needs: needsWithDetails });
  } catch (err) {
    console.error("Sunucu Hatası:", err);
    return res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});







// İhtiyacı Tamamlama
app.put('/api/complete-need/:needId', async (req, res) => {
  const { needId } = req.params;
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ message: "Kullanıcı ID gerekli." });
    }

    const need = await Need.findById(needId);
    if (!need) {
      return res.status(404).json({ message: "Need bulunamadı." });
    }

    // Görev zaten tamamlandıysa tekrar tamamlanamaz
    if (need.completed) {
      return res.status(400).json({ message: 'Bu görev zaten tamamlandı.' });
    }

    // Eğer kullanıcı zaten tamamlamışsa
    if (need.completedUsers.includes(userId)) {
      return res.status(400).json({ message: 'Bu görevi tamamladınız.' });
    }

    // Gerekirse kullanıcıyı katılımcı listesine ekle
    if (!need.users.includes(userId)) {
      need.users.push(userId);
    }

    // Kullanıcıyı tamamlayanlar listesine ekle
    need.completedUsers.push(userId);

    // Tamamlanma kontrolü
    if (need.singleCompletion) {
      need.completed = true;
      need.status = 'completed';
    } else if (need.allMustComplete) {
      const allCompleted = need.completedUsers.length === need.users.length;
      need.completed = allCompleted;
      if (allCompleted) {
        need.status = 'completed';
      }
    }

    await need.save();

    res.status(200).json({ message: "Need başarıyla tamamlandı.", need });

  } catch (error) {
    console.error("Need tamamlanırken hata:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

  

// İhtiyaçları Silme
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
        messageKey: 'need_created',
        messageParams: {
          username:need.username,
          title:need.title
        },    
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

//-----------Bildirimler-------------
// 📩 Bildirim Oluşturma
app.post('/api/notifications', async (req, res) => {
  const { title, message,titleKey,messageKey,messageParams, eventId, userId, channelId } = req.body;

  if ((!title || !message) && (!titleKey || !messageKey)) {
    return res.status(400).json({ message: 'Başlık ve mesaj zorunludur' });
  }

  try {
    const newNotification = new Notification({
      title,
      message,
      titleKey,
      messageKey,
      messageParams,
      eventId: eventId || null,
      userId: userId || null,
      channelId: channelId || null,
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

// ✅ 🔄 TEK BİLDİRİMİ OKUNDU OLARAK İŞARETLEME
app.put('/api/notifications/mark-as-read/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Geçersiz bildirim ID' });
  }

  try {
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json({ message: 'Bildirim okundu olarak işaretlendi' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

// 📌 TÜM Bildirimleri Okundu Yapmak İstersen (opsiyonel)
app.put('/api/notifications/mark-as-read-by-user/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Geçersiz kullanıcı ID' });
  }

  try {
    await Notification.updateMany({ userId }, { $set: { isRead: true } });
    res.status(200).json({ message: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});
// 📛 Bildirim Silme
app.delete('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı.' });
    }

    res.status(200).json({ message: 'Bildirim silindi.' });
  } catch (error) {
    console.error('Bildirim silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});
// 🔴 Okunmamış bildirim sayısını getir
app.get('/api/notifications/unread-count/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Geçersiz kullanıcı ID' });
  }

  try {
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    res.status(200).json({ unreadCount });
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

    const creatorUsername = user.username;

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
      username : creatorUsername
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
      messageKey:'goal_created', 
      messageParams:{ username, title },
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

    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({ message: 'Geçersiz ID formatı' });
    }

    if (!deletedGoal) {
      return res.status(404).json({ message: 'Hedef bulunamadı' });
    }

    const notifications = deletedGoal.users
      .filter((channelUserId) => channelUserId.toString() !== userId) // İhtiyacı oluşturan hariç
      .map((channelUserId) => ({
      userId: channelUserId,
      messageKey: 'goal_deleted',
      messageParams: {
        username,
        title:deletedGoal.title
      },  
      goalId: deletedGoal._id,
      createdAt: new Date(),
    }));

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
    const goal = await Goal.findById(goalId);
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
app.get('/api/goals/channel/:channelId', async (req, res) => {
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
      SavedAmount: goal.SavedAmount,
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
app.post('/api/goals/:goalId/contributions', async (req, res) => {
  const { goalId } = req.params;
  const { username, amount } = req.body;

  console.log("Katkı isteği geldi:", { username, amount });

  if (!username || amount === undefined || amount === null || isNaN(parseFloat(amount))) {
    return res.status(400).json({ message: 'Geçerli kullanıcı adı ve katkı miktarı gerekli!' });
  }

  try {
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Hedef bulunamadı!' });
    }

    const contribution = {
      username,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
    };

    goal.contributions.push(contribution);
    goal.SavedAmount += parseFloat(amount);

    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    console.error("Katkı ekleme hatası:", error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});



// Server başlatıyoruz
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));