import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  partySize: { type: Number, required: true },
  ambienceZone: { type: String, required: true }, // "rooftop", "piano", "hearth", "terrace"
  status: { type: String, enum: ['waiting', 'seated', 'cancelled'], default: 'waiting' },
  estimatedWaitMinutes: { type: Number, default: 15 }
}, { timestamps: true });

const Waitlist = mongoose.models.Waitlist || mongoose.model('Waitlist', waitlistSchema);
export default Waitlist;
