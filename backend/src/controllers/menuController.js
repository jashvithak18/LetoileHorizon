import MenuItem from '../models/MenuItem.js';

// Pre-seeded ultra-premium molecular gastronomy dishes
let SIMULATED_MENU = [
  {
    _id: 'menu_item_001',
    name: 'Luminescent Truffle Sphere',
    description: 'A liquid-spherified black winter truffle essence, encased in a glowing isomalt veil and dusted with 24k gold leaf particles.',
    price: 75,
    category: 'tasting',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    calories: 120,
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    ingredients: ['Black Winter Truffle', 'Isomalt Shell', 'Gold Leaf Dust', 'Porcini Essence'],
    pairings: ['Château d\'Yquem 2015', 'Veuve Clicquot Champagne'],
    moodTags: ['evening', 'festive']
  },
  {
    _id: 'menu_item_002',
    name: 'Saffron Solar Cod',
    description: 'Sous-vide glacier cod bathed in warm saffron-infused seaweed butter, served alongside solar-dried sea parsley tuiles and citrus foam.',
    price: 95,
    category: 'entree',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    calories: 420,
    spiceLevel: 1,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    ingredients: ['Glacier Cod', 'Saffron Seaweed Butter', 'Sea Parsley Tuile', 'Blood Orange Foam'],
    pairings: ['Puligny-Montrachet Chardonnay', 'Cold Brew Saffron Infusion'],
    moodTags: ['evening', 'morning']
  },
  {
    _id: 'menu_item_003',
    name: 'Hyperbaric Szechuan Duck',
    description: 'High-pressure tenderized dry-aged duck breast, glazed with Szechuan plum reductions and rosemary smoke, served with puffed crisp wild rice.',
    price: 110,
    category: 'entree',
    image: 'https://images.unsplash.com/photo-1514944224746-6bba5b09e5c2?auto=format&fit=crop&w=800&q=80',
    calories: 680,
    spiceLevel: 3,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    ingredients: ['Dry-Aged Duck', 'Szechuan Plum Glaze', 'Rosemary Smoke', 'Wild Rice'],
    pairings: ['Napa Valley Cabernet Sauvignon', 'Imperial Oolong Elixir'],
    moodTags: ['evening', 'rainy']
  },
  {
    _id: 'menu_item_004',
    name: 'Subzero Nebula Sorbet',
    description: 'Flash-frozen liquid nitrogen sorbet made from wild Alpine berries, floating on a sweet champagne mist and rose petal smoke.',
    price: 40,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
    calories: 180,
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    ingredients: ['Alpine Berries', 'Liquid Nitrogen', 'Rose Petals', 'Vintage Champagne Mist'],
    pairings: ['Moscato d\'Asti', 'White Tea Bud Brew'],
    moodTags: ['morning', 'festive', 'rainy']
  },
  {
    _id: 'menu_item_005',
    name: 'Raindrop Rose Nectar',
    description: 'A completely transparent spherical drop of agar flower nectar, sweetened with elderberry drops and carbonated rose hydrosol.',
    price: 25,
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80',
    calories: 45,
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    ingredients: ['Agar-Agar Rose Hydro', 'Elderberry Drop', 'Mint Leaf Sparkle'],
    pairings: ['Luminescent Truffle Sphere', 'Macadamia Crisp'],
    moodTags: ['morning', 'rainy']
  },
  {
    _id: 'menu_item_006',
    name: 'Volcanic Soba Nest',
    description: 'Hand-pulled buckwheat noodles over a heated volcanic stone, served with hot matcha broth, wild forest chanterelles, and crispy Szechuan chili shreds.',
    price: 65,
    category: 'entree',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    calories: 380,
    spiceLevel: 2,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    ingredients: ['Buckwheat Soba', 'Matcha Dashi', 'Forest Chanterelles', 'Szechuan Chili Thread'],
    pairings: ['Aged Junmai Daiginjo Sake', 'Roasted Barley Tea'],
    moodTags: ['rainy', 'evening']
  }
];

export const getMenuItems = async (req, res) => {
  try {
    let items = [];
    try {
      items = await MenuItem.find({});
      if (items.length === 0) {
        // If DB is empty, seed it with SIMULATED_MENU for convenience!
        await MenuItem.insertMany(SIMULATED_MENU);
        items = await MenuItem.find({});
      }
    } catch (dbError) {
      items = SIMULATED_MENU;
    }
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMenuItemById = async (req, res) => {
  const { id } = req.params;
  try {
    let item = null;
    try {
      item = await MenuItem.findById(id);
    } catch (e) {
      item = SIMULATED_MENU.find(i => i._id === id);
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Dishes of such caliber could not be found.' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMenuItem = async (req, res) => {
  const dishData = req.body;
  try {
    let newItem = null;
    try {
      newItem = await MenuItem.create(dishData);
    } catch (dbError) {
      const simulatedId = 'menu_item_' + Math.random().toString(36).substr(2, 9);
      newItem = {
        _id: simulatedId,
        ...dishData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      SIMULATED_MENU.push(newItem);
    }
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const dishData = req.body;
  try {
    let updatedItem = null;
    try {
      updatedItem = await MenuItem.findByIdAndUpdate(id, dishData, { new: true });
    } catch (dbError) {
      const idx = SIMULATED_MENU.findIndex(i => i._id === id);
      if (idx !== -1) {
        SIMULATED_MENU[idx] = { ...SIMULATED_MENU[idx], ...dishData, updatedAt: new Date() };
        updatedItem = SIMULATED_MENU[idx];
      }
    }

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Target gourmet dish could not be located.' });
    }
    res.json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    let deleted = false;
    try {
      const result = await MenuItem.findByIdAndDelete(id);
      if (result) deleted = true;
    } catch (dbError) {
      const idx = SIMULATED_MENU.findIndex(i => i._id === id);
      if (idx !== -1) {
        SIMULATED_MENU.splice(idx, 1);
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Dishes of this specification did not exist.' });
    }
    res.json({ success: true, message: 'Culinary masterpiece successfully removed from the active catalog.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
