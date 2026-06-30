# Sri Lanka Dengue Surveillance Hub

An interactive, responsive dashboard for exploring and analyzing weekly dengue case trends across Sri Lanka's districts. This application provides real-time visualizations of epidemiological reports, risk indices, weather metrics, and comparative analytics tools to support public health monitoring.

---

## 🚀 Key Features

### 1. Interactive Choropleth Map
- **Risk-Based Heatmaps**: Leverages Leaflet to render a complete vector map of Sri Lanka, color-coded by the active week's dengue risk levels (`High`, `Medium`, `Low`).
- **Dynamic Interaction**: Click any district on the map to trigger local metrics inspection.

### 2. National Surveillance Summary
- **National Risk Index**: Displays the overall country-wide risk classification.
- **Weekly & Cumulative Metrics**: Shows active week cases, percentage change from the previous week, and total cumulative cases for the calendar year.
- **Automated Insights**:
  - **Hot Spots**: Automatically highlights districts showing elevated risk levels or case surges.
  - **Weather Indicators**: Details districts with high precipitation or abnormal climatic changes.

### 3. Historical Timeline Slider
- **Time Travel**: Traverse through the epidemiological dataset using a slider/timeline component to view historical case fluctuations and shift dates instantly.

### 4. District-Specific Metrics
- **Climatic & Case Data**: View absolute weekly cases, cumulative cases, and local weather indicators (e.g., Heavy Rain, Mild Rain, Dry conditions) with real-time temperature and humidity trackers.

### 5. Multi-Week & Multi-District Compare View
- **Side-by-Side Spatial Mapping**: Render dual maps to visualize geographic distribution changes between any two selected reporting weeks (e.g., comparing an earlier week with a later week).
- **Searchable District Selector**: Select multiple districts using an auto-complete dropdown search box or directly by clicking on the maps.
- **Detailed Comparison Table**: Compares case counts, cumulative cases, and percentage differences for all selected districts.
- **Vertical Bar Chart Representation**: Interactive vertical bar charts comparing the selected districts' case counts side-by-side across both selected weeks.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Engine**: [Vite 8](https://vite.dev/)
- **Styling & Icons**: [Tailwind CSS 4](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/)
- **Geospatial Maps**: [Leaflet](https://leafletjs.com/)
- **Navigation**: [React Router 7](https://reactrouter.com/)
- **Linting & Code Quality**: [Oxlint](https://oxc.rs/docs/guide/usage/linter/rules) (High-speed Rust-based linter) + ESLint

---

## 📦 Getting Started & Setup Guide

Follow these steps to run the Sri Lanka Dengue Surveillance Hub locally.

### Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### 1. Clone & Navigate to the Project
```bash
cd sri-lanka-dengue-react
```

### 2. Install Dependencies
Install all required Node modules:
```bash
npm install
```

### 3. Run Development Server
Start the local server with hot module replacement (HMR):
```bash
npm run dev
```
By default, the application will run at **`http://localhost:5173/`**.

### 4. Build for Production
Compile the TypeScript and build the optimized production assets:
```bash
npm run build
```
The production bundle will be generated in the `/dist` directory.

### 5. Preview Production Build Locally
Verify the production build works as expected before deploying:
```bash
npm run preview
```

### 6. Code Linting
Run ESLint to check for code quality issues and style warnings:
```bash
npm run lint
```

### 7. Deployment
Deploy the built site to GitHub Pages:
```bash
npm run deploy
```

---

## 📊 Data Structure

The dashboard relies on static epidemiological datasets located in the `/public/data/` directory:
1. **`lk.json`**: GeoJSON boundaries for all 25 districts of Sri Lanka.
2. **`dengue_map_data.json`**: Time series surveillance dataset organized by start date ISO keys, following this schema:
   ```typescript
   export interface DistrictMetrics {
     cases: number;
     cumulative: number;
     temp: number;
     rain: number;
     humidity: number;
     risk: 'High' | 'Medium' | 'Low';
   }
   ```
