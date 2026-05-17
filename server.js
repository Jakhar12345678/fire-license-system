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
// 1. DATABASE CONNECTION
// ==========================================
const cloudDB = 'mongodb+srv://Praveen:Praveen%40123@cluster0.7t8yqvy.mongodb.net/fireLicenseDB?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(cloudDB)
.then(() => console.log("Cloud MongoDB Atlas se connection ekdum mast chal raha hai!"))
.catch((err) => console.error("Cloud DB Connection Error:", err));

// ==========================================
// 2. CLOUDINARY SETUP
// ==========================================
cloudinary.config({ 
  cloud_name: 'dshqbfxvx', 
  api_key: '935725329258952', 
  api_secret: 'Kr5SNhzPOPXnG5zFXxSrxfJDd4' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fire_license_photos',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage: storage });

// ==========================================
// 3. DATABASE SCHEMA (Yahan 'work' jod diya hai)
// ==========================================
const LicenseSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    location: String, 
    address: String,  
    quantity: Number,
    expiryDate: Date,
    work: String, // 👈 Naya option manually work likhne ke liye
    photos: [String]
});
const License = mongoose.model('License', LicenseSchema);

// ==========================================
// 4. APIs (ALL ROUTES)
// ==========================================

// A. Create
app.post('/api/licenses', upload.array('photos', 5), async (req, res) => {
    try {
        const { name, mobile, location, address, quantity, expiryDate, work } = req.body;
        const filePaths = req.files.map(file => file.path);
        
        const newLicense = new License({ 
            name, mobile, location, address, quantity, 
            expiryDate: new Date(expiryDate), 
            work, // 👈 database me save hoga
            photos: filePaths 
        });
        
        await newLicense.save();
        res.status(201).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// B. Read
app.get('/api/licenses', async (req, res) => {
    try {
        const data = await License.find().sort({ expiryDate: 1 });
        res.status(200).json(data);
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// C. Update
app.put('/api/licenses/:id', upload.array('photos', 5), async (req, res) => {
    try {
        const { name, mobile, location, address, quantity, expiryDate, work } = req.body;
        let updateData = { name, mobile, location, address, quantity, expiryDate: new Date(expiryDate), work };
        
        if (req.files && req.files.length > 0) {
            updateData.photos = req.files.map(file => file.path);
        }

        await License.findByIdAndUpdate(req.params.id, updateData);
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// D. Delete
app.delete('/api/licenses/:id', async (req, res) => {
    try {
        await License.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));