const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const receptionRoutes = require('./routes/reception');
const doctorRoutes = require('./routes/doctor');
const labRoutes = require('./routes/lab');
const nurseRoutes = require('./routes/nurse');
const pharmacyRoutes = require('./routes/pharmacy');
const inventoryRoutes = require('./routes/inventory');
const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// app.use(cors());
app.use(express.json());


// Configure CORS
app.use(
    cors({
        origin: 'http://localhost:8080', // Explicitly allow the frontend origin
        credentials: true, // Allow credentials (cookies, etc.)
    })
);

// Handle preflight OPTIONS requests
app.options('*', cors());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reception', receptionRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/auth', require('./routes/auth'));


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});