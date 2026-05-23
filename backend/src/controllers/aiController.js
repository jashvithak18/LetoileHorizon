// Pre-seeded dishes for AI matching fallback
const LOCAL_AI_DISHES = [
  {
    name: 'Luminescent Truffle Sphere',
    description: 'A liquid-spherified black winter truffle essence, encased in a glowing isomalt veil and dusted with shimmering saffron pollen threads.',
    calories: 120,
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    ingredients: ['Black Winter Truffle', 'Isomalt Shell', 'Saffron Shimmer'],
    pairings: ['Château d\'Yquem 2015', 'Veuve Clicquot Champagne'],
    mood: 'Elegant Festive',
    matchScore: 10
  },
  {
    name: 'Hyperbaric Szechuan Duck',
    description: 'High-pressure tenderized dry-aged duck breast, glazed with Szechuan plum reductions and rosemary smoke, served with puffed crisp wild rice.',
    calories: 680,
    spiceLevel: 3,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    ingredients: ['Dry-Aged Duck', 'Szechuan Plum Glaze', 'Rosemary Smoke'],
    pairings: ['Napa Valley Cabernet Sauvignon', 'Imperial Oolong Elixir'],
    mood: 'Cinematic Rainy',
    matchScore: 10
  },
  {
    name: 'Saffron Solar Cod',
    description: 'Sous-vide glacier cod bathed in warm saffron-infused seaweed butter, served alongside solar-dried sea parsley tuiles and citrus foam.',
    calories: 420,
    spiceLevel: 1,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    ingredients: ['Glacier Cod', 'Saffron Seaweed Butter', 'Citrus Foam'],
    pairings: ['Puligny-Montrachet Chardonnay', 'Cold Brew Saffron Infusion'],
    mood: 'Sunrise Elegance',
    matchScore: 10
  },
  {
    name: 'Volcanic Soba Nest',
    description: 'Hand-pulled buckwheat noodles over a heated volcanic stone, served with hot matcha broth, wild forest chanterelles, and crispy Szechuan chili shreds.',
    calories: 380,
    spiceLevel: 2,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    ingredients: ['Buckwheat Soba', 'Matcha Dashi', 'Forest Chanterelles', 'Szechuan Chili'],
    pairings: ['Aged Junmai Daiginjo Sake', 'Roasted Barley Tea'],
    mood: 'Cozy Rainy Lounge',
    matchScore: 10
  },
  {
    name: 'Subzero Nebula Sorbet',
    description: 'Flash-frozen liquid nitrogen sorbet made from wild Alpine berries, floating on a sweet champagne mist and rose petal smoke.',
    calories: 180,
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    ingredients: ['Alpine Berries', 'Liquid Nitrogen', 'Rose Petals'],
    pairings: ['Moscato d\'Asti', 'White Tea Bud Brew'],
    mood: 'Morning Delight',
    matchScore: 10
  },
  {
    name: 'Raindrop Rose Nectar',
    description: 'A completely transparent spherical drop of agar flower nectar, sweetened with elderberry drops and carbonated rose hydrosol.',
    calories: 45,
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    ingredients: ['Agar-Agar Rose Hydro', 'Elderberry Drop', 'Mint Sparkle'],
    pairings: ['Luminescent Truffle Sphere', 'White Tea'],
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
                    - Luminescent Truffle Sphere ($75, tasting, 120 cal, spice 0, veg, elegant)
                    - Saffron Solar Cod ($95, entree, 420 cal, spice 1, premium fish, morning/evening)
                    - Hyperbaric Szechuan Duck ($110, entree, 680 cal, spice 3, rich, spicy, evening/rainy)
                    - Volcanic Soba Nest ($65, entree, 380 cal, spice 2, buckwheat, veg, vegan, rainy/evening)
                    - Subzero Nebula Sorbet ($40, dessert, 180 cal, spice 0, nitrogen berries, veg, vegan, festive)
                    - Raindrop Rose Nectar ($25, beverage, 45 cal, spice 0, agar drops, veg, vegan, morning/rainy)`
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
      matchedDishes = LOCAL_AI_DISHES.filter(d => d.name.includes('Nectar') || d.name.includes('Sphere'));
      introResponse = 'Elevate your senses. Here is our curated selection of liquid infusions and micro-spherifications designed to complement premium roasts and cold brews.';
    } else if (query.includes('calories') || query.includes('light') || query.includes('low') || query.includes('diet') || query.includes('300') || query.includes('500')) {
      matchedDishes = LOCAL_AI_DISHES.filter(d => d.calories < 400);
      introResponse = 'A light, ethereal selection crafted with molecular precision. Absolute luxury without heaviness, capturing clean culinary structures.';
    } else if (query.includes('sweet') || query.includes('dessert') || query.includes('berry') || query.includes('sorbet')) {
      matchedDishes = LOCAL_AI_DISHES.filter(d => d.name.includes('Sorbet') || d.name.includes('Nectar'));
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
