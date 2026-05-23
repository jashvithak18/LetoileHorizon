import MenuItem from '../models/MenuItem.js';

// Pre-seeded ultra-premium molecular gastronomy dishes
let SIMULATED_MENU = [
  {
    _id: 'menu_item_001',
    name: 'Deconstructed Butter Paneer Tikka',
    description: 'Liquid-nitrogen smoked cottage cheese spheres floating in cardamom butter gravy reduction and saffron dust.',
    price: 650,
    category: 'tasting',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    calories: 280,
    spiceLevel: 1,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    ingredients: ['Cottage Cheese Spheres', 'Cardamom Butter Gravy', 'Saffron Dust'],
    pairings: ['Masala Chai Infusion', 'Imperial Oolong Elixir'],
    moodTags: ['evening', 'festive']
  },
  {
    _id: 'menu_item_002',
    name: 'Saffron Masala Dosa Caviar',
    description: 'Crisp golden rice crepe cylinder served with spherified mustard seed sambhar caviar and coconut foam.',
    price: 850,
    category: 'entree',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    calories: 340,
    spiceLevel: 2,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    ingredients: ['Golden Rice Crepe', 'Sambhar Caviar', 'Coconut Foam'],
    pairings: ['Nebula Citrus Elixir', 'Cold Brew Saffron Infusion'],
    moodTags: ['evening', 'morning']
  },
  {
    _id: 'menu_item_003',
    name: 'Hyperbaric Butter Chicken Capsule',
    description: 'Tender tandoori chicken chunks glazed in slow-cooked tomato cashew cream gravy, encapsulated in organic wheat shell.',
    price: 1100,
    category: 'entree',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    calories: 590,
    spiceLevel: 2,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    ingredients: ['Tandoori Chicken', 'Cashew Cream Tomato Gravy', 'Cashew Cream'],
    pairings: ['Puligny-Montrachet Chardonnay', 'Nebula Citrus Elixir'],
    moodTags: ['evening', 'rainy']
  },
  {
    _id: 'menu_item_004',
    name: 'Subzero Cardamom Kulfi Sphere',
    description: 'Flash-frozen subzero cardamom kulfi spheres, served on edible silver leaf sheets and rose hydrosol mist.',
    price: 450,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
    calories: 180,
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    ingredients: ['Cardamom Milk', 'Rose Mist', 'Edible Silver Leaf'],
    pairings: ['Moscato d\'Asti', 'White Tea Bud Brew'],
    moodTags: ['morning', 'festive', 'rainy']
  },
  {
    _id: 'menu_item_005',
    name: 'Luminescent Mango Lassi Caviar',
    description: 'Luminescent spherified mango nectar pearls floating on a sweet chilled yogurt base with pistachio crumbles.',
    price: 350,
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
    calories: 120,
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    ingredients: ['Mango Nectar Pearls', 'Sweet Yogurt Chilled', 'Pistachio Crumble'],
    pairings: ['Deconstructed Butter Paneer Tikka', 'Masala Chai Infusion'],
    moodTags: ['morning', 'rainy']
  },
  {
    _id: 'menu_item_006',
    name: 'Tandoori Broccoli Nitro Florets',
    description: 'Liquid-nitrogen cooled tandoori spiced broccoli florets, served with mint coriander gel and edible gold foil.',
    price: 550,
    category: 'entree',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    calories: 150,
    spiceLevel: 1,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    ingredients: ['Broccoli Florets', 'Tandoori Spices', 'Mint Coriander Gel'],
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
