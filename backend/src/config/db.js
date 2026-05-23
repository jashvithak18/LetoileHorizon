import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_horizon');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('⚠️ MongoDB is not active or reachable. Operating L\'Étoile Horizon in premium offline simulation mode (in-memory caching). Fully functional database simulations will engage.');
    return false;
  }
};
