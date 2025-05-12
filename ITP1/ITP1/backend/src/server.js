import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http'; // Add http server
import { Server } from 'socket.io'; // Import socket.io
import orderRatingRoutes from './routers/OrderRatingRoutes.js';
import offerRoutes from './routers/OfferRoutes.js';
import EmailNotification from './routers/StatusNotificationEmail.js';
import ProductReport from './routers/orderReportRoutes.js';


// Import routes
import priestRoutes from './routers/priestRoutes.js';
import bookingRoutes from './routers/bookingRoutes.js';
import userRoutes from './routers/user.router.js';
import adminRoutes from './routers/admin.router.js';
import productRoutes from './routers/productRoutes.js';
import packageRoutes from './routers/packageRoutes.js';
import invoiceRoutes from './routers/invoiceRoutes.js';
import orderRoutes from './routers/OrderRoutes.js';
import feedbackRoutes from './routers/FeedbackRoutes.js';
import purchaseRoutes from './routers/purchaseRoutes.js';
import paymentRoutes from './routers/PaymentRoutes.js';
import viewPaymentRoutes from './routers/ViewPaymentRoutes.js';

import chatRoutes from './routers/chatRoutes.js'; // ✅ Import chat routes
import Chat from './models/Chat.js'; // ✅ Import Chat model
import User from './models/user.model.js'; 
import uploadRoutes from './routers/uploadRoutes.js';




dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app); // Create server for socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// MongoDB connection
console.log("MongoDB URI:", process.env.MONGO_URI);

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is undefined.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running!' });
});

// API Routes
app.use('/api/priests', priestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/viewPaymentDetails', viewPaymentRoutes);

app.use('/api/chats', chatRoutes); // ✅ Added Chat API
app.use('/api/upload', uploadRoutes); 
app.use('/api/order-rating', orderRatingRoutes);
app.use('/api/offers',offerRoutes);
app.use('/api/notifications',EmailNotification);
app.use('/api/reports',ProductReport);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// ----------------- Socket.IO Chat Logic -----------------
const activeUsers = {}; // { email: socketId }
const messageQueue = {}; // Queue to store messages for offline users

io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  socket.on('joinRoom', async (userEmail) => {
    console.log(`User ${userEmail} joined room ${userEmail}`);
    socket.join(userEmail);
    activeUsers[userEmail] = socket.id;
  
    try {
      const chatUsers = await Chat.find({
        $or: [{ senderId: 'admin' }, { receiverId: 'admin' }]
      }).sort({ updatedAt: -1 });
  
      const userLastMessage = new Map();
  
      chatUsers.forEach(chat => {
        const otherUser = chat.senderId === 'admin' ? chat.receiverId : chat.senderId;
        if (!userLastMessage.has(otherUser)) {
          userLastMessage.set(otherUser, chat.createdAt);
        }
      });
  
      // ✅ Get user emails
      const userEmails = Array.from(userLastMessage.keys());
  
      // ✅ Fetch user details from database (User model)
      const usersFromDB = await User.find({ email: { $in: userEmails } });
  
      // ✅ Build final userList
      const userList = userEmails.map(email => {
        const userFromDB = usersFromDB.find(u => u.email === email);
        return {
          _id: email,
          name: userFromDB ? userFromDB.name : email,
          profilePic: userFromDB ? userFromDB.profilePic : null,
          lastMessageTime: userLastMessage.get(email),
        };
      });
  
      io.emit('userList', userList);
  
    } catch (error) {
      console.error('Error fetching chat users:', error.message);
    }
  
    io.emit('userOnline', userEmail);
  });
  
  socket.on('sendMessage', async (data) => {
    const { senderEmail, receiverEmail, messageType, messageContent } = data;
  
    const chat = new Chat({
      senderId: senderEmail,
      receiverId: receiverEmail,
      messageType,
      messageContent,
    });
  
    try {
      const savedChat = await chat.save();
      console.log('💬 Message saved:', savedChat);
  
      if (activeUsers[receiverEmail]) {
        io.to(activeUsers[receiverEmail]).emit('message', savedChat);
      } else {
        if (!messageQueue[receiverEmail]) {
          messageQueue[receiverEmail] = [];
        }
        messageQueue[receiverEmail].push(savedChat);
      }
  
      if (senderEmail !== receiverEmail && activeUsers[senderEmail]) {
        io.to(activeUsers[senderEmail]).emit('message', savedChat);
      }
  
    } catch (error) {
      console.error('❌ Error saving chat:', error.message);
      io.to(activeUsers[senderEmail]).emit('messageError', { error: 'Failed to save message.' });
    }
  });
  
  
  
  socket.on('disconnect', () => {
    let disconnectedUser = null;

    for (let email in activeUsers) {
      if (activeUsers[email] === socket.id) {
        disconnectedUser = email;
        delete activeUsers[email];
        break;
      }
    }

    if (disconnectedUser) {
      const lastSeenAt = new Date();
      console.log(`⚡ User ${disconnectedUser} disconnected, last seen at ${lastSeenAt}`);

      // Inform clients user is offline with last seen
      io.emit('userOffline', { userId: disconnectedUser, lastSeenAt: lastSeenAt });

      // (Optional) If you want, you can save lastSeenAt to a database permanently.
    }
  });
});




const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
