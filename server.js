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
// 3. DATABASE SCHEMA
// ==========================================
const LicenseSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    location: String, 
    address: String,  
    quantity: Number,
    expiryDate: Date,
    work: String, 
    photos: [String]
});
const License = mongoose.model('License', LicenseSchema);

// ==========================================
// 4. APIs (ALL ROUTES)
// ==========================================

// A. Create Record (POST)
app.post('/api/licenses', upload.array('photos', 5), async (req, res) => {
    try {
        console.log("Request Body Aayi:", req.body);
        const { name, mobile, location, address, quantity, expiryDate, work } = req.body;
        
        let filePaths = [];
        if (req.files && req.files.length > 0) {
            filePaths = req.files.map(file => file.path);
        }
        
        const newLicense = new License({ 
            name, 
            mobile, 
            location, 
            address, 
            quantity: quantity ? Number(quantity) : 0, 
            expiryDate: expiryDate ? new Date(expiryDate) : null, 
            work: work || '', 
            photos: filePaths 
        });
        
        await newLicense.save();
        console.log("Data successfully save ho gaya MongoDB mein!");
        return res.status(201).json({ success: true });
    } catch (error) { 
        console.error("POST Error Details:", error);
        return res.status(500).json({ success: false, error: error.message }); 
    }
});

// B. Read All Records (GET)
app.get('/api/licenses', async (req, res) => {
    try {
        const data = await License.find().sort({ expiryDate: 1 });
        return res.status(200).json(data);
    } catch (error) { 
        return res.status(500).json({ success: false, error: error.message }); 
    }
});

// C. Update Record (PUT)
app.put('/api/licenses/:id', upload.array('photos', 5), async (req, res) => {
    try {
        const { name, mobile, location, address, quantity, expiryDate, work } = req.body;
        let updateData = { name, mobile, location, address, quantity: quantity ? Number(quantity) : 0, work: work || '' };
        
        if (expiryDate) {
            updateData.expiryDate = new Date(expiryDate);
        }
        if (req.files && req.files.length > 0) {
            updateData.photos = req.files.map(file => file.path);
        }

        await License.findByIdAndUpdate(req.params.id, updateData);
        return res.status(200).json({ success: true });
    } catch (error) { 
        return res.status(500).json({ success: false, error: error.message }); 
    }
});

// D. Delete Record (DELETE)
app.delete('/api/licenses/:id', async (req, res) => {
    try {
        await License.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true });
    } catch (error) { 
        return res.status(500).json({ success: false, error: error.message }); 
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));