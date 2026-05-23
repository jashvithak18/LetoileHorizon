import Waitlist from '../models/Waitlist.js';

// Pre-seeded waitlist items for simulator
let SIMULATED_WAITLIST = [
  {
    _id: 'wait_001',
    name: 'Lysander Sterling',
    phone: '+1 650 555 4433',
    partySize: 2,
    ambienceZone: 'rooftop',
    status: 'waiting',
    estimatedWaitMinutes: 25,
    createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
  },
  {
    _id: 'wait_002',
    name: 'Genevieve Sinclair',
    phone: '+1 312 555 8800',
    partySize: 4,
    ambienceZone: 'piano',
    status: 'waiting',
    estimatedWaitMinutes: 15,
    createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
  }
];

// Rich datasets for Recharts waitlist & load analytics
const HOURLY_LOADS = [
  { hour: '12:00', occupancy: 40, avgWaitMinutes: 10 },
  { hour: '13:00', occupancy: 65, avgWaitMinutes: 20 },
  { hour: '14:00', occupancy: 50, avgWaitMinutes: 15 },
  { hour: '15:00', occupancy: 25, avgWaitMinutes: 5 },
  { hour: '16:00', occupancy: 20, avgWaitMinutes: 5 },
  { hour: '17:00', occupancy: 45, avgWaitMinutes: 10 },
  { hour: '18:00', occupancy: 75, avgWaitMinutes: 30 },
  { hour: '19:00', occupancy: 95, avgWaitMinutes: 50 },
  { hour: '20:00', occupancy: 100, avgWaitMinutes: 65 },
  { hour: '21:00', occupancy: 90, avgWaitMinutes: 45 },
  { hour: '22:00', occupancy: 60, avgWaitMinutes: 20 },
  { hour: '23:00', occupancy: 30, avgWaitMinutes: 10 }
];

const ZONE_POPULARITY = [
  { zone: 'rooftop', name: 'Starlight Rooftop', popularity: 95, currentWait: 35, avgDb: 52 },
  { zone: 'piano', name: 'Grand Piano Salon', popularity: 80, currentWait: 15, avgDb: 72 },
  { zone: 'hearth', name: 'Chef\'s Hearthside', popularity: 88, currentWait: 20, avgDb: 64 },
  { zone: 'terrace', name: 'Oceanview Terrace', popularity: 75, currentWait: 10, avgDb: 58 }
];

export const getWaitlist = async (req, res) => {
  try {
    let list = [];
    try {
      list = await Waitlist.find({ status: 'waiting' }).sort({ createdAt: 1 });
    } catch (e) {
      list = SIMULATED_WAITLIST.filter(w => w.status === 'waiting');
    }
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToWaitlist = async (req, res) => {
  const { name, phone, partySize, ambienceZone } = req.body;

  try {
    let estimatedWaitMinutes = 15;
    
    // Dynamically calculate waiting time based on active queue length
    let activeQueueLength = 0;
    try {
      activeQueueLength = await Waitlist.countDocuments({ status: 'waiting', ambienceZone });
    } catch (e) {
      activeQueueLength = SIMULATED_WAITLIST.filter(w => w.status === 'waiting' && w.ambienceZone === ambienceZone).length;
    }

    estimatedWaitMinutes = 10 + (activeQueueLength * 8);

    let waitItem = null;
    try {
      waitItem = await Waitlist.create({
        name,
        phone,
        partySize,
        ambienceZone,
        estimatedWaitMinutes
      });
    } catch (dbError) {
      const simulatedId = 'wait_' + Math.random().toString(36).substr(2, 9);
      waitItem = {
        _id: simulatedId,
        name,
        phone,
        partySize,
        ambienceZone,
        status: 'waiting',
        estimatedWaitMinutes,
        createdAt: new Date()
      };
      SIMULATED_WAITLIST.push(waitItem);
    }

    // Broadcast real-time waitlist update via Socket.io!
    const io = req.app.get('socketio');
    if (io) {
      io.emit('waitlistUpdated', { ambienceZone, action: 'add', item: waitItem });
    }

    res.status(201).json({ success: true, data: waitItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWaitlistStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'waiting', 'seated', 'cancelled'

  try {
    let updated = null;
    try {
      updated = await Waitlist.findByIdAndUpdate(id, { status }, { new: true });
    } catch (dbError) {
      const idx = SIMULATED_WAITLIST.findIndex(w => w._id === id);
      if (idx !== -1) {
        SIMULATED_WAITLIST[idx].status = status;
        updated = SIMULATED_WAITLIST[idx];
      }
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Queue item not found.' });
    }

    // Broadcast update via Socket.io!
    const io = req.app.get('socketio');
    if (io) {
      io.emit('waitlistUpdated', { ambienceZone: updated.ambienceZone, action: 'statusChanged', item: updated });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWaitlistAnalytics = async (req, res) => {
  try {
    let currentWaitingCount = 0;
    try {
      currentWaitingCount = await Waitlist.countDocuments({ status: 'waiting' });
    } catch (e) {
      currentWaitingCount = SIMULATED_WAITLIST.filter(w => w.status === 'waiting').length;
    }

    const responseData = {
      currentWaitingCount,
      hourlyLoads: HOURLY_LOADS,
      zonePopularity: ZONE_POPULARITY,
      smartRecommendations: [
        'Starlight Rooftop is currently at peak capacity. Wait times average 35 minutes.',
        'Grand Piano Salon features immediate availability at Table 12, with a 12% noise drop compared to earlier hours.',
        'Peak service is expected between 19:30 and 21:00. Seating before 18:30 features near-zero waiting durations.'
      ]
    };

    res.json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
