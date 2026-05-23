import Reservation from '../models/Reservation.js';

// Pre-seeded reservations database for simulation mode
let SIMULATED_RESERVATIONS = [
  {
    _id: 'res_001',
    name: 'Seraphina Sterling',
    email: 'seraphina@luxe.com',
    phone: '+1 415 555 8899',
    date: '2026-05-23',
    time: '20:00',
    guests: 2,
    tableId: 'R1',
    ambienceZone: 'rooftop',
    notes: 'Anniversary seating requested',
    status: 'confirmed'
  },
  {
    _id: 'res_002',
    name: 'Aurelia Vance',
    email: 'aurelia@luxe.com',
    phone: '+1 212 555 0011',
    date: '2026-05-23',
    time: '19:30',
    guests: 4,
    tableId: 'P2',
    ambienceZone: 'piano',
    notes: 'Near the piano performance',
    status: 'confirmed'
  }
];

export const getReservations = async (req, res) => {
  try {
    let bookings = [];
    try {
      if (req.user.role === 'admin') {
        bookings = await Reservation.find({}).populate('user', 'name email');
      } else {
        bookings = await Reservation.find({ user: req.user._id });
      }
    } catch (e) {
      if (req.user.role === 'admin') {
        bookings = SIMULATED_RESERVATIONS;
      } else {
        bookings = SIMULATED_RESERVATIONS.filter(r => r.email === req.user.email);
      }
    }
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReservation = async (req, res) => {
  const { name, email, phone, date, time, guests, tableId, ambienceZone, notes } = req.body;

  try {
    let booking = null;
    try {
      const isSimUser = req.user._id === 'simulated_admin_id_007' || String(req.user._id).startsWith('sim_');
      booking = await Reservation.create({
        user: isSimUser ? null : req.user._id,
        name,
        email,
        phone,
        date,
        time,
        guests,
        tableId,
        ambienceZone,
        notes,
        status: 'confirmed'
      });
    } catch (dbError) {
      // Simulate creation
      const simulatedId = 'res_' + Math.random().toString(36).substr(2, 9);
      booking = {
        _id: simulatedId,
        user: req.user._id,
        name,
        email,
        phone,
        date,
        time,
        guests,
        tableId,
        ambienceZone,
        notes,
        status: 'confirmed',
        createdAt: new Date()
      };
      SIMULATED_RESERVATIONS.push(booking);
    }

    // Emit Socket.io update to refresh floorplan in real time!
    const io = req.app.get('socketio');
    if (io) {
      io.emit('tableStatusChanged', {
        tableId,
        ambienceZone,
        status: 'reserved',
        booking: { name, guests, time, date }
      });
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReservationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'pending', 'confirmed', 'cancelled', 'completed'

  try {
    let updated = null;
    try {
      updated = await Reservation.findByIdAndUpdate(id, { status }, { new: true });
    } catch (dbError) {
      const idx = SIMULATED_RESERVATIONS.findIndex(r => r._id === id);
      if (idx !== -1) {
        SIMULATED_RESERVATIONS[idx].status = status;
        updated = SIMULATED_RESERVATIONS[idx];
      }
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    // If reservation status is cancelled or completed, release table via Socket.io!
    const io = req.app.get('socketio');
    if (io && (status === 'cancelled' || status === 'completed')) {
      io.emit('tableStatusChanged', {
        tableId: updated.tableId,
        ambienceZone: updated.ambienceZone,
        status: 'available'
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
