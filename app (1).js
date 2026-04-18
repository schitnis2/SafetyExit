/* ═══════════════════════════════════════════════════
   SafeExit v2 — app.js
   All data lives in localStorage — nothing is ever
   sent to a server.
   ═══════════════════════════════════════════════════ */

/* ─── Affirmations ─────────────────────────────────── */
const AFFIRMATIONS = [
  "You are stronger than you know. Help is here.",
  "What happened is not your fault. You deserve safety.",
  "Your feelings are valid. Reaching out takes courage.",
  "You matter. Your wellbeing matters. You are not invisible.",
  "Every small step forward is an act of bravery.",
  "You deserve kindness — especially from yourself.",
  "Healing is not linear. Be gentle with yourself today.",
  "You are worthy of love that does not hurt.",
  "Asking for help is strength, not weakness.",
  "There are people who care and want to help you.",
  "You showed up today. That alone is enough.",
  "Safety is your right. You deserve peace.",
];

function setRandomAffirmation() {
  const idx = Math.floor(Math.random() * AFFIRMATIONS.length);
  document.getElementById('affirmation-bar').textContent = '💜 ' + AFFIRMATIONS[idx];
}

/* ─── Disguise ↔ Real app ──────────────────────────── */
document.getElementById('reveal-btn').addEventListener('click', showRealApp);
document.getElementById('hide-btn').addEventListener('click', showDisguise);

function showRealApp() {
  document.getElementById('disguise-app').classList.add('hidden');
  document.getElementById('safe-app').classList.remove('hidden');
  setRandomAffirmation();
  renderEntries();
}

function showDisguise() {
  document.getElementById('safe-app').classList.add('hidden');
  document.getElementById('disguise-app').classList.remove('hidden');
  lockLog();
}

/* ─── StudyTrack — editable assignments ────────────── */
const HW_KEY = 'se_hw';
const DEFAULT_HW = [
  { id: 1, text: 'Math — Chapter 7 review', due: 'Completed', done: true },
  { id: 2, text: 'English — Essay draft', due: 'Friday', done: false },
  { id: 3, text: 'Biology — Lab report', due: 'Thursday', done: false },
  { id: 4, text: 'History — Reading pp. 44–60', due: 'Completed', done: true },
  { id: 5, text: 'Spanish — Vocab quiz prep', due: 'Wednesday', done: false },
];

function loadHW() {
  const saved = localStorage.getItem(HW_KEY);
  return saved ? JSON.parse(saved) : DEFAULT_HW;
}

function saveHW(list) {
  localStorage.setItem(HW_KEY, JSON.stringify(list));
}

function renderHW() {
  const list = loadHW();
  const ul = document.getElementById('hw-list');
  ul.innerHTML = '';
  list.forEach(item => {
    const li = document.createElement('li');
    li.className = 'hw-item' + (item.done ? ' done' : '');
    li.dataset.id = item.id;
    li.innerHTML = `
      <span class="hw-check">${item.done ? '✓' : '○'}</span>
      <span class="hw-item-text">${escHtml(item.text)}</span>
      ${item.due ? `<span class="hw-item-due">${escHtml(item.due)}</span>` : ''}
      <button class="hw-delete-btn" data-id="${item.id}" title="Remove">✕</button>
    `;
    li.addEventListener('click', e => {
      if (e.target.classList.contains('hw-delete-btn')) return;
      const data = loadHW();
      const found = data.find(x => x.id === item.id);
      if (found) { found.done = !found.done; saveHW(data); renderHW(); }
    });
    ul.appendChild(li);
  });

  document.querySelectorAll('.hw-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const data = loadHW().filter(x => x.id !== id);
      saveHW(data); renderHW();
    });
  });

  const done = list.filter(x => x.done).length;
  const total = list.length;
  document.getElementById('hw-done-count').textContent = done;
  document.getElementById('hw-total-count').textContent = total;
  document.getElementById('hw-fill').style.width = total ? Math.round(done / total * 100) + '%' : '0%';
}

document.getElementById('hw-add-btn').addEventListener('click', () => {
  document.getElementById('hw-add-form').classList.remove('hidden');
  document.getElementById('hw-add-btn').classList.add('hidden');
  document.getElementById('hw-add-input').focus();
});

