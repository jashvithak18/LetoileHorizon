// Pre-seeded dishes for AI matching fallback
const LOCAL_AI_DISHES = [
  {
    name: 'Deconstructed Butter Paneer Tikka',
    description: 'Liquid-nitrogen smoked cottage cheese spheres floating in cardamom butter gravy reduction and saffron dust.',
    calories: 280,
    spiceLevel: 1,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    ingredients: ['Cottage Cheese Spheres', 'Cardamom Butter Gravy', 'Saffron Dust'],
    pairings: ['Masala Chai Infusion', 'Imperial Oolong Elixir'],
    mood: 'Elegant Festive',
    matchScore: 10
  },
  {
    name: 'Hyperbaric Butter Chicken Capsule',
    description: 'Tender tandoori chicken chunks glazed in slow-cooked tomato cashew cream gravy, encapsulated in organic wheat shell.',
    calories: 590,
    spiceLevel: 2,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    ingredients: ['Tandoori Chicken', 'Cashew Cream Tomato Gravy', 'Cashew Cream'],
    pairings: ['Puligny-Montrachet Chardonnay', 'Nebula Citrus Elixir'],
    mood: 'Cinematic Rainy',
    matchScore: 10
  },
  {
    name: 'Saffron Masala Dosa Caviar',
    description: 'Crisp golden rice crepe cylinder served with spherified mustard seed sambhar caviar and coconut foam.',
    calories: 340,
    spiceLevel: 2,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    ingredients: ['Golden Rice Crepe', 'Sambhar Caviar', 'Coconut Foam'],
    pairings: ['Nebula Citrus Elixir', 'Cold Brew Saffron Infusion'],
    mood: 'Sunrise Elegance',
    matchScore: 10
  },
  {
    name: 'Tandoori Broccoli Nitro Florets',
    description: 'Liquid-nitrogen cooled tandoori spiced broccoli florets, served with mint coriander gel and edible gold foil.',
    calories: 150,
    spiceLevel: 1,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    ingredients: ['Broccoli Florets', 'Tandoori Spices', 'Mint Coriander Gel'],
    pairings: ['Aged Junmai Daiginjo Sake', 'Roasted Barley Tea'],
    mood: 'Cozy Rainy Lounge',
    matchScore: 10
  },
  {
    name: 'Subzero Cardamom Kulfi Sphere',
    description: 'Flash-frozen subzero cardamom kulfi spheres, served on edible silver leaf sheets and rose hydrosol mist.',
    calories: 180,
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    ingredients: ['Cardamom Milk', 'Rose Mist', 'Edible Silver Leaf'],
    pairings: ['Moscato d\'Asti', 'White Tea Bud Brew'],
    mood: 'Morning Delight',
    matchScore: 10
  },
  {
    name: 'Luminescent Mango Lassi Caviar',
    description: 'Luminescent spherified mango nectar pearls floating on a sweet chilled yogurt base with pistachio crumbles.',
    calories: 120,
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    ingredients: ['Mango Nectar Pearls', 'Sweet Yogurt Chilled', 'Pistachio Crumble'],
    pairings: ['Deconstructed Butter Paneer Tikka', 'Masala Chai Infusion'],
    mood: 'Zen Sunrise',
    matchScore: 10
  }
];

