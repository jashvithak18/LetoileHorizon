# L'ÉTOILE HORIZON ✧ ✧ ✧
### Immersive Molecular Gastronomy & Futuristic Fine-Dining platform (React + Vite SPA)

**L'Étoile Horizon** is a world-class, ultra-premium digital dining experience designed for globally recognized Michelin-starred fine-dining brands. Built on a production-ready MERN architecture (**React + Vite SPA**, Express.js, MongoDB, Socket.io, Zustand, Framer Motion, GSAP, and Recharts), the application visualizes gastronomy as art by aligning plates with local solar and ambient weather rhythms.

---

## 🌌 Technical Architecture

The platform utilizes a highly decoupled, concurrent workspace architecture:

```
RestaurantDemo/
├── backend/            # Express.js API, MongoDB Mongoose, OpenAI somatic hooks, Socket.io
├── frontend/           # React + Vite SPA, Tailwind CSS v4, Zustand, Framer Motion, Recharts
├── .gitignore          # Root security filter (ignores node_modules, build paths, .env)
└── README.md           # Master repository documentation (this file)
└── package.json        # Workspace orchestrator (runs both layers concurrently)
```

---

## ✨ Outstanding Premium Features

1. **🌅 Dynamic Mood-Based UI**:
   The website shifts visual states fluidly between four HSL tailored color schemes:
   - **Obsidian Evening (Default)**: Luxe midnight blacks, burnished gold accents, floating canvas gold embers.
   - **Morning Sunrise**: Pure linen creams, sunrise ambers, solar-particle canvas glows.
   - **Rainy Cozy Lounge**: Slate grays, deep charcoals, falling canvas blue rain streaks.
   - **Royal Festive Night**: Deep burgundy reds, velvet crimsons, champagne gold sparkles.

2. **Compass Sommelier Chat Drawer (`AiSommelier.jsx`)**:
   Slide-out conversational drawer integrating OpenAI's model (`gpt-4o-mini`). Suggests culinary creations, pairing suggestions, and calorie/spice metrics.

3. **Live Floor Seating Synchronization (`FloorPlan.jsx`)**:
   Interactive, vector-drawn SVG restaurant seating map tracking Rooftop domes, the Piano Salon, Hearthside fires, and Oceanview Terraces. Booking a seat immediately syncs states across all active client browsers via Socket.io.

4. **Custom Plate Designer (`PlateBuilder.jsx`)**:
   Interact with molecular toppings (*24k Gold leaf dust, Smoked truffle foam, Saffron tuiles*) and watch them drop onto the presentation dish with high-fidelity spring animations, instantly calculating total price and calories.

5. **Queue Heatmaps (`WaitlistHeatmap.jsx`)**:
   Visual Recharts dashboard showing hourly restaurant traffic, noise dB spikes, and estimated virtual queue times for walk-in parties.

6. **Admin Command Terminal (`AdminTerminal.jsx`)**:
   Unlock management controls to view, approve, and complete bookings, release occupied tables, seat walk-ins, and commit brand new molecular dishes to the menu with complex parameters.

---

## 🛠️ Resiliency and Hybrid Playability (Local Dev-Ready)

To ensure this app runs flawlessly on any machine instantly:
- **Resilient MongoDB layer**: The backend automatically looks for MongoDB on `localhost:27017` or connects to your custom cluster. If MongoDB is inactive or not installed, the platform seamlessly activates a clean, transient **in-memory simulation database** so registration, booking, and menu changes remain fully active.
- **AI Sommelier Fallback**: If `OPENAI_API_KEY` is omitted from configurations, a high-fidelity local rules-based simulation parses keywords (e.g. *spicy*, *veg*, *low calories*) and renders realistic culinary card structures with ultra-fast animations.

---

## 🚀 Step-by-Step Local Launch

1. **Clone & Setup**:
   Ensure you have [Node.js](https://nodejs.org) installed. In the root workspace directory, run:
   ```bash
   # Installs root workspace, Vite React, and backend dependencies
   npm run install-all
   ```

2. **Configure (Optional)**:
   Add your OpenAI API credentials or Cloudinary tags inside `backend/.env`. If omitted, the simulated fallbacks will run automatically.

3. **Launch Dev Environment**:
   ```bash
   # Boots Vite React (port 5173) and the API server (port 5000) concurrently
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Review Admin Panel**:
   - Navigation: Click "Accréditation" on the navbar.
   - Email Credentials: `admin@letoile.com`
   - Password: `admin123`