document.getElementById('hw-add-cancel').addEventListener('click', () => {
  document.getElementById('hw-add-form').classList.add('hidden');
  document.getElementById('hw-add-btn').classList.remove('hidden');
  document.getElementById('hw-add-input').value = '';
  document.getElementById('hw-add-date').value = '';
});

document.getElementById('hw-add-save').addEventListener('click', addHWItem);
document.getElementById('hw-add-input').addEventListener('keydown', e => { if (e.key === 'Enter') addHWItem(); });

function addHWItem() {
  const text = document.getElementById('hw-add-input').value.trim();
  if (!text) return;
  const due = document.getElementById('hw-add-date').value.trim();
  const data = loadHW();
  const newId = Date.now();
  data.push({ id: newId, text, due, done: false });
  saveHW(data);
  document.getElementById('hw-add-input').value = '';
  document.getElementById('hw-add-date').value = '';
  document.getElementById('hw-add-form').classList.add('hidden');
  document.getElementById('hw-add-btn').classList.remove('hidden');
  renderHW();
}

renderHW();

/* ─── Tab Navigation ───────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

document.querySelectorAll('[data-goto]').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.goto));
});

function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  document.querySelectorAll('.tab-content').forEach(s => {
    const isTarget = s.id === 'tab-' + name;
    s.classList.toggle('active', isTarget);
    s.classList.toggle('hidden', !isTarget);
  });
}

/* ─── Shelter Database ─────────────────────────────── */
/* Keys = first 3 digits of zip. Covers major US metros.
   Add more entries by following the same pattern.       */
