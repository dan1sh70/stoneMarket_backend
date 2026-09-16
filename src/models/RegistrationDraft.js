const mongoose = require('mongoose');

const registrationDraftSchema = new mongoose.Schema({
  registration_id: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['mining', 'manufacturer', 'showroom', 'trader', 'buyer', 'transport_national', 'transport_local', 'customer'],
    required: true
  },
  current_step: { type: Number, default: 1 },
  completed_steps: [{ type: Number }],
  status: { 
    type: String, 
    enum: ['draft', 'step_1_completed', 'step_2_completed', 'step_3_completed', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  data: {
    step1: { type: mongoose.Schema.Types.Mixed, default: {} },
    step2: { type: mongoose.Schema.Types.Mixed, default: {} },
    step3: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  expiresAt: { type: Date, default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 } // TTL 7 days
}, { timestamps: true });

// TTL index
registrationDraftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RegistrationDraft', registrationDraftSchema);
