require('dotenv').config();
const express = require('express');
const cors = require('cors');
const billingRoutes = require('./routes/billing.routes');
const { iniciarJobs } = require('./jobs/billing.jobs');

const app = express();

app.use(cors({ origin: '*', methods: ['GET','POST', 'PUT', 'DELETE'] }));
app.use(express.json());
app.use('/api/v1/billing', billingRoutes);
console.log('✅ Rutas de billing registradas');

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`💰 Billing Service operativo en puerto ${PORT}`);
  iniciarJobs();
});