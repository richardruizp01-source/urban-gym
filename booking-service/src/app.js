require('dotenv').config(); // ← PRIMERA
const express = require('express');
const cors = require('cors'); 
const bookingRoutes = require('./routes/booking.routes');

const app = express();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/v1/bookings', bookingRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🚀 Arsenal de Booking operativo en puerto ${PORT}`);
});