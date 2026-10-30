const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema({
  sender_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender_role: { 
    type: String, 
    enum: ['customer', 'support_agent', 'admin'], 
    default: 'customer' 
  },
  sender_name: { 
    type: String, 
    default: 'Customer' 
  },
  message: { 
    type: String, 
    required: true, 
    trim: true 
  },
  attachments: [{
    url: String,
    filename: String,
    size: Number,
    mimetype: String
  }],
  created_at: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: true });

const supportTicketSchema = new mongoose.Schema({
  ticket_number: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  subject: { 
    type: String, 
    required: [true, 'Ticket subject is required'], 
    trim: true 
  },
  category: { 
    type: String, 
    enum: [
      'Orders & Delivery', 
      'Stone Types & Pricing', 
      'Quotations & Estimates', 
      'Account & Security', 
      'General'
    ], 
    default: 'General' 
  },
  description: { 
    type: String, 
    required: [true, 'Ticket description is required'], 
    trim: true 
  },
  attachments: [{
    url: String,
    filename: String,
    size: Number,
    mimetype: String
  }],
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'], 
    default: 'open',
    index: true 
  },
  messages: [ticketMessageSchema],
  is_mock: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

supportTicketSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
