const mongoose = require('mongoose');

const PinSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'A pin must have a title'] 
  },
  description: { 
    type: String 
  },
  imageUrl: { 
    type: String, 
    required: [true, 'A pin must have an image URL'] 
  },
  
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false 
  },
 
  likes: { 
    type: [String], 
    default: [] 
  }
}, { 
  
  timestamps: true 
});

module.exports = mongoose.model('Pin', PinSchema);