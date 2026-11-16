Markdown
# 🌳 Marcos Paz Urban Tree Census — "The City of Trees"

An interactive web application, ETL data pipeline, and municipal forestry dashboard designed to map, analyze, and monitor urban tree biodiversity, seasonal allergy risks, scheduled maintenance, and climate impact across Marcos Paz and Buenos Aires.

Developed as a group project for the **Technical English (Inglés Técnico)** university course.

---

## 📋 Table of Contents
- [Installation](#installation)
- [Data Pipeline & Usage](#data-pipeline--usage)
- [Data Sources](#data-sources)
- [Model Description](#model-description)
- [Results](#results)
- [Contributing](#contributing)
- [License](#license)

---

## ⚙️ Installation

This project consists of two parts: a **Python ETL pipeline** for dataset preparation and a **zero-build web frontend** (HTML5, CSS3, ES6+ JavaScript) connected to **Supabase** (PostgreSQL).

### 1. Clone the repository
```bash
git clone [https://github.com/lerghik/arbolado_lineal.git](https://github.com/lerghik/arbolado_lineal.git)
cd arbolado_lineal
2. Python Environment Setup (For Data Processing)
If you want to rebuild the database CSVs from scratch, install the required libraries:

Bash
pip install pandas google-genai
3. Environment Variables Configuration
To run the AI-powered generation script (add_description.py), you must configure your Google Gemini API Key as an environment variable in your operating system (never hardcode sensitive credentials into the code).

On Windows (PowerShell):

PowerShell
$env:GEMINI_API_KEY="your_gemini_api_key_here"
On Windows (CMD):

DOS
set GEMINI_API_KEY="your_gemini_api_key_here"
On Linux / macOS (Terminal):

Bash
export GEMINI_API_KEY="your_gemini_api_key_here"
(Tip: To make it permanent in Windows, search for "Edit the system environment variables" in the Start menu, add a new user/system variable named GEMINI_API_KEY, and restart your terminal or code editor).

4. Database Setup (Supabase)
Create a new project on Supabase.

Open the SQL Editor and create the species and green_spots tables from schema.sql, then create the trees table with spatial indexing:

SQL
CREATE TABLE public.trees (
  id bigint NOT NULL,
  lng double precision NULL,
  lat double precision NULL,
  nro_registro text NULL,
  tipo_activ text NULL,
  comuna text NULL,
  manzana text NULL,
  calle_nombre text NULL,
  calle_altura text NULL,
  calle_chapa text NULL,
  direccion_normalizada text NULL,
  ubicacion text NULL,
  nombre_cientifico text NULL,
  ancho_acera text NULL,
  estado_plantera text NULL,
  ubicacion_plantera text NULL,
  nivel_plantera text NULL,
  diametro_altura_pecho double precision NULL,
  altura_arbol text NULL,
  species_id bigint NULL,
  status text NULL DEFAULT 'Healthy'::text,
  felling_date date NULL,
  CONSTRAINT arbolado_lineal_pkey PRIMARY KEY (id),
  CONSTRAINT arbolado_lineal_especie_id_fkey FOREIGN KEY (species_id) REFERENCES species (id)
);

CREATE INDEX IF NOT EXISTS idx_trees_lat_lng ON public.trees USING btree (lat, lng);
Import the generated species_db.csv and tree_data_pk_fk.csv files into their respective tables via the Supabase Table Editor.

5. Frontend Configuration & Run
Open app.js and configure your Supabase url and public anon key in DB_CONFIGS.

Launch index.html using a local server (e.g., VS Code Live Server at http://127.0.0.1:5500/index.html).

🚀 Data Pipeline & Usage
⚠️ Replicating with the Official Dataset (tree_data.csv)
To run the automated pipeline from scratch, you need the original tree_data.csv file downloaded directly from the Buenos Aires Government Open Data portal (Arbolado Público Lineal).

Place your tree_data.csv file in the root directory of the project.

Ensure your file retains the original government column names (nombre_cientifico, lat, lng, comuna, etc.) so that the Python scripts can read and process them correctly.

Step 1: Execute the Python ETL Scripts
Extract Unique Species (scientific_name.py):
Reads tree_data.csv, extracts all unique values from the nombre_cientifico column, and exports a deduplicated Python set to species.txt.

Bash
python scientific_name.py
Generate Botanical Metadata with AI (add_description.py):
Reads species.txt, processes missing species in batches of 15 using the Google Gemini API (gemini-3.8-flash with structured JSON output, reading your key securely from os.environ.get("GEMINI_API_KEY")), and builds species_db.csv with incremental IDs, common names, care tips, benefits, cons, allergy notes, and historical context.

Bash
python add_description.py
Normalize & Link Relational Keys (connect_trees.py):
Normalizes scientific names (fixing whitespace and typos such as Livistrona 
→ Livistona), maps each tree in tree_data.csv to its corresponding species_id Foreign Key from species_db.csv, prepends an auto-incremental id Primary Key, and outputs tree_data_pk_fk.csv ready for Supabase import.

Bash
python connect_trees.py
Step 2: Interactive Web Application
Switch Database Modes: Use the navbar toggle (🔄 Switch to Real DB / 🔄 Switch to Demo DB) to switch live between the Marcos Paz demo dataset and the full CABA census database.

Explore & Filter Map: Pan and zoom across the map. Zoom levels < 16 render lightweight circle markers; zooming in (>= 16) renders animated botanical icons (🌳, 🌸, 🪓). Filter by health status, scheduled felling, allergenic species, or green spots.

Inspect Climate Impact: Toggle between Annual Rainfall (mm) and Peak Summer Temp (°C) to examine meteorological trends from 2018 to 2026.

🗄️ Data Sources
Official Government Raw Dataset (tree_data.csv): Public open government urban forestry records downloaded from the Buenos Aires City Data Portal (Arbolado Público Lineal), containing over 273,500 geolocated specimens with trunk diameter (DBH), height, sidewalk width, and street address metadata.

Enriched Species Catalog (species_db.csv): Botanical and public-health knowledge base generated via add_description.py and curated for dominant Marcos Paz species (London Plane, Red Ash, Jacaranda, Tipa, Eucalyptus, Ceibo, Pink Lapacho, Silk Floss Tree, Linden, and Chinaberry).

Marcos Paz Green Spots & Climate History: Local spatial records (Plaza San Martín, Jardín Botánico Municipal, Vivero Municipal, Paseo de la Estación) and regional Pampean meteorological records (2018–2026).

Offline Fallback Layer: Embedded JSON datasets in app.js ensuring full functionality even without an active internet or database connection.

🏗️ Model Description
The system combines an Automated ETL Normalization Pipeline with a Spatial Viewport Web Architecture:

Entity-Relationship Design:

species (1) 
⟷ (N) trees linked via trees.species_id REFERENCES species(id).

Composite B-Tree index (idx_trees_lat_lng) on (lat, lng) to accelerate bounding-box queries over hundreds of thousands of rows.

Dynamic Bounding-Box Querying: loadTreesInBounds() listens to Leaflet's moveend event (debounced at 250ms) and queries Supabase only for trees inside the current screen coordinates (gte/lte on lat and lng, capped at 1,000 markers per viewport).

Frontend Stack: Leaflet.js (v1.9.4) with Esri World Street Map tiles, Supabase JS Client (v2), and responsive CSS Grid/Flexbox with keyframe animations.

📊 Results
100% Relational Integrity: Automated data cleaning and string normalization in connect_trees.py achieved complete Foreign Key mapping across 273,567+ tree records in seconds.

High-Performance GIS Rendering: Sub-second viewport loading and smooth map navigation without browser memory bottlenecks.

Actionable Urban Insights: Clear identification of spring allergy hotspots and visual correlation between the 2022–2023 La Niña drought (540 mm rainfall, 40.8°C peak heat) and the 2023–2024 tree mortality event (~380 trees lost).

🤝 Contributing
Developed collaboratively by:

Navarro Lucas

Alvarez José

Salerno Maité

To contribute:

Fork the repository.

Create a feature branch (git checkout -b feature/your-feature).

Commit your changes (git commit -m "Add feature description").

Push to the branch and open a Pull Request.

📄 License
This project is licensed under the MIT License — free to use, modify, and distribute for educational and municipal environmental initiatives.