export const getAiRecommendation = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ success: false, message: 'Your culinary desires must be voiced.' });
  }

  const query = prompt.toLowerCase();
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBIHlfk6a_isHIN4caGKY5mQ76Mp5FAmvk';

  if (apiKey) {
    try {
      console.log('🌌 Calling Google Gemini 2.5 Flash model for structured culinary content...');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are the AI Head Sommelier & Gastronomer at the ultra-premium futuristic restaurant L'Étoile Horizon.
                    Analyze the user prompt: "${query}" and suggest the most matching gourmet dishes from our menu catalog.
                    Select from these items:
                    - Deconstructed Butter Paneer Tikka (₹650, tasting, 280 cal, spice 1, veg, elegant)
                    - Saffron Masala Dosa Caviar (₹850, entree, 340 cal, spice 2, golden crepe cylinder, sambhar caviar, morning/evening)
                    - Hyperbaric Butter Chicken Capsule (₹1100, entree, 590 cal, spice 2, rich butter chicken in wheat shell, evening/rainy)
                    - Tandoori Broccoli Nitro Florets (₹580, entree, 150 cal, spice 1, tandoori spiced veg, rainy/evening)
                    - Subzero Cardamom Kulfi Sphere (₹350, dessert, 180 cal, spice 0, nitrogen cardamom, veg, festive)
                    - Luminescent Mango Lassi Caviar (₹220, beverage, 120 cal, spice 0, spherified mango pearls, veg, morning/rainy)`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  response: {
                    type: 'STRING',
                    description: 'A poetic, highly luxurious, mouth-watering introduction suggesting the dishes and why they fit the user request.'
                  },
                  recommendations: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        name: { type: 'STRING' },
                        description: { type: 'STRING' },
                        calories: { type: 'INTEGER' },
                        spiceLevel: { type: 'INTEGER' },
                        isVegetarian: { type: 'BOOLEAN' },
                        ingredients: { type: 'ARRAY', items: { type: 'STRING' } },
                        pairings: { type: 'ARRAY', items: { type: 'STRING' } },
                        mood: { type: 'STRING' }
                      },
                      required: ['name', 'description', 'calories', 'spiceLevel', 'isVegetarian', 'ingredients', 'pairings', 'mood']
                    }
                  }
                },
                required: ['response', 'recommendations']
              }
            }
          })
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const textResult = data.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(textResult);
        return res.json({ success: true, data: parsedJson });
      } else {
        console.warn('Gemini response format error. Engaging local simulation fallback.');
      }
    } catch (geminiError) {
      console.warn('Gemini invocation error:', geminiError.message);
    }
  }

  // Bespoke Local Luxury Gastrobot Engine (Resilient offline fallback)
  try {
    let matchedDishes = [...LOCAL_AI_DISHES];
    let introResponse = '';

    if (query.includes('spicy') || query.includes('heat') || query.includes('szechuan') || query.includes('hot')) {
      matchedDishes = LOCAL_AI_DISHES.filter(d => d.spiceLevel > 0);
      introResponse = 'For your palate that craves sophisticated warmth, our Chef recommends an exquisite journey defined by aromatic spice and balanced fires.';
    } else if (query.includes('veg') || query.includes('plant') || query.includes('meatless') || query.includes('greens')) {
      matchedDishes = LOCAL_AI_DISHES.filter(d => d.isVegetarian);
      introResponse = 'An ode to nature’s pristine offerings. Discover our handcrafted plant-focused masterpieces designed to deliver clean, intense flavors.';
    } else if (query.includes('coffee') || query.includes('drink') || query.includes('sip') || query.includes('brew') || query.includes('hydrosol')) {
      matchedDishes = LOCAL_AI_DISHES.filter(d => d.name.includes('Lassi') || d.name.includes('Tikka'));
      introResponse = 'Elevate your senses. Here is our curated selection of liquid infusions and micro-spherifications designed to complement premium roasts and cold brews.';
    } else if (query.includes('calories') || query.includes('light') || query.includes('low') || query.includes('diet') || query.includes('300') || query.includes('500')) {
      matchedDishes = LOCAL_AI_DISHES.filter(d => d.calories < 400);
      introResponse = 'A light, ethereal selection crafted with molecular precision. Absolute luxury without heaviness, capturing clean culinary structures.';
    } else if (query.includes('sweet') || query.includes('dessert') || query.includes('berry') || query.includes('sorbet') || query.includes('kulfi')) {
      matchedDishes = LOCAL_AI_DISHES.filter(d => d.name.includes('Kulfi') || d.name.includes('Lassi'));
      introResponse = 'Indulge in sweet sub-zero artistry, where temperature meets sugar in beautiful gaseous clouds of liquid nitrogen.';
    } else {
      matchedDishes = [LOCAL_AI_DISHES[0], LOCAL_AI_DISHES[1], LOCAL_AI_DISHES[4]];
      introResponse = 'Welcome to L\'Étoile Horizon. I have composed a premium tasting sequence representing the absolute pinnacle of our current molecular gastronomy collection.';
    }

    res.json({
      success: true,
      data: {
        response: introResponse,
        recommendations: matchedDishes.slice(0, 3)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'The AI Sommelier is currently deep in contemplation.' });
  }
};