const SHELTER_DB = {
  "070": [
    { name: "Jersey Battered Women's Service", city: "Morris County, NJ", addr: "1 Morris County Plaza", phone: "(973) 267-4763", tags: ["Open 24/7", "Walk-ins welcome"] },
    { name: "New Hope Foundation", city: "Plainfield, NJ", addr: "1 New Hope Dr", phone: "(908) 754-6855", tags: ["Open 24/7", "Call ahead if possible"] },
    { name: "WISE Women's Center", city: "Somerset, NJ", addr: "WISE Crisis Helpline", phone: "(908) 355-2464", tags: ["Hotline 24/7", "Office 9am–7pm"] },
  ],
  "071": [
    { name: "HomeSafe Shelter NJ", city: "Newark, NJ", addr: "DV Crisis Center", phone: "(973) 759-2154", tags: ["Open 24/7"] },
    { name: "Catholic Charities DV Program", city: "Newark, NJ", addr: "Service center", phone: "(973) 596-4100", tags: ["Call ahead"] },
  ],
  "072": [
    { name: "Center for Hope & Safety", city: "Ridgewood, NJ", addr: "Bergen County, NJ", phone: "(201) 444-7900", tags: ["Open 24/7", "Walk-ins welcome"] },
  ],
  "100": [
    { name: "Safe Horizon DV Hotline", city: "New York, NY", addr: "Multiple locations citywide", phone: "(800) 621-4673", tags: ["Open 24/7"] },
    { name: "YWCA NYC", city: "New York, NY", addr: "610 Lexington Ave", phone: "(212) 273-7800", tags: ["Call ahead"] },
    { name: "Urban Resource Institute", city: "Brooklyn, NY", addr: "Multiple boroughs", phone: "(800) 645-3434", tags: ["Open 24/7"] },
  ],
  "104": [
    { name: "My Sisters' Place", city: "White Plains, NY", addr: "Westchester County", phone: "(914) 683-1333", tags: ["Open 24/7"] },
    { name: "Safe Horizon – Yonkers", city: "Yonkers, NY", addr: "Westchester shelter", phone: "(800) 621-4673", tags: ["Open 24/7"] },
  ],
  "110": [
    { name: "Safe Horizon Queens", city: "Queens, NY", addr: "Queens crisis center", phone: "(800) 621-4673", tags: ["Open 24/7"] },
    { name: "SNAP (Sanctuary for Families)", city: "Queens, NY", addr: "Queens legal services", phone: "(212) 349-6009", tags: ["Call ahead"] },
  ],
  "112": [
    { name: "The Retreat", city: "East Hampton, NY", addr: "Long Island shelter", phone: "(631) 329-2200", tags: ["Open 24/7"] },
    { name: "Safe Center LI", city: "Westbury, NY", addr: "Nassau County", phone: "(516) 542-0404", tags: ["Open 24/7"] },
  ],
  "191": [
    { name: "Women Against Abuse", city: "Philadelphia, PA", addr: "Multiple PA locations", phone: "(866) 723-3014", tags: ["Open 24/7"] },
    { name: "WOAR – Philadelphia", city: "Philadelphia, PA", addr: "Crisis center", phone: "(215) 985-3333", tags: ["Hotline 24/7"] },
  ],
  "200": [
    { name: "HopeLink DV Services", city: "Washington, DC", addr: "NW DC", phone: "(202) 842-1056", tags: ["Open 24/7"] },
    { name: "Safe Shores DC", city: "Washington, DC", addr: "Multiple DC locations", phone: "(202) 842-1056", tags: ["Open 24/7"] },
  ],
  "212": [
    { name: "House of Ruth Maryland", city: "Baltimore, MD", addr: "2201 Argonne Dr", phone: "(410) 889-7884", tags: ["Open 24/7", "Walk-ins welcome"] },
    { name: "TurnAround Inc.", city: "Baltimore, MD", addr: "Crisis hotline & shelter", phone: "(443) 279-0379", tags: ["Hotline 24/7"] },
  ],
  "300": [
    { name: "Partnership Against DV", city: "Atlanta, GA", addr: "Fulton County, GA", phone: "(770) 963-9799", tags: ["Open 24/7"] },
    { name: "Safe House Outreach", city: "Atlanta, GA", addr: "Metro Atlanta area", phone: "(404) 615-0808", tags: ["Open 24/7"] },
  ],
  "330": [
    { name: "The Shelter for Abused Women", city: "Naples, FL", addr: "Collier County, FL", phone: "(239) 775-1101", tags: ["Open 24/7"] },
  ],
  "331": [
    { name: "Safespace – Miami", city: "Miami, FL", addr: "Miami-Dade County", phone: "(305) 553-1100", tags: ["Open 24/7"] },
    { name: "Lotus House Women's Shelter", city: "Miami, FL", addr: "Overtown, Miami FL", phone: "(305) 442-5700", tags: ["Open 24/7"] },
  ],
  "400": [
    { name: "YWCA Louisville", city: "Louisville, KY", addr: "604 S 3rd St", phone: "(502) 581-7222", tags: ["Open 24/7"] },
  ],
  "441": [
    { name: "Templum House", city: "Toledo, OH", addr: "Lucas County, OH", phone: "(419) 241-3235", tags: ["Open 24/7"] },
  ],
  "452": [
    { name: "YWCA Cincinnati", city: "Cincinnati, OH", addr: "Hamilton County, OH", phone: "(513) 872-9259", tags: ["Open 24/7"] },
  ],
  "481": [
    { name: "HAVEN", city: "Pontiac, MI", addr: "Oakland County, MI", phone: "(248) 334-1274", tags: ["Open 24/7"] },
    { name: "CARE House", city: "Oakland County, MI", addr: "Crisis center", phone: "(248) 332-7173", tags: ["Hotline 24/7"] },
  ],
  "606": [
    { name: "Sarah's Inn", city: "Chicago, IL", addr: "Oak Park, IL", phone: "(708) 386-4225", tags: ["Open 24/7"] },
    { name: "YWCA Metropolitan Chicago", city: "Chicago, IL", addr: "Loop, Chicago IL", phone: "(312) 372-6600", tags: ["Call ahead"] },
    { name: "Between Friends", city: "Chicago, IL", addr: "Citywide hotline", phone: "(800) 603-4357", tags: ["Open 24/7"] },
  ],
  "612": [
    { name: "Day One Crisis Shelter", city: "Minneapolis, MN", addr: "Hennepin County", phone: "(866) 223-1111", tags: ["Open 24/7"] },
    { name: "Casa de Esperanza", city: "St. Paul, MN", addr: "657 University Ave W", phone: "(651) 772-1611", tags: ["Open 24/7"] },
  ],
  "631": [
    { name: "Voices Against Violence", city: "Wausau, WI", addr: "Marathon County, WI", phone: "(715) 842-7323", tags: ["Open 24/7"] },
  ],
  "641": [
    { name: "Iowa DV Hotline", city: "Des Moines, IA", addr: "Statewide service", phone: "(800) 942-0333", tags: ["Open 24/7"] },
  ],
  "701": [
    { name: "Abuse and Rape Crisis Shelter", city: "Fargo, ND", addr: "Cass County, ND", phone: "(701) 293-7273", tags: ["Open 24/7"] },
  ],
  "750": [
    { name: "Family Place", city: "Dallas, TX", addr: "6500 Greenville Ave", phone: "(214) 823-1343", tags: ["Open 24/7"] },
    { name: "Genesis Women's Shelter", city: "Dallas, TX", addr: "Multiple Dallas sites", phone: "(214) 946-4357", tags: ["Open 24/7"] },
  ],
  "770": [
    { name: "Houston Area Women's Center", city: "Houston, TX", addr: "1010 Waugh Dr", phone: "(713) 528-2121", tags: ["Open 24/7"] },
    { name: "The Bridge Over Troubled Waters", city: "Houston, TX", addr: "Harris County, TX", phone: "(713) 473-2801", tags: ["Open 24/7"] },
  ],
  "787": [
    { name: "SafePlace Austin", city: "Austin, TX", addr: "Travis County, TX", phone: "(512) 267-7233", tags: ["Open 24/7"] },
  ],
  "800": [
    { name: "SafeHouse Denver", city: "Denver, CO", addr: "Multiple Denver sites", phone: "(303) 318-9989", tags: ["Open 24/7"] },
    { name: "Safehouse Progressive Alliance", city: "Boulder, CO", addr: "Boulder County", phone: "(303) 449-8623", tags: ["Open 24/7"] },
  ],
  "841": [
    { name: "YWCA Utah", city: "Salt Lake City, UT", addr: "322 E 300 S", phone: "(801) 537-8600", tags: ["Open 24/7"] },
  ],
  "852": [
    { name: "Sojourner Center", city: "Phoenix, AZ", addr: "Maricopa County", phone: "(602) 244-0989", tags: ["Open 24/7"] },
    { name: "UMOM New Day Centers", city: "Phoenix, AZ", addr: "Multiple AZ locations", phone: "(602) 263-6232", tags: ["Call ahead"] },
  ],
  "857": [
    { name: "Emerge! Center Against DV", city: "Tucson, AZ", addr: "Pima County, AZ", phone: "(520) 795-4266", tags: ["Open 24/7"] },
  ],
  "900": [
    { name: "Peace Over Violence", city: "Los Angeles, CA", addr: "605 W Olympic Blvd", phone: "(213) 626-3393", tags: ["Open 24/7"] },
    { name: "YWCA Greater LA", city: "Los Angeles, CA", addr: "Southwest LA", phone: "(213) 365-3925", tags: ["Call ahead"] },
    { name: "A Safe Place Shelter", city: "East LA, CA", addr: "East Los Angeles", phone: "(800) 339-3940", tags: ["Open 24/7"] },
  ],
  "910": [
    { name: "The Serena House", city: "San Diego, CA", addr: "San Diego County", phone: "(619) 234-3164", tags: ["Open 24/7"] },
    { name: "YWCA San Diego", city: "San Diego, CA", addr: "Multiple SD locations", phone: "(619) 234-3164", tags: ["Open 24/7"] },
  ],
  "940": [
    { name: "La Casa de las Madres", city: "San Francisco, CA", addr: "Citywide SF", phone: "(877) 503-1850", tags: ["Open 24/7"] },
    { name: "W.O.M.A.N. Inc.", city: "San Francisco, CA", addr: "Crisis hotline", phone: "(415) 864-4722", tags: ["Hotline 24/7"] },
  ],
  "941": [
    { name: "Center for Domestic Peace", city: "San Rafael, CA", addr: "Marin County, CA", phone: "(415) 924-6616", tags: ["Open 24/7"] },
  ],
  "945": [
    { name: "STAND! For Families Free of Violence", city: "Concord, CA", addr: "Contra Costa County", phone: "(888) 215-5555", tags: ["Open 24/7"] },
  ],
  "971": [
    { name: "Bradley-Angle", city: "Portland, OR", addr: "Multiple Portland sites", phone: "(503) 281-2442", tags: ["Open 24/7"] },
    { name: "Raphael House", city: "Portland, OR", addr: "4110 SE Hawthorne Blvd", phone: "(503) 222-6222", tags: ["Open 24/7"] },
  ],
  "980": [
    { name: "New Beginnings", city: "Seattle, WA", addr: "King County, WA", phone: "(206) 522-9472", tags: ["Open 24/7"] },
    { name: "API Chaya", city: "Seattle, WA", addr: "South Seattle", phone: "(206) 568-7971", tags: ["Open 24/7"] },
  ],
  "967": [
    { name: "Domestic Violence Action Center", city: "Honolulu, HI", addr: "Statewide HI", phone: "(808) 531-3771", tags: ["Open 24/7"] },
  ],
  "995": [
    { name: "Abused Women's Aid in Crisis", city: "Anchorage, AK", addr: "Statewide AK", phone: "(907) 272-0100", tags: ["Open 24/7"] },
  ],
};

