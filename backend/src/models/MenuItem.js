import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['tasting', 'entree', 'dessert', 'beverage', 'appetizer'], required: true },
  image: { type: String, default: '' },
  calories: { type: Number, default: 0 },
  spiceLevel: { type: Number, default: 0 }, // 0 to 3
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  isGlutenFree: { type: Boolean, default: false },
  ingredients: [{ type: String }],
  pairings: [{ type: String }],
  moodTags: [{ type: String }], // e.g. ["morning", "evening", "rainy", "festive"]
}, { timestamps: true });

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
