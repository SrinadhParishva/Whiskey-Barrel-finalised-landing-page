# Whiskey Barrel

> **Spirits · People · Good Company**  
> Premier liquor store and tasting destination in Shawnee, Kansas. Curating rare bourbons, allocated whiskeys, fine wines, craft beers, 100% blue agave tequilas, small-batch vodkas, and premium cigars.

---

## 📍 Store Location & Contact

- **Address**: 12205 Shawnee Mission Parkway, Shawnee, KS 66216
- **Phone**: +1(913)400-2339
- **Email**: WB@rkmgmt.net
- **Website**: [whiskeybarrel.store](https://whiskeybarrel.store/)

---

## 🚀 Overview & Architecture

Whiskey Barrel is a modern, high-performance static web experience optimized for lightning-fast delivery, responsive mobile browsing, and WCAG accessibility compliance.

### Core Stack
- **HTML5**: Semantic structure with accessible attributes and rich JSON-LD Schema.org metadata.
- **CSS3**: Custom dark-themed luxury design system utilizing CSS variables, responsive fluid typography, and hardware-accelerated animations.
- **JavaScript (ES Modules)**: Lightweight, modular vanilla JavaScript powering live catalog filtering, fuzzy drawer search, dynamic product routing, quick view modals, and local wishlisting.
- **Vite**: Modern front-end tooling providing zero-config development server and optimized production bundling.

---

## 📁 Repository Structure

```text
Whiskey_Barrel/
├── assets/                  # Optimized WebP and JPG imagery, logos, icons, and Lucide library
├── experience/              # Dedicated experience portal (tasting lounge, masterclasses, about)
│   ├── assets/              # Experience-specific images and graphics
│   ├── about.html           # Brand story and heritage
│   ├── app.js               # Experience interactive scripts and status calculator
│   ├── index.html           # Experience landing page
│   ├── style.css            # Experience visual styles
│   └── sitemap.xml          # Search engine XML sitemap
├── category.html            # Interactive spirits catalog with category filters & quick view
├── experience.html          # Experience gateway & booking preview
├── index.html               # Flagship storefront landing page
├── product.html             # Dedicated product detail page with tasting notes & specs
├── script.js                # Core store application logic, cart/wishlist state, and search
├── style.css                # Primary website design system and responsive styles
├── visit.html               # Store hours, location directions, and interactive maps
├── robots.txt               # Search engine crawler policies
└── package.json             # Project manifest and build scripts
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` (bundled with Node.js)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Whiskey_Barrel

# Install dependencies
npm install
```

### Local Development
```bash
# Start local development server with hot-reloading
npm run dev
```
Navigate to the local URL displayed in the terminal (typically `http://localhost:5173/`).

### Production Build
```bash
# Compile and optimize assets into dist/ directory
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deployment Compatibility

This repository is structured for seamless zero-configuration deployment to any modern static hosting platform:
- **Netlify**: Pre-configured with `_headers` and `_redirects`
- **Vercel**: Fully compatible static Vite output
- **Cloudflare Pages**: Direct asset serving from `dist/`
- **GitHub Pages**: Static site compatible

---

## 🔒 Security & Performance Standards

- **Zero Third-Party Trackers**: Clean user privacy posture.
- **Content Security**: Sanitized modal inputs and secured external links with `rel="noopener noreferrer"`.
- **Accessibility**: Comprehensive descriptive alt texts on all product bottles and UI elements.
- **Optimized Assets**: Next-gen WebP formats alongside high-resolution JPG fallbacks.

---

## 📄 License

All rights reserved © Whiskey Barrel. Proprietary brand assets, logos, and catalog content.