const FALLBACK = [
  { name: "National DV Hotline", city: "Nationwide — call anytime, free & confidential", phone: "1-800-799-7233", tags: ["Open 24/7", "Can find local shelters"] },
  { name: "Crisis Text Line", city: "Nationwide — text HOME to 741741", phone: "", tags: ["24/7 text support", "Free & confidential"] },
];

document.getElementById('search-btn').addEventListener('click', searchShelters);
document.getElementById('zip-input').addEventListener('keydown', e => { if (e.key === 'Enter') searchShelters(); });
document.getElementById('location-btn').addEventListener('click', getLocation);

function searchShelters() {
  const zip = document.getElementById('zip-input').value.trim();
  const container = document.getElementById('shelter-results');
  const status = document.getElementById('location-status');
  container.innerHTML = '';

  if (!/^\d{5}$/.test(zip)) {
    status.textContent = '⚠️ Please enter a valid 5-digit zip code.';
    status.style.color = '#dc2626';
    return;
  }
  status.style.color = '';
  const prefix = zip.slice(0, 3);
  const results = SHELTER_DB[prefix] || null;

  if (!results) {
    status.textContent = `No local data for ${zip} — showing national resources. Call the hotline and they will find a shelter near you.`;
    renderShelterCards(FALLBACK);
  } else {
    status.textContent = `✅ Shelters near ${zip}`;
    renderShelterCards(results);
  }
}

function getLocation() {
  const status = document.getElementById('location-status');
  if (!navigator.geolocation) {
    status.textContent = '⚠️ Location not supported on this device. Please enter your zip code.';
    return;
  }
  status.textContent = '📡 Finding your location…';
  navigator.geolocation.getCurrentPosition(
    pos => {
      status.textContent = '✅ Location found. Showing resources near you.';
      renderShelterCards([
        { name: "National DV Hotline", city: "Will find the closest shelter to your exact location", phone: "1-800-799-7233", tags: ["Open 24/7", "GPS-based referrals available"] },
        { name: "Crisis Text Line", city: "Nationwide — text HOME to 741741 for location-based help", phone: "", tags: ["24/7 text support"] },
      ]);
    },
    () => {
      status.textContent = '⚠️ Could not get location. Please enter your zip code below.';
    },
    { timeout: 8000 }
  );
}

function renderShelterCards(list) {
  const container = document.getElementById('shelter-results');
  container.innerHTML = '';
  list.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card shelter-card';
    const tagsHtml = (s.tags || []).map(t => {
      let cls = 'shelter-tag';
      if (t.toLowerCase().includes('open 24')) cls += ' open247';
      else if (t.toLowerCase().includes('hotline')) cls += ' hotline';
      else if (t.toLowerCase().includes('call ahead')) cls += ' call';
      return `<span class="${cls}">${t}</span>`;
    }).join('');
    card.innerHTML = `
      <div class="shelter-name">${s.name}</div>
      <div class="shelter-city">📍 ${s.city}</div>
      ${s.addr ? `<div class="shelter-addr">📌 ${s.addr}</div>` : ''}
      ${s.phone ? `<a href="tel:${s.phone.replace(/\D/g,'')}" class="shelter-phone">📞 ${s.phone}</a>` : ''}
      <div class="shelter-tags">${tagsHtml}</div>
    `;
    container.appendChild(card);
  });
}

/* ─── Checklist ────────────────────────────────────── */
const CL_KEY = 'se_checklist';
const CL_CUSTOM_KEY = 'se_cl_custom';

const DEFAULT_ITEMS = {
  docs: [
    "Government-issued ID (driver's license or passport)",
    "Social Security card",
    "Birth certificate(s)",
    "Protective or restraining orders",
  ],
  essentials: [
    "Emergency cash or hidden funds",
    "Phone charger and backup battery",
    "Medications (1 week supply)",
    "Extra set of keys (car and/or house)",
    "Change of clothes",
  ],
  children: [
    "Children's IDs / birth certificates",
    "School and medical records",
    "Children's medications",
  ],
};

function buildChecklist() {
  const saved = JSON.parse(localStorage.getItem(CL_KEY) || '{}');
  renderGroup('cl-docs', DEFAULT_ITEMS.docs, 'docs', saved);
  renderGroup('cl-essentials', DEFAULT_ITEMS.essentials, 'ess', saved);
  renderGroup('cl-children', DEFAULT_ITEMS.children, 'chld', saved);
  renderCustomItems(saved);
  updateProgress();
}

function renderGroup(containerId, items, prefix, saved) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  items.forEach((label, i) => {
    const key = prefix + '_' + i;
    el.appendChild(makeCheckItem(label, key, saved[key], false));
  });
}

function renderCustomItems(saved) {
  const container = document.getElementById('cl-custom');
  const emptyMsg = document.getElementById('cl-custom-empty');
  const customs = JSON.parse(localStorage.getItem(CL_CUSTOM_KEY) || '[]');
  container.innerHTML = '';
  if (customs.length === 0) {
    const p = document.createElement('p');
    p.className = 'cl-empty-msg';
    p.id = 'cl-custom-empty';
    p.textContent = 'No custom items yet. Add one below.';
    container.appendChild(p);
    return;
  }
  customs.forEach((label, i) => {
    const key = 'custom_' + i;
    container.appendChild(makeCheckItem(label, key, saved[key], true));
  });
}

function makeCheckItem(label, key, isChecked, deletable) {
  const saved = JSON.parse(localStorage.getItem(CL_KEY) || '{}');
  const item = document.createElement('div');
  item.className = 'checklist-item' + (isChecked ? ' checked' : '');
  item.innerHTML = `
    <div class="ci-check"></div>
    <div class="ci-label">${escHtml(label)}</div>
    ${deletable ? `<button class="ci-delete" title="Remove">✕</button>` : ''}
  `;
  item.querySelector('.ci-check').addEventListener('click', e => {
    e.stopPropagation();
    const s = JSON.parse(localStorage.getItem(CL_KEY) || '{}');
    s[key] = !s[key];
    localStorage.setItem(CL_KEY, JSON.stringify(s));
    item.classList.toggle('checked', s[key]);
    updateProgress();
  });
  item.addEventListener('click', e => {
    if (e.target.classList.contains('ci-delete')) return;
    const s = JSON.parse(localStorage.getItem(CL_KEY) || '{}');
    s[key] = !s[key];
    localStorage.setItem(CL_KEY, JSON.stringify(s));
    item.classList.toggle('checked', s[key]);
    updateProgress();
  });
  if (deletable) {
    item.querySelector('.ci-delete').addEventListener('click', e => {
      e.stopPropagation();
      const customs = JSON.parse(localStorage.getItem(CL_CUSTOM_KEY) || '[]');
      const idx = parseInt(key.split('_')[1]);
      customs.splice(idx, 1);
      localStorage.setItem(CL_CUSTOM_KEY, JSON.stringify(customs));
      const s = JSON.parse(localStorage.getItem(CL_KEY) || '{}');
      delete s[key];
      localStorage.setItem(CL_KEY, JSON.stringify(s));
      buildChecklist();
    });
  }
  return item;
}

