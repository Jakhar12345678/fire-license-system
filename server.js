const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 

// ==========================================
// 1. DATABASE CONNECTION (Cloud MongoDB Atlas)
// ==========================================
const cloudDB = 'mongodb+srv://Praveen:Praveen%40123@cluster0.7t8yqvy.mongodb.net/fireLicenseDB?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(cloudDB)
.then(() => console.log("Cloud MongoDB Atlas se connection ekdum mast chal raha hai!"))
.catch((err) => console.error("Cloud DB Connection Error:", err));

// ==========================================
// 2. CLOUDINARY SETUP (Permanent Photo Storage)
// ==========================================
cloudinary.config({ 
  cloud_name: 'dshqbfxvx', 
  api_key: '935725329258952', 
  api_secret: 'Kr5SNhzPOPXnG5zFXxSrxfJDd4' 
});

// Multer ko Cloudinary ke sath jodna
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fire_license_photos', // Cloudinary par is naam ka folder banega
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage: storage });

// ==========================================
// 3. DATABASE SCHEMA (Data Structure)
// ==========================================
const LicenseSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    location: String, 
    address: String,  
    quantity: Number,
    expiryDate: Date,
    photos: [String] // Isme ab Cloudinary ki permanent internet link save hogi
});
const License = mongoose.model('License', LicenseSchema);

// ==========================================
// 4. APIs (ALL ROUTES)
// ==========================================

// A. Naya Record Create Karna (POST)
app.post('/api/licenses', upload.array('photos', 5), async (req, res) => {
    try {
        const { name, mobile, location, address, quantity, expiryDate } = req.body;
        
        // Cloudinary se aane wali secure permanent web links ko nikalna
        const filePaths = req.files.map(file => file.path);
        
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
            updateData.photos = req.files.map(file => file.path);
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