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

  if (apiKey && apiKey !== 'AIzaSyBIHlfk6a_isHIN4caGKY5mQ76Mp5FAmvk') {
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
        if (data.error && data.error.message) {
          console.warn(`⚠️ Gemini API error [${data.error.code}]: ${data.error.message}`);
        } else {
          console.warn('Gemini response format error. Engaging local simulation fallback.');
        }
      }
    } catch (geminiError) {
      console.warn('Gemini invocation error:', geminiError.message);
    }
  } else {
    console.log('💡 Note: Default leaked Gemini API Key detected. Using local high-fidelity Gastronomer AI Engine. Provide a new GEMINI_API_KEY in backend/.env to unlock cloud-powered LLM generation.');
  }

  // Bespoke Local Dynamic Luxury Gastrobot Engine (Advanced Semantic Fallback)
  try {
    // 1. Detect tokens & preferences
    const isVeg = query.includes('veg') || query.includes('plant') || query.includes('paneer') || query.includes('broccoli') || query.includes('dosa') || query.includes('kulfi') || query.includes('lassi');
    const isNonVeg = query.includes('chicken') || query.includes('non-veg') || query.includes('meat') || query.includes('poultry') || query.includes('butter chicken');
    const isSpicy = query.includes('spicy') || query.includes('heat') || query.includes('hot') || query.includes('chili') || query.includes('pepper') || query.includes('warmth') || query.includes('tikka');
    const isSweet = query.includes('sweet') || query.includes('dessert') || query.includes('sugar') || query.includes('kulfi') || query.includes('lassi') || query.includes('mango');
    const isLight = query.includes('light') || query.includes('diet') || query.includes('low') || query.includes('calorie') || query.includes('calories') || query.includes('healthy') || query.includes('broccoli');
    const isDrink = query.includes('drink') || query.includes('sip') || query.includes('brew') || query.includes('lassi') || query.includes('coffee') || query.includes('tea') || query.includes('beverage');

    // 2. Detect atmosphere mood
    let detectedMood = 'evening';
    if (query.includes('rain') || query.includes('storm') || query.includes('cozy') || query.includes('cloudy') || query.includes('thunder')) {
      detectedMood = 'rainy';
    } else if (query.includes('morning') || query.includes('breakfast') || query.includes('sunrise') || query.includes('day') || query.includes('lunch')) {
      detectedMood = 'morning';
    } else if (query.includes('celebrate') || query.includes('festive') || query.includes('party') || query.includes('birthday') || query.includes('anniversary') || query.includes('fun')) {
      detectedMood = 'festive';
    } else if (query.includes('romantic') || query.includes('date') || query.includes('love') || query.includes('couple') || query.includes('girlfriend') || query.includes('boyfriend')) {
      detectedMood = 'romantic';
    }

    // 3. Poetic sentence mapping
    const greetings = [
      "Welcome to the sensory realms of L'Étoile Horizon.",
      "Greetings, honored diner. I have tuned our culinary frequencies to your request.",
      "Salutations from the molecular cellar. I have successfully decoded your flavor coordinates.",
      "Palate authorization verified. Our kitchen registers your precise gastronomic desire."
    ];
    
    const moodSentences = {
      rainy: "As warm rain glides past our starlight domes, our kitchen focuses on comforting, earth-grounding heat beds and smoky layers.",
      morning: "Under the golden glow of a new celestial cycle, we emphasize bright, high-frequency hydration and airy structures.",
      festive: "In celebration of your magnificent cosmic milestone, we have crafted a sequence of theatrical, gold-dusted, smoke-veiled textures.",
      romantic: "To celebrate the intimate chemistry of your evening, we suggest a delicate progression of sensory, melt-in-mouth creations.",
      evening: "As night descends over our New Delhi tower, we invite you to experience deep, rich dashi reductions and visual molecular art."
    };

    const prefSentences = [];
    if (isVeg) {
      prefSentences.push("Celebrating pristine vegetarian agriculture, we showcase deconstructed greens, hand-spun paneer, and crisp dosa crepes.");
    }
    if (isNonVeg) {
      prefSentences.push("For your non-vegetarian preference, we feature high-pressure tenderized cuts and rich cashew-infused chicken reductions.");
    }
    if (isSpicy) {
      prefSentences.push("We have calibrated our capsaicin fire levels to deliver an aromatic, sophisticated warmth that dances on the tongue.");
    }
    if (isSweet) {
      prefSentences.push("To satisfy your desire for delicate sweetness, we offer liquid nitrogen-cooled kulfi and mango-spherified nectars.");
    }
    if (isLight) {
      prefSentences.push("Focusing on light molecular alignment, this sequence delivers absolute aesthetic luxury under a clean energy budget.");
    }
    if (isDrink) {
      prefSentences.push("We have curated exquisite paired infusions, matching high-frequency barley drafts and mango lassi pearls.");
    }

    const closings = [
      "Discover below the perfect tasting path composed specifically for your palate.",
      "Explore these masterworks, each fully loaded in your Plate Architect coordinates.",
      "Here is your tailored molecular sequence. Load any dish below to begin.",
      "Chef Marcus Vance has calibrated the following selections to match your vibration."
    ];

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    const moodText = moodSentences[detectedMood] || moodSentences.evening;
    const prefText = prefSentences.length > 0 ? prefSentences.join(" ") : "We have curated a balanced sequence of textures, smoke, and liquid spheres.";
    const closing = closings[Math.floor(Math.random() * closings.length)];

    const introResponse = `${greeting} ${moodText} ${prefText} ${closing}`;

    // 4. Score and sort dishes
    const scoredDishes = LOCAL_AI_DISHES.map(dish => {
      let score = 0;
      const nameLower = dish.name.toLowerCase();
      const descLower = dish.description.toLowerCase();

      // Keyword matches in name or description
      if (query.includes(nameLower) || nameLower.includes(query)) score += 20;
      dish.ingredients.forEach(ing => {
        if (query.includes(ing.toLowerCase())) score += 8;
      });

      // Dietary matching
      if (isVeg && dish.isVegetarian) score += 10;
      if (isNonVeg && !dish.isVegetarian) score += 12;

      // Flavor & category matching
      if (isSpicy && dish.spiceLevel > 0) score += dish.spiceLevel * 5;
      if (isSpicy && dish.spiceLevel === 0) score -= 5;

      if (isSweet && dish.category === 'dessert') score += 15;
      if (isSweet && dish.category === 'beverage') score += 8;

      if (isLight && dish.calories < 200) score += 10;
      if (isLight && dish.calories >= 400) score -= 8;

      if (isDrink && dish.category === 'beverage') score += 20;

      // Mood matching
      if (detectedMood === 'rainy' && dish.mood === 'Cinematic Rainy') score += 6;
      if (detectedMood === 'morning' && dish.mood === 'Zen Sunrise') score += 6;
      if (detectedMood === 'festive' && dish.mood === 'Elegant Festive') score += 6;

      return { ...dish, score };
    });

    // Sort descending by score, take top 3
    const matchedDishes = scoredDishes
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ score, ...rest }) => rest);

    res.json({
      success: true,
      data: {
        response: introResponse,
        recommendations: matchedDishes
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'The AI Sommelier is currently deep in contemplation.' });
  }
};
