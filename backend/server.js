import express from 'express'
import cors from 'cors'
import http from 'http';  
import { Server } from 'socket.io';
import 'dotenv/config'
import connectDB from './config/mongobd.js'
import connectCloudinary from './config/cloudinary.js'

import adminRouter from './routes/adminRoute.js'
import authRoutes from './routes/authRoutes.js'
import doctorRoutes from './routes/doctorRoutes.js'
import mainRoutes from './routes/mainRoutes.js'
import patientRoutes from './routes/patientRoutes.js'

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

//middlewares
app.use(express.json())
app.use(cors())

// Creeaza server HTTP
const server = http.createServer(app);

// Creeaza server WebSocket (Socket.io)
const io = new Server(server, {
  cors: {
    origin: '*',  
  },
});

// Asculta evenimentele WebSocket
io.on('connection', (socket) => {
  console.log('Un client s-a conectat la WebSocket!');

  socket.on('disconnect', () => {
    console.log('Clientul s-a deconectat.');
  });
});

export { io };

//api endpoints
app.use('/api/admin', adminRouter)
//localhost:4000/api/admin

app.use('/api/auth', authRoutes)
//localhost:4000/api/auth

app.use('/api/doctor', doctorRoutes)
//localhost:4000/api/doctor

app.use('/api/main', mainRoutes)
//localhost:4000/api/main

app.use('/api/patient', patientRoutes)
//localhost:4000/api/patient

server.listen(port, () => console.log(`Backend-ul ruleaza pe http://localhost:${port}`));
app.listen(port, ()=> console.log("Server Started ", port))
