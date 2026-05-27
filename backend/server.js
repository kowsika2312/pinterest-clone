const express = require('express'); 
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;


const Pin = require('./models/Pin'); 

dotenv.config();
const app = express();
app.use(express.json());


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer memory storage for file uploading
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api/pins', async (req, res) => {
  try {
    const { q } = req.query;

   
    if (q) {
      const searchRegex = new RegExp(q, 'i');
      const matchedPins = await Pin.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      }).sort({ createdAt: -1 });
      
      return res.json(matchedPins); 
    }

    const pins = await Pin.find().sort({ createdAt: -1 });
    res.json(pins);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pins', upload.single('image'), async (req, res) => {
  try {
    const { title, description, userId } = req.body;
    
    if (!req.file) return res.status(400).json({ msg: 'Please upload an image' });

    cloudinary.uploader.upload_stream({ folder: 'pinterest_clone' }, async (error, result) => {
      if (error) return res.status(500).json({ error: error.message });

      const newPin = new Pin({
        title,
        description,
        imageUrl: result.secure_url,
        user: userId || new mongoose.Types.ObjectId(), 
        likes: [] // Explicitly initialize with an empty array for data safety
      });

      const savedPin = await newPin.save();
      res.status(201).json(savedPin);
    }).end(req.file.buffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pins/interaction/like', async (req, res) => {
  try {
    const { userId, pinId } = req.body; 

    if (!userId || !pinId) {
      return res.status(400).json({ message: "User ID and Pin ID are required" });
    }

    let pin = await Pin.findById(pinId);
    if (!pin) pin = await Pin.findOne({ _id: pinId });

    if (!pin) return res.status(404).json({ message: "Pin not found" });
    if (!pin.likes) pin.likes = [];

    const targetUser = String(userId);
    if (pin.likes.map(id => String(id)).includes(targetUser)) {
      pin.likes = pin.likes.filter(id => String(id) !== targetUser);
    } else {
      pin.likes.push(targetUser);
    }

    await pin.save({ validateBeforeSave: false });
    res.status(200).json(pin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pins/:id', async (req, res) => {
  try {
    const pinId = req.params.id;
    const deletedPin = await Pin.findByIdAndDelete(pinId);

    if (!deletedPin) {
      return res.status(404).json({ message: "Pin not found" });
    }

    res.status(200).json({ message: "Pin deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const dbCollection = mongoose.connection.db.collection('users');

    const existingUser = await dbCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const insertResult = await dbCollection.insertOne({
      username,
      password,
      createdAt: new Date()
    });
    
    res.status(201).json({ message: "User registered successfully!", userId: insertResult.insertedId });
  } catch (err) {
    console.error(" DIRECT DATABASE REGISTRATION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const dbCollection = mongoose.connection.db.collection('users');
    const user = await dbCollection.findOne({ username });
    
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful!", userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server streaming on port ${PORT}`));