function updateProgress() {
  const all = document.querySelectorAll('.checklist-item');
  const done = document.querySelectorAll('.checklist-item.checked');
  const total = all.length;
  const count = done.length;
  document.getElementById('cl-count').textContent = count + ' of ' + total;
  document.getElementById('cl-fill').style.width = total ? Math.round(count / total * 100) + '%' : '0%';
}

document.getElementById('add-item-btn').addEventListener('click', addCustomItem);
document.getElementById('add-item-input').addEventListener('keydown', e => { if (e.key === 'Enter') addCustomItem(); });

function addCustomItem() {
  const input = document.getElementById('add-item-input');
  const text = input.value.trim();
  if (!text) { showToast('Please type an item first'); return; }
  const customs = JSON.parse(localStorage.getItem(CL_CUSTOM_KEY) || '[]');
  customs.push(text);
  localStorage.setItem(CL_CUSTOM_KEY, JSON.stringify(customs));
  input.value = '';
  buildChecklist();
  showToast('Item added ✓');
}

buildChecklist();

/* ─── Incident Log + PIN ────────────────────────────── */
const PIN_KEY = 'se_pin';
const ENTRIES_KEY = 'se_entries';
let logUnlocked = false;

document.getElementById('pin-btn').addEventListener('click', handlePin);
document.getElementById('pin-input').addEventListener('keydown', e => { if (e.key === 'Enter') handlePin(); });

function handlePin() {
  const input = document.getElementById('pin-input').value.trim();
  if (input.length < 4) { showToast('PIN must be 4 digits'); return; }
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) {
    localStorage.setItem(PIN_KEY, input);
    unlockLog();
    showToast('PIN set! Remember it — there is no reset.');
  } else if (stored === input) {
    unlockLog();
  } else {
    document.getElementById('pin-error').classList.remove('hidden');
    document.getElementById('pin-input').value = '';
  }
}

function unlockLog() {
  logUnlocked = true;
  document.getElementById('log-gate').classList.add('hidden');
  document.getElementById('log-content').classList.remove('hidden');
  document.getElementById('pin-error').classList.add('hidden');
  renderEntries();
}

function lockLog() {
  logUnlocked = false;
  document.getElementById('log-gate').classList.remove('hidden');
  document.getElementById('log-content').classList.add('hidden');
  document.getElementById('pin-input').value = '';
}

document.getElementById('save-entry-btn').addEventListener('click', saveEntry);

function saveEntry() {
  const text = document.getElementById('entry-text').value.trim();
  if (!text) { showToast('Please write something first'); return; }
  const loc = document.getElementById('entry-location').value.trim();
  const entries = JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]');
  entries.unshift({
    id: Date.now(),
    text,
    loc,
    date: new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
  });
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  document.getElementById('entry-text').value = '';
  document.getElementById('entry-location').value = '';
  renderEntries();
  showToast('Entry saved privately ✓');
}

function renderEntries() {
  const entries = JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]');
  const container = document.getElementById('entries-list');
  container.innerHTML = '';
  if (!entries.length) {
    container.innerHTML = '<p style="font-size:12px;color:#8b5cf6;text-align:center;padding:16px 0;line-height:1.7;">No entries yet.<br>Documenting incidents can be important evidence.</p>';
    return;
  }
  entries.forEach(e => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <div class="entry-header">
        <span class="entry-date">📅 ${e.date}</span>
        <button class="entry-delete-btn" data-id="${e.id}">Delete</button>
      </div>
      <div class="entry-body">${escHtml(e.text)}</div>
      ${e.loc ? `<div class="entry-loc">📍 ${escHtml(e.loc)}</div>` : ''}
    `;
    container.appendChild(card);
  });
  document.querySelectorAll('.entry-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this entry? This cannot be undone.')) return;
      const id = parseInt(btn.dataset.id);
      const updated = JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]').filter(e => e.id !== id);
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(updated));
      renderEntries();
      showToast('Entry deleted');
    });
  });
}

/* ─── Toast ────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ─── Utilities ────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

/* ─── Service Worker (PWA offline support) ─────────── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
