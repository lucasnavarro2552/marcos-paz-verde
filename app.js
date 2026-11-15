/**
 * ============================================================================
 * MARCOS PAZ URBAN TREE CENSUS - LÓGICA PRINCIPAL Y CONEXIÓN A SUPABASE
 * ============================================================================
 */

// 1. CONFIGURACIÓN DE SUPABASE
// Reemplazá estos valores con la URL y la Anon Key de tu proyecto en Supabase.
// Si los dejás así, la aplicación usará automáticamente los datos de respaldo locales.
const SUPABASE_URL = 'https://kzgvsjkvgdufwnuriszv.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6Z3Zzamt2Z2R1ZndudXJpc3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NzQ1MTgsImV4cCI6MjExMDM1MDUxOH0.HGaoGMkUYKZLGOk4DAj6FYPBEKgm02AapOlCTWFfr0Y';

let supabaseClient = null;
if (SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('TU-PROYECTO')) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 2. DATOS DE RESPALDO (FALLBACK DATA)
// Garantiza que la presentación en el proyector funcione al 100% incluso sin internet.
const FALLBACK_SPECIES = [
  { id: 1, common_name: 'London Plane', scientific_name: 'Platanus × acerifolia', tree_count: 1420, care: 'Requires annual winter pruning to control canopy size and reduce seed fluff.', benefits: 'Exceptional shade coverage, high tolerance to urban pollution and compacted soil.', cons: 'Seed hairs cause severe respiratory and eye irritation in spring; aggressive roots lift sidewalks.', is_allergenic: true, allergy_notes: 'High allergenicity in Sept–Oct due to airborne trichomes.', history: 'Planted extensively across Buenos Aires Province avenues in the early 20th century for rapid shade.' },
  { id: 2, common_name: 'Red Ash', scientific_name: 'Fraxinus pennsylvanica', tree_count: 1180, care: 'Moderate watering during first 3 years; prune dead branches in late winter.', benefits: 'Fast-growing, golden autumn foliage, resistant to local frosts.', cons: 'Susceptible to wood-boring insects if stressed; moderate pollen allergen.', is_allergenic: true, allergy_notes: 'Moderate pollen allergy risk in early spring.', history: 'Introduced from North America and widely adopted in Marcos Paz residential streets.' },
  { id: 3, common_name: 'Jacaranda', scientific_name: 'Jacaranda mimosifolia', tree_count: 890, care: 'Full sun exposure, well-drained soil, protect young saplings from heavy frost.', benefits: 'Iconic violet-blue spring blossoms, attracts pollinators, light filtered shade.', cons: 'Drops sticky flowers and woody seed pods on sidewalks in late spring.', is_allergenic: false, allergy_notes: 'Non-allergenic.', history: 'Native to northwestern Argentina; celebrated in Argentine music and urban landscaping.' },
  { id: 4, common_name: 'Tipa', scientific_name: 'Tipuana tipu', tree_count: 760, care: 'Deep watering in summer; requires wide sidewalk planters due to trunk girth.', benefits: 'Massive umbrella canopy, nitrogen-fixing roots, bright yellow summer flowers.', cons: 'Secretes harmless sap droplets ("tipa tears") caused by cicadas in summer.', is_allergenic: false, allergy_notes: 'Non-allergenic.', history: 'Native to the Yungas jungle; forms green tunnels over historic streets in Buenos Aires.' },
  { id: 5, common_name: 'Eucalyptus', scientific_name: 'Eucalyptus camaldulensis', tree_count: 640, care: 'Drought-tolerant once established; keep away from buildings and power lines.', benefits: 'Rapid biomass growth, aromatic leaves, windbreak protection in peri-urban zones.', cons: 'High water consumption, flammable bark/leaves, brittle branches during windstorms.', is_allergenic: true, allergy_notes: 'Low to moderate pollen sensitivity; strong essential oils.', history: 'Introduced in the 19th century to drain wetlands and supply timber for railways.' },
  { id: 6, common_name: 'Ceibo (National Flower)', scientific_name: 'Erythrina crista-galli', tree_count: 410, care: 'Prefers moist soils and full sun; prune after flowering.', benefits: "Argentina's National Flower; bright crimson blooms attract hummingbirds.", cons: 'Thorny stems and branches; irregular twisted trunk shape.', is_allergenic: false, allergy_notes: 'Non-allergenic.', history: "Declared Argentina's National Flower in 1942; native to the Paraná River basin." },
  { id: 7, common_name: 'Pink Lapacho', scientific_name: 'Handroanthus impetiginosus', tree_count: 350, care: 'Frost-sensitive when young; needs rich, well-drained soil.', benefits: 'Spectacular pink trumpet flowers before leaves emerge in late winter.', cons: 'Slow initial growth; bare canopy during winter months.', is_allergenic: false, allergy_notes: 'Non-allergenic.', history: 'Valued by indigenous peoples for its dense, rot-resistant hardwood and medicinal bark.' },
  { id: 8, common_name: 'Silk Floss Tree (Palo Borracho)', scientific_name: 'Ceiba speciosa', tree_count: 290, care: 'Low water needs once mature; requires ample space for bottle-shaped trunk.', benefits: 'Striking pink/white flowers in autumn, drought resistant, unique sculptural trunk.', cons: 'Trunk covered in thick conical spines; cottony seed dispersal in winter.', is_allergenic: false, allergy_notes: 'Cotton fluff is non-allergenic, though mildly irritating mechanically.', history: 'Native to northern Argentina; indigenous legends associate its swollen trunk with water spirits.' },
  { id: 9, common_name: 'Linden (Tilo)', scientific_name: 'Tilia × moltkei', tree_count: 230, care: 'Regular summer watering; sensitive to extreme heat without soil moisture.', benefits: 'Fragrant flowers used for calming herbal infusions, dense summer shade.', cons: 'Attracts aphids that drip sticky honeydew onto parked cars.', is_allergenic: false, allergy_notes: 'Non-allergenic; blossoms are used medicinally.', history: 'Traditional boulevard tree in Buenos Aires suburbs, prized for its calming scent.' },
  { id: 10, common_name: 'Chinaberry (Paraíso)', scientific_name: 'Melia azedarach', tree_count: 195, care: 'Extremely hardy; tolerates poor soils and drought with minimal care.', benefits: 'Fragrant lilac flowers in spring, dense shade, fast establishment.', cons: 'Berries are toxic if ingested by pets or children; invasive in natural reserves.', is_allergenic: false, allergy_notes: 'Non-allergenic.', history: 'Brought from Asia in the 19th century; historically used as a natural insect repellent.' }
];

const FALLBACK_TREES = [
  { id: 1, species_id: 1, lat: -34.7665, lng: -58.8332, planted_date: '1985-06-15', felling_date: '2026-11-28', status: 'Scheduled for Felling' },
  { id: 2, species_id: 3, lat: -34.7658, lng: -58.8345, planted_date: '2012-09-21', felling_date: null, status: 'Healthy' },
  { id: 3, species_id: 6, lat: -34.7672, lng: -58.8320, planted_date: '2018-11-22', felling_date: null, status: 'Healthy' },
  { id: 4, species_id: 4, lat: -34.7640, lng: -58.8350, planted_date: '1998-08-10', felling_date: null, status: 'Healthy' },
  { id: 5, species_id: 2, lat: -34.7685, lng: -58.8310, planted_date: '2005-05-12', felling_date: '2026-12-05', status: 'Scheduled for Felling' },
  { id: 6, species_id: 7, lat: -34.7650, lng: -58.8305, planted_date: '2019-10-04', felling_date: null, status: 'Healthy' },
  { id: 7, species_id: 8, lat: -34.7690, lng: -58.8360, planted_date: '2015-04-18', felling_date: null, status: 'Healthy' },
  { id: 8, species_id: 5, lat: -34.7710, lng: -58.8290, planted_date: '1975-07-09', felling_date: '2026-12-12', status: 'Scheduled for Felling' },
  { id: 9, species_id: 9, lat: -34.7660, lng: -58.8315, planted_date: '2008-09-01', felling_date: null, status: 'Healthy' },
  { id: 10, species_id: 10, lat: -34.7635, lng: -58.8325, planted_date: '2001-03-20', felling_date: '2026-11-30', status: 'Scheduled for Felling' }
];

const FALLBACK_GREEN_SPOTS = [
  { id: 1, name: 'Plaza San Martín', type: 'Main Square', description: 'Historic central square featuring century-old London Planes, Tipas, and civic monuments.', lat: -34.7662, lng: -58.8335 },
  { id: 2, name: 'Jardín Botánico Municipal', type: 'Botanical Garden', description: 'Conservation area showcasing native flora of the Pampean and Delta regions with educational trails.', lat: -34.7725, lng: -58.8280 },
  { id: 3, name: 'Vivero Municipal Marcos Paz', type: 'Municipal Nursery', description: 'Tree propagation center supplying native saplings for urban reforestation and local schools.', lat: -34.7615, lng: -58.8390 },
  { id: 4, name: 'Paseo de la Estación', type: 'Linear Park', description: 'Railroad heritage park lined with Jacarandas, Pink Lapachos, and recreational paths.', lat: -34.7648, lng: -58.8342 }
];

// Variables globales de estado
let appData = { species: [], trees: [], greenSpots: [] };
let map = null;
let markersLayer = null;

// ============================================================================
// 3. INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  createFallingLeaves();      // Inicia hojas cayendo suavemente
  initScrollAnimations();     // Configura apariciones al hacer scroll
  initMap();                  // Inicializa el mapa centrado en Marcos Paz
  await loadCensusData();     // Carga datos desde Supabase o Fallback
  setupFilterButtons();       // Activa filtros del mapa
});

/**
 * Carga datos desde Supabase; si falla o no está configurado, usa los datos locales.
 */
async function loadCensusData() {
  const statusBadge = document.getElementById('db-status');

  try {
    if (!supabaseClient) throw new Error('Supabase credentials not configured');

    const [speciesRes, treesRes, spotsRes] = await Promise.all([
      supabaseClient.from('species').select('*').order('tree_count', { ascending: false }),
      supabaseClient.from('trees').select('*'),
      supabaseClient.from('green_spots').select('*')
    ]);

    if (speciesRes.error || treesRes.error || spotsRes.error) {
      throw new Error('Supabase query error');
    }

    appData.species = speciesRes.data;
    appData.trees = treesRes.data;
    appData.greenSpots = spotsRes.data;

    statusBadge.textContent = '● Live: Supabase DB';
    statusBadge.style.color = '#8ce0b0';
  } catch (err) {
    console.warn('Usando datos de respaldo locales:', err.message);
    appData.species = FALLBACK_SPECIES;
    appData.trees = FALLBACK_TREES;
    appData.greenSpots = FALLBACK_GREEN_SPOTS;

    statusBadge.textContent = '● Local Demo Mode';
    statusBadge.style.color = '#fde68a';
  }

  // Renderizar todas las secciones con los datos obtenidos
  renderMapMarkers('all');
  renderTop10Ranking();
  renderSpeciesCards();
  renderGreenSpots();
  renderAllergySection();
  renderFellingTable();
}

// ============================================================================
// 4. MAPA INTERACTIVO Y ANIMACIÓN DE "PLANTADO" DE MARCADORES
// ============================================================================
function initMap() {
  // Coordenadas centrales de Marcos Paz, Buenos Aires
  map = L.map('map').setView([-34.7665, -58.8332], 15);

  // Capa de mapa limpia y detallada (Carto Voyager)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 19
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

/**
 * Renderiza los marcadores uno por uno con retraso escalonado para simular
 * que los árboles se van "plantando" en el mapa.
 */
function renderMapMarkers(filter) {
  markersLayer.clearLayers();
  let delayIndex = 0;

  // 1. Marcadores de árboles
  if (filter !== 'greenspots') {
    appData.trees.forEach((tree) => {
      const sp = appData.species.find(s => s.id === tree.species_id);
      if (!sp) return;

      // Aplicar filtro seleccionado
      if (filter === 'healthy' && tree.status !== 'Healthy') return;
      if (filter === 'felling' && tree.status !== 'Scheduled for Felling') return;
      if (filter === 'allergenic' && !sp.is_allergenic) return;

      const emoji = tree.status === 'Scheduled for Felling' ? '🪓' : (sp.id === 3 || sp.id === 7 ? '🌸' : '🌳');

      setTimeout(() => {
        const customIcon = L.divIcon({
          className: 'custom-tree-div',
          html: `<div class="tree-marker-icon">${emoji}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 30]
        });

        const marker = L.marker([tree.lat, tree.lng], { icon: customIcon }).addTo(markersLayer);
        marker.on('click', () => showTreeDetails(tree, sp));
      }, delayIndex * 110); // 110ms entre cada árbol "plantado"

      delayIndex++;
    });
  }

  // 2. Marcadores de Puntos Verdes
  if (filter === 'all' || filter === 'greenspots') {
    appData.greenSpots.forEach((spot) => {
      setTimeout(() => {
        const spotIcon = L.divIcon({
          className: 'custom-spot-div',
          html: `<div class="tree-marker-icon">🏞️</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 30]
        });

        const marker = L.marker([spot.lat, spot.lng], { icon: spotIcon }).addTo(markersLayer);
        marker.on('click', () => showGreenSpotDetails(spot));
      }, delayIndex * 110);

      delayIndex++;
    });
  }
}

/**
 * Muestra la ficha completa del árbol seleccionado en el panel lateral del mapa
 */
function showTreeDetails(tree, species) {
  const panel = document.getElementById('tree-detail-panel');
  const statusClass = tree.status === 'Healthy' ? 'tag-healthy' : 'tag-felling';
  const allergyClass = species.is_allergenic ? 'tag-allergy' : 'tag-safe';
  const allergyText = species.is_allergenic ? '⚠️ Allergenic' : '✅ Non-Allergenic';

  panel.innerHTML = `
    <div class="detail-header">
      <h3>${species.common_name}</h3>
      <span class="sci-name">${species.scientific_name}</span>
      <div class="detail-tags">
        <span class="tag ${statusClass}">${tree.status}</span>
        <span class="tag ${allergyClass}">${allergyText}</span>
      </div>
    </div>
    <div class="detail-item"><strong>🌱 Care:</strong> ${species.care}</div>
    <div class="detail-item"><strong>✨ Benefits:</strong> ${species.benefits}</div>
    <div class="detail-item"><strong>⚠️ Cons:</strong> ${species.cons}</div>
    <div class="detail-item"><strong>🤧 Allergy Info:</strong> ${species.allergy_notes}</div>
    <div class="detail-item"><strong>📜 History:</strong> ${species.history}</div>
    <div class="detail-item" style="margin-top:0.5rem; font-size:0.85rem; color:#4b6356;">
      <strong>Location:</strong> ${tree.lat.toFixed(4)}, ${tree.lng.toFixed(4)}
      ${tree.felling_date ? `<br><strong style="color:#c93b3b;">Scheduled Felling:</strong> ${tree.felling_date}` : ''}
    </div>
  `;
}

function showGreenSpotDetails(spot) {
  const panel = document.getElementById('tree-detail-panel');
  panel.innerHTML = `
    <div class="detail-header">
      <h3>🏞️ ${spot.name}</h3>
      <span class="sci-name">${spot.type} — Marcos Paz</span>
      <div class="detail-tags">
        <span class="tag tag-healthy">Protected Green Space</span>
      </div>
    </div>
    <div class="detail-item"><strong>Overview:</strong> ${spot.description}</div>
    <div class="detail-item"><strong>Coordinates:</strong> ${spot.lat.toFixed(4)}, ${spot.lng.toFixed(4)}</div>
  `;
}

function setupFilterButtons() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMapMarkers(btn.dataset.filter);
    });
  });
}

// ============================================================================
// 5. RENDERIZADO DE RANKING TOP 10, TARJETAS, PUNTOS VERDES, ALERGIAS Y TALAS
// ============================================================================
function renderTop10Ranking() {
  const container = document.getElementById('ranking-container');
  const sorted = [...appData.species].sort((a, b) => b.tree_count - a.tree_count).slice(0, 10);
  const maxCount = sorted[0]?.tree_count || 1;

  // Actualizar contador total del encabezado
  const totalTrees = sorted.reduce((acc, item) => acc + item.tree_count, 0);
  document.getElementById('total-trees-stat').textContent = totalTrees.toLocaleString();

  container.innerHTML = sorted.map((sp, idx) => {
    const pct = Math.round((sp.tree_count / maxCount) * 100);
    return `
      <div class="rank-row">
        <span class="rank-num">#${idx + 1}</span>
        <span class="rank-name">${sp.common_name}</span>
        <div class="rank-bar-bg">
          <div class="rank-bar-fill" style="width: ${pct}%"></div>
        </div>
        <span class="rank-count">${sp.tree_count.toLocaleString()}</span>
      </div>
    `;
  }).join('');
}

function renderSpeciesCards() {
  const grid = document.getElementById('species-grid');
  grid.innerHTML = appData.species.map(sp => `
    <article class="species-card">
      <div class="species-card-top">
        <div>
          <h3>${sp.common_name}</h3>
          <span class="sci-name">${sp.scientific_name}</span>
        </div>
        <span class="tag ${sp.is_allergenic ? 'tag-allergy' : 'tag-healthy'}">
          ${sp.is_allergenic ? 'Allergenic' : 'Low Allergy'}
        </span>
      </div>
      <p><strong>Care:</strong> ${sp.care}</p>
      <p><strong>Benefits:</strong> ${sp.benefits}</p>
      <p><strong>Cons:</strong> ${sp.cons}</p>
      <p><strong>History:</strong> ${sp.history}</p>
    </article>
  `).join('');
}

function renderGreenSpots() {
  const grid = document.getElementById('green-spots-grid');
  grid.innerHTML = appData.greenSpots.map(spot => `
    <div class="spot-card">
      <span class="spot-type">${spot.type}</span>
      <h3 style="margin: 0.3rem 0 0.6rem;">${spot.name}</h3>
      <p style="font-size:0.93rem; color:#4b6356;">${spot.description}</p>
    </div>
  `).join('');
}

function renderAllergySection() {
  const container = document.getElementById('allergenic-list');
  const allergenic = appData.species.filter(sp => sp.is_allergenic);

  container.innerHTML = allergenic.map(sp => `
    <div class="allergenic-item">
      <strong>${sp.common_name}</strong> (<em>${sp.scientific_name}</em>)
      <p style="font-size:0.9rem; margin-top:0.25rem;">${sp.allergy_notes}</p>
    </div>
  `).join('');
}

function renderFellingTable() {
  const tbody = document.getElementById('felling-tbody');
  const scheduled = appData.trees.filter(t => t.felling_date);

  tbody.innerHTML = scheduled.map(tree => {
    const sp = appData.species.find(s => s.id === tree.species_id);
    return `
      <tr>
        <td><strong>${tree.felling_date}</strong></td>
        <td>${sp ? sp.common_name : 'Unknown'}</td>
        <td><em>${sp ? sp.scientific_name : ''}</em></td>
        <td>${tree.lat.toFixed(4)}, ${tree.lng.toFixed(4)}</td>
        <td><span class="tag tag-felling">${tree.status} — Native Replanting Planned</span></td>
      </tr>
    `;
  }).join('');
}

// ============================================================================
// 6. ANIMACIONES AMBIENTALES Y SCROLL REVEAL
// ============================================================================
function createFallingLeaves() {
  const container = document.getElementById('leaves-container');
  const leafEmojis = ['🍃', '🌿', '🍂'];
  const leafCount = 14; // Cantidad sutil para no distraer en el proyector

  for (let i = 0; i < leafCount; i++) {
    const leaf = document.createElement('span');
    leaf.className = 'falling-leaf';
    leaf.textContent = leafEmojis[i % leafEmojis.length];
    leaf.style.left = `${Math.random() * 100}%`;
    leaf.style.animationDuration = `${12 + Math.random() * 14}s`;
    leaf.style.animationDelay = `${Math.random() * 10}s`;
    leaf.style.fontSize = `${0.9 + Math.random() * 0.7}rem`;
    container.appendChild(leaf);
  }
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(section => observer.observe(section));
}
