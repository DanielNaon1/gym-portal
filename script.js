// ============================================
// IRON PORTAL — script.js
// ============================================

// ---- API KEY ----
// Replace with your Anthropic API key from https://console.anthropic.com
const API_KEY = "YOUR_API_KEY_HERE";

// ============================================
// NAVIGATION
// ============================================
function showHome() {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('home').style.display = '';
  window.scrollTo(0, 0);
}

function showPanel(id) {
  document.getElementById('home').style.display = 'none';
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + id);
  if (panel) {
    panel.classList.add('active');
    window.scrollTo(0, 0);
  }
}

// ============================================
// TABS
// ============================================
function switchTab(id, btn) {
  document.querySelectorAll('#panel-calories .tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#panel-calories .tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + id).classList.add('active');
}

// ============================================
// CLAUDE API
// ============================================
async function callClaude(prompt) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await resp.json();
  return data.content?.[0]?.text || "No response received.";
}

// ============================================
// GOALS
// ============================================
async function sendGoals() {
  const input = document.getElementById('goalsInput').value.trim();
  if (!input) return;
  const loading = document.getElementById('goalsLoading');
  const result  = document.getElementById('goalsResult');
  loading.classList.add('visible');
  result.style.display = 'none';
  const text = await callClaude(
    `You are an elite fitness coach. A gym-goer says: "${input}". ` +
    `Create a detailed, practical weekly training program. Include: ` +
    `day-by-day schedule, exercises per session with sets and reps, ` +
    `rest periods, progression strategy, and one motivational closing note. ` +
    `Be specific and actionable. Plain text only, no markdown symbols.`
  );
  loading.classList.remove('visible');
  result.style.display = 'block';
  result.textContent = text;
}

// ============================================
// FOOD LOOKUP
// ============================================
async function lookupFood() {
  const food = document.getElementById('foodItem').value.trim();
  if (!food) return;
  const loading = document.getElementById('foodLoading');
  const result  = document.getElementById('foodResult');
  loading.classList.add('visible');
  result.style.display = 'none';
  const text = await callClaude(
    `Give the nutritional values per 100g for: ${food}. ` +
    `List: Calories (kcal), Protein (g), Carbohydrates (g) — of which sugars (g), ` +
    `Fat (g) — of which saturated (g), Fibre (g), Sodium (mg). ` +
    `Then add a 2-sentence note on its fitness/bodybuilding relevance. ` +
    `Plain text only, no markdown.`
  );
  loading.classList.remove('visible');
  result.style.display = 'block';
  result.textContent = text;
}

// ============================================
// DAILY CALORIE CALCULATOR
// ============================================
function calcDaily() {
  const age    = parseFloat(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const h      = parseFloat(document.getElementById('height').value);
  const w      = parseFloat(document.getElementById('weight').value);
  const act    = parseFloat(document.getElementById('activity').value);
  const goal   = document.getElementById('goal').value;

  if (!age || !h || !w) return;

  // Mifflin-St Jeor
  let bmr = gender === 'male'
    ? (10 * w) + (6.25 * h) - (5 * age) + 5
    : (10 * w) + (6.25 * h) - (5 * age) - 161;

  let tdee = Math.round(bmr * act);
  let cal  = goal === 'cut' ? tdee - 500 : goal === 'bulk' ? tdee + 300 : tdee;
  let protein = Math.round(w * 2);
  let fat     = Math.round(cal * 0.25 / 9);
  let carbs   = Math.round((cal - (protein * 4) - (fat * 9)) / 4);

  const grid = document.getElementById('macroGrid');
  grid.style.display = 'grid';
  grid.innerHTML = `
    <div class="macro-card"><div class="val">${cal}</div><div class="lbl">Calories</div></div>
    <div class="macro-card"><div class="val">${protein}g</div><div class="lbl">Protein</div></div>
    <div class="macro-card"><div class="val">${carbs}g</div><div class="lbl">Carbs</div></div>
    <div class="macro-card"><div class="val">${fat}g</div><div class="lbl">Fat</div></div>
  `;
}

// ============================================
// RECIPE IDEAS
// ============================================
async function getRecipes() {
  const input = document.getElementById('recipeInput').value.trim();
  if (!input) return;
  const loading = document.getElementById('recipeLoading');
  const result  = document.getElementById('recipeResult');
  loading.classList.add('visible');
  result.style.display = 'none';
  const text = await callClaude(
    `You are a sports nutritionist. A gym-goer says: "${input}". ` +
    `Suggest 4 specific meal ideas with approximate macros (calories, protein, carbs, fat) for each. ` +
    `Cover: breakfast, lunch, dinner, and a post-workout snack. ` +
    `Keep portions and ingredients realistic and practical. ` +
    `Plain text only, no markdown symbols.`
  );
  loading.classList.remove('visible');
  result.style.display = 'block';
  result.textContent = text;
}

// ============================================
// BUILD LEGEND CARDS
// ============================================
function buildLegends() {
  const grid = document.getElementById('legendsGrid');
  bodybuilders.forEach((bb, i) => {
    const card = document.createElement('div');
    card.className = 'legend-card';
    card.innerHTML = `
      <div class="legend-card-top" onclick="openLightbox(${i})">
        <img
          class="legend-thumb"
          src="${bb.thumb}"
          alt="${bb.name}"
          onerror="this.outerHTML='<div class=\\'legend-thumb-placeholder\\'>💪</div>'"
        />
        <div class="legend-meta">
          <div class="legend-years">${bb.years}</div>
          <div class="legend-name">${bb.name}</div>
          <div class="legend-wins">${bb.wins}</div>
          <span class="legend-era">${bb.era}</span>
        </div>
      </div>
      <div class="legend-expand-hint" onclick="openLightbox(${i})">TAP TO SEE FULL STORY &amp; PHOTOS →</div>
    `;
    grid.appendChild(card);
  });
}

// ============================================
// LIGHTBOX
// ============================================
function openLightbox(index) {
  const bb = bodybuilders[index];
  document.getElementById('lbName').textContent = bb.name;
  document.getElementById('lbSub').textContent = `${bb.years}  ·  ${bb.wins}  ·  ${bb.era}`;

  // Photos
  const photosEl = document.getElementById('lbPhotos');
  photosEl.innerHTML = '';
  bb.photos.forEach(url => {
    const img = document.createElement('img');
    img.className = 'lb-photo';
    img.src = url;
    img.alt = bb.name;
    img.onerror = function() {
      this.outerHTML = '<div class="lb-photo-placeholder">💪</div>';
    };
    photosEl.appendChild(img);
  });

  // Bio
  document.getElementById('lbBio').innerHTML = `
    <div class="lb-bio-section">
      <div class="lb-bio-label">PHYSIQUE</div>
      <div class="lb-bio-text">${bb.physique}</div>
    </div>
    <div class="lb-bio-section">
      <div class="lb-bio-label">STORY</div>
      <div class="lb-bio-text">${bb.bio}</div>
    </div>
    <div class="lb-bio-section">
      <div class="lb-bio-label">KEY RIVALS</div>
      <div class="lb-rivals">
        ${bb.rivals.map(r => `<span class="rival-tag">${r}</span>`).join('')}
      </div>
    </div>
  `;

  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

// Close lightbox on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// ============================================
// INIT
// ============================================
buildLegends();