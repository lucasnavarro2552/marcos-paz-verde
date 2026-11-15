-- 1. Creación de tablas
CREATE TABLE species (
  id SERIAL PRIMARY KEY,
  common_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  tree_count INT DEFAULT 0,
  care TEXT NOT NULL,
  benefits TEXT NOT NULL,
  cons TEXT NOT NULL,
  is_allergenic BOOLEAN DEFAULT FALSE,
  allergy_notes TEXT,
  history TEXT NOT NULL
);

CREATE TABLE trees (
  id SERIAL PRIMARY KEY,
  species_id INT REFERENCES species(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  planted_date DATE,
  felling_date DATE,
  status TEXT DEFAULT 'Healthy' -- 'Healthy', 'Scheduled for Felling', 'Felled'
);

CREATE TABLE green_spots (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Square', 'Botanical Garden', 'Nursery'
  description TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL
);

-- 2. Habilitar lectura pública (Row Level Security)
ALTER TABLE species ENABLE ROW LEVEL SECURITY;
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE green_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read species" ON species FOR SELECT USING (true);
CREATE POLICY "Public read trees" ON trees FOR SELECT USING (true);
CREATE POLICY "Public read green_spots" ON green_spots FOR SELECT USING (true);

-- 3. Datos iniciales (Seed Data - Top 10 especies de Marcos Paz)
INSERT INTO species (id, common_name, scientific_name, tree_count, care, benefits, cons, is_allergenic, allergy_notes, history) VALUES
(1, 'London Plane', 'Platanus × acerifolia', 1420, 'Requires annual winter pruning to control canopy size and reduce seed fluff.', 'Exceptional shade coverage, high tolerance to urban pollution and compacted soil.', 'Seed hairs cause severe respiratory and eye irritation in spring; aggressive roots lift sidewalks.', true, 'High allergenicity in Sept-Oct due to airborne trichomes.', 'Planted extensively across Buenos Aires Province avenues in the early 20th century for rapid shade.'),
(2, 'Red Ash', 'Fraxinus pennsylvanica', 1180, 'Moderate watering during first 3 years; prune dead branches in late winter.', 'Fast-growing, golden autumn foliage, resistant to local frosts.', 'Susceptible to wood-boring insects if stressed; moderate pollen allergen.', true, 'Moderate pollen allergy risk in early spring.', 'Introduced from North America and widely adopted in Marcos Paz residential streets.'),
(3, 'Jacaranda', 'Jacaranda mimosifolia', 890, 'Full sun exposure, well-drained soil, protect young saplings from heavy frost.', 'Iconic violet-blue spring blossoms, attracts pollinators, light filtered shade.', 'Drops sticky flowers and woody seed pods on sidewalks in late spring.', false, 'Non-allergenic.', 'Native to northwestern Argentina; celebrated in Argentine music and urban landscaping.'),
(4, 'Tipa', 'Tipuana tipu', 760, 'Deep watering in summer; requires wide sidewalk planters due to trunk girth.', 'Massive umbrella canopy, nitrogen-fixing roots, bright yellow summer flowers.', 'Secretes harmless sap droplets ("tipa tears") caused by cicadas in summer.', false, 'Non-allergenic.', 'Native to the Yungas jungle; forms green tunnels over historic streets in Buenos Aires.'),
(5, 'Eucalyptus', 'Eucalyptus camaldulensis', 640, 'Drought-tolerant once established; keep away from buildings and power lines.', 'Rapid biomass growth, aromatic leaves, windbreak protection in peri-urban zones.', 'High water consumption, flammable bark/leaves, brittle branches during windstorms.', true, 'Low to moderate pollen sensitivity; strong essential oils.', 'Introduced in the 19th century to drain wetlands and supply timber for railways.'),
(6, 'Ceibo (Cockspur Coral Tree)', 'Erythrina crista-galli', 410, 'Prefers moist soils and full sun; prune after flowering.', 'Argentina''s National Flower; bright crimson blooms attract hummingbirds.', 'Thorny stems and branches; irregular twisted trunk shape.', false, 'Non-allergenic.', 'Declared Argentina''s National Flower in 1942; native to the Paraná River basin.'),
(7, 'Pink Lapacho', 'Handroanthus impetiginosus', 350, 'Frost-sensitive when young; needs rich, well-drained soil.', 'Spectacular pink trumpet flowers before leaves emerge in late winter.', 'Slow initial growth; bare canopy during winter months.', false, 'Non-allergenic.', 'Valued by indigenous peoples for its dense, rot-resistant hardwood and medicinal bark.'),
(8, 'Silk Floss Tree (Palo Borracho)', 'Ceiba speciosa', 290, 'Low water needs once mature; requires ample space for bottle-shaped trunk.', 'Striking pink/white flowers in autumn, drought resistant, unique sculptural trunk.', 'Trunk covered in thick conical spines; cottony seed dispersal in winter.', false, 'Cotton fluff is generally non-allergenic, though mildly irritating mechanically.', 'Native to northern Argentina; indigenous legends associate its swollen trunk with water spirits.'),
(9, 'Linden (Tilo)', 'Tilia × moltkei', 230, 'Regular summer watering; sensitive to extreme heat without soil moisture.', 'Fragrant flowers used for calming herbal infusions, dense summer shade.', 'Attracts aphids that drip sticky honeydew onto parked cars.', false, 'Non-allergenic; blossoms are used medicinally.', 'Traditional boulevard tree in Buenos Aires suburbs, prized for its calming scent.'),
(10, 'Chinaberry (Paraíso)', 'Melia azedarach', 195, 'Extremely hardy; tolerates poor soils and drought with minimal care.', 'Fragrant lilac flowers in spring, dense shade, fast establishment.', 'Berries are toxic if ingested by pets or children; considered invasive in natural reserves.', false, 'Non-allergenic.', 'Brought from Asia in the 19th century; historically used as a natural insect repellent.');

-- 4. Árboles geolocalizados en Marcos Paz (Lat ~ -34.766, Lng ~ -58.833)
INSERT INTO trees (species_id, lat, lng, planted_date, felling_date, status) VALUES
(1, -34.7665, -58.8332, '1985-06-15', '2026-11-28', 'Scheduled for Felling'),
(3, -34.7658, -58.8345, '2012-09-21', NULL, 'Healthy'),
(6, -34.7672, -58.8320, '2018-11-22', NULL, 'Healthy'),
(4, -34.7640, -58.8350, '1998-08-10', NULL, 'Healthy'),
(2, -34.7685, -58.8310, '2005-05-12', '2026-12-05', 'Scheduled for Felling'),
(7, -34.7650, -58.8305, '2019-10-04', NULL, 'Healthy'),
(8, -34.7690, -58.8360, '2015-04-18', NULL, 'Healthy'),
(5, -34.7710, -58.8290, '1975-07-09', '2026-12-12', 'Scheduled for Felling'),
(9, -34.7660, -58.8315, '2008-09-01', NULL, 'Healthy'),
(10, -34.7635, -58.8325, '2001-03-20', '2026-11-30', 'Scheduled for Felling');

-- 5. Puntos Verdes de Marcos Paz
INSERT INTO green_spots (name, type, description, lat, lng) VALUES
('Plaza San Martín', 'Main Square', 'Historic central square featuring century-old London Planes, Tipas, and civic monuments.', -34.7662, -58.8335),
('Jardín Botánico Municipal', 'Botanical Garden', 'Conservation area showcasing native flora of the Pampean and Delta regions with educational trails.', -34.7725, -58.8280),
('Vivero Municipal Marcos Paz', 'Municipal Nursery', 'Tree propagation center supplying native saplings for urban reforestation and local schools.', -34.7615, -58.8390),
('Paseo de la Estación', 'Linear Park', 'Railroad heritage park lined with Jacarandas, Pink Lapachos, and recreational paths.', -34.7648, -58.8342);