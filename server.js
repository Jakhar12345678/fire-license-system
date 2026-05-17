const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.use('/uploads', express.static('uploads')); 

// Uploads folder banana agar nahi hai toh
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// ==========================================
// 1. DATABASE CONNECTION (Cloud MongoDB Atlas)
// ==========================================
// Aapke username, password aur cluster ID ke sath complete link:
const cloudDB = 'mongodb+srv://Praveen:Praveen%40123@cluster0.7t8yqvy.mongodb.net/fireLicenseDB?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(cloudDB)
.then(() => console.log("Cloud MongoDB Atlas se connection ekdum mast chal raha hai!"))
.catch((err) => console.error("Cloud DB Connection Error:", err));

// ==========================================
// 2. DATABASE SCHEMA (Data Structure)
// ==========================================
const LicenseSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    location: String, // Google Map Link ke liye
    address: String,  // Manual Address ke liye
    quantity: Number,
    expiryDate: Date,
    photos: [String]
});
const License = mongoose.model('License', LicenseSchema);

// ==========================================
// 3. MULTER SETUP (Image Uploads)
// ==========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, './uploads'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

// ==========================================
// 4. APIs (ALL ROUTES)
// ==========================================

// A. Naya Record Create Karna (POST)
app.post('/api/licenses', upload.array('photos', 5), async (req, res) => {
    try {
        const { name, mobile, location, address, quantity, expiryDate } = req.body;
        const filePaths = req.files.map(file => `/uploads/${file.filename}`);
        
        const newLicense = new License({ 
            name, 
            mobile, 
            location, 
            address, 
            quantity, 
            expiryDate: new Date(expiryDate), 
            photos: filePaths 
        });
        
        await newLicense.save();
        res.status(201).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// B. Saara Data Sorted Order Me Lana (GET)
app.get('/api/licenses', async (req, res) => {
    try {
        const data = await License.find().sort({ expiryDate: 1 });
        res.status(200).json(data);
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// C. Record Ko Edit/Update Karna (PUT)
app.put('/api/licenses/:id', upload.array('photos', 5), async (req, res) => {
    try {
        const { name, mobile, location, address, quantity, expiryDate } = req.body;
        let updateData = { name, mobile, location, address, quantity, expiryDate: new Date(expiryDate) };
        
        if (req.files && req.files.length > 0) {
            updateData.photos = req.files.map(file => `/uploads/${file.filename}`);
        }

        await License.findByIdAndUpdate(req.params.id, updateData);
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// D. Record Ko Delete Karna (DELETE)
app.delete('/api/licenses/:id', async (req, res) => {
    try {
        await License.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// Server Start
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));