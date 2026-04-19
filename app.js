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
/* Keys = first 3 digits of zip. Add more as needed.    */
const SHELTER_DB = {
  /* ── New Jersey ── */
  "070": [
    { name: "Jersey Battered Women's Service", city: "Morris County, NJ", addr: "1 Morris County Plaza, Morristown, NJ", phone: "(973) 267-4763", tags: ["Open 24/7", "Walk-ins welcome"] },
    { name: "New Hope Foundation", city: "Plainfield, NJ", addr: "1 New Hope Dr, Bound Brook, NJ", phone: "(908) 754-6855", tags: ["Open 24/7", "Call ahead if possible"] },
    { name: "WISE Women's Center", city: "Somerset, NJ", addr: "WISE Crisis Helpline, Somerset County", phone: "(908) 355-2464", tags: ["Hotline 24/7", "Office 9am–7pm"] },
  ],
  "071": [
    { name: "HomeSafe Shelter NJ", city: "Newark, NJ", addr: "DV Crisis Center, Newark, NJ", phone: "(973) 759-2154", tags: ["Open 24/7"] },
    { name: "Catholic Charities DV Program", city: "Newark, NJ", addr: "Service center, Newark, NJ", phone: "(973) 596-4100", tags: ["Call ahead"] },
    { name: "Arrive NJ / Essex County DV", city: "Newark, NJ", addr: "Essex County, NJ", phone: "(973) 484-4446", tags: ["Open 24/7", "Walk-ins welcome"] },
  ],
  "072": [
    { name: "Center for Hope & Safety", city: "Ridgewood, NJ", addr: "Bergen County, NJ", phone: "(201) 444-7900", tags: ["Open 24/7", "Walk-ins welcome"] },
    { name: "Bergen County DV Hotline", city: "Bergen County, NJ", addr: "County-wide service", phone: "(201) 336-7575", tags: ["Hotline 24/7"] },
  ],
  "073": [
    { name: "WISE Women's Center", city: "Somerset, NJ", addr: "Somerset County, NJ", phone: "(908) 355-2464", tags: ["Hotline 24/7"] },
    { name: "Interfaith Neighbors DV", city: "Monmouth County, NJ", addr: "Monmouth County", phone: "(732) 440-5300", tags: ["Open 24/7"] },
  ],
  "074": [
    { name: "MOCEANS Center for Independent Living", city: "Ocean County, NJ", addr: "Ocean County, NJ", phone: "(800) 922-7233", tags: ["Hotline 24/7"] },
    { name: "Ocean DV Hotline", city: "Toms River, NJ", addr: "Ocean County, NJ", phone: "(732) 244-8259", tags: ["Open 24/7"] },
  ],
  "075": [
    { name: "HomeSafe – Mercer County", city: "Trenton, NJ", addr: "Mercer County, NJ", phone: "(609) 394-9000", tags: ["Open 24/7"] },
  ],
  "076": [
    { name: "YWCA Passaic County", city: "Paterson, NJ", addr: "112 Ward St, Paterson, NJ", phone: "(973) 881-0725", tags: ["Open 24/7", "Walk-ins welcome"] },
  ],
  "077": [
    { name: "Lunch Break / Monmouth DV", city: "Monmouth County, NJ", addr: "Monmouth County, NJ", phone: "(800) 672-7233", tags: ["Hotline 24/7"] },
  ],
  "078": [
    { name: "NORWESCAP DV Program", city: "Flemington, NJ", addr: "Hunterdon/Warren counties", phone: "(908) 788-4573", tags: ["Open 24/7"] },
  ],
  "079": [
    { name: "Family Violence Center – Sussex County", city: "Newton, NJ", addr: "Sussex County, NJ", phone: "(973) 875-1258", tags: ["Open 24/7"] },
  ],
  "080": [
    { name: "Providence House", city: "Burlington County, NJ", addr: "Burlington County, NJ", phone: "(609) 871-7551", tags: ["Open 24/7"] },
    { name: "Center for Family Services – DV", city: "Cherry Hill, NJ", addr: "Camden County, NJ", phone: "(856) 428-2333", tags: ["Open 24/7"] },
  ],
  "081": [
    { name: "Serv Centers of NJ", city: "Trenton/Mercer, NJ", addr: "Mercer County, NJ", phone: "(609) 394-2163", tags: ["Open 24/7"] },
  ],
  "082": [
    { name: "Salem County DV", city: "Salem, NJ", addr: "Salem County, NJ", phone: "(856) 935-6655", tags: ["Open 24/7"] },
  ],
  "083": [
    { name: "Cape May County DV", city: "Cape May Court House, NJ", addr: "Cape May County, NJ", phone: "(609) 522-6489", tags: ["Open 24/7"] },
  ],
  "084": [
    { name: "Cumberland/Gloucester DV", city: "Vineland, NJ", addr: "Cumberland County, NJ", phone: "(856) 691-5100", tags: ["Open 24/7"] },
  ],
  /* ── New York ── */
  "100": [
    { name: "Safe Horizon DV Hotline", city: "New York, NY", addr: "Multiple locations citywide", phone: "(800) 621-4673", tags: ["Open 24/7"] },
    { name: "YWCA NYC", city: "New York, NY", addr: "610 Lexington Ave, New York, NY", phone: "(212) 273-7800", tags: ["Call ahead"] },
    { name: "Urban Resource Institute", city: "Brooklyn, NY", addr: "Multiple boroughs, NYC", phone: "(800) 645-3434", tags: ["Open 24/7"] },
  ],
  "101": [
    { name: "Sanctuary for Families", city: "Manhattan, NY", addr: "P.O. Box 1406, New York, NY", phone: "(212) 349-6009", tags: ["Open 24/7"] },
    { name: "Safe Horizon – Manhattan", city: "New York, NY", addr: "Citywide crisis center", phone: "(800) 621-4673", tags: ["Open 24/7"] },
  ],
  "102": [
    { name: "Bronx DV Services", city: "Bronx, NY", addr: "Bronx, NY", phone: "(800) 621-4673", tags: ["Open 24/7"] },
  ],
  "103": [
    { name: "Staten Island DV Center", city: "Staten Island, NY", addr: "Staten Island, NY", phone: "(718) 720-6004", tags: ["Open 24/7"] },
  ],
  "104": [
    { name: "My Sisters' Place", city: "White Plains, NY", addr: "Westchester County, NY", phone: "(914) 683-1333", tags: ["Open 24/7"] },
    { name: "Safe Horizon – Yonkers", city: "Yonkers, NY", addr: "Westchester shelter", phone: "(800) 621-4673", tags: ["Open 24/7"] },
  ],
  "105": [
    { name: "My Sisters' Place – Rockland", city: "Rockland County, NY", addr: "Rockland County, NY", phone: "(845) 634-3344", tags: ["Open 24/7"] },
  ],
  "110": [
    { name: "Safe Horizon Queens", city: "Queens, NY", addr: "Queens crisis center, NY", phone: "(800) 621-4673", tags: ["Open 24/7"] },
    { name: "Sanctuary for Families – Queens", city: "Queens, NY", addr: "Queens legal services", phone: "(212) 349-6009", tags: ["Call ahead"] },
  ],
  "112": [
    { name: "The Retreat", city: "East Hampton, NY", addr: "Long Island shelter, NY", phone: "(631) 329-2200", tags: ["Open 24/7"] },
    { name: "Safe Center LI", city: "Westbury, NY", addr: "Nassau County, NY", phone: "(516) 542-0404", tags: ["Open 24/7"] },
  ],
  "114": [
    { name: "VIBS – Violence Intervention Program", city: "Hauppauge, NY", addr: "Suffolk County, NY", phone: "(631) 360-3606", tags: ["Open 24/7"] },
  ],
  /* ── Pennsylvania ── */
  "150": [
    { name: "Pittsburgh Action Against Rape", city: "Pittsburgh, PA", addr: "81 S 19th St, Pittsburgh, PA", phone: "(866) 363-7273", tags: ["Hotline 24/7"] },
    { name: "Women's Center & Shelter – Pittsburgh", city: "Pittsburgh, PA", addr: "Allegheny County, PA", phone: "(412) 687-8005", tags: ["Open 24/7"] },
  ],
  "191": [
    { name: "Women Against Abuse", city: "Philadelphia, PA", addr: "Multiple PA locations", phone: "(866) 723-3014", tags: ["Open 24/7"] },
    { name: "WOAR – Philadelphia", city: "Philadelphia, PA", addr: "Crisis center, Philadelphia", phone: "(215) 985-3333", tags: ["Hotline 24/7"] },
  ],
  "193": [
    { name: "A Woman's Place", city: "Doylestown, PA", addr: "Bucks County, PA", phone: "(800) 220-8116", tags: ["Open 24/7"] },
  ],
  /* ── Washington DC / Maryland / Virginia ── */
  "200": [
    { name: "HopeLink DV Services", city: "Washington, DC", addr: "NW DC", phone: "(202) 842-1056", tags: ["Open 24/7"] },
    { name: "Safe Shores DC", city: "Washington, DC", addr: "Multiple DC locations", phone: "(202) 842-1056", tags: ["Open 24/7"] },
    { name: "DC DV Hotline", city: "Washington, DC", addr: "Citywide, DC", phone: "(202) 347-2777", tags: ["Hotline 24/7"] },
  ],
  "201": [
    { name: "Doorways for Women & Families", city: "Arlington, VA", addr: "Arlington County, VA", phone: "(703) 237-0881", tags: ["Open 24/7"] },
  ],
  "212": [
    { name: "House of Ruth Maryland", city: "Baltimore, MD", addr: "2201 Argonne Dr, Baltimore, MD", phone: "(410) 889-7884", tags: ["Open 24/7", "Walk-ins welcome"] },
    { name: "TurnAround Inc.", city: "Baltimore, MD", addr: "Crisis hotline & shelter, Baltimore", phone: "(443) 279-0379", tags: ["Hotline 24/7"] },
  ],
  "220": [
    { name: "Loudoun Abused Women's Shelter", city: "Leesburg, VA", addr: "Loudoun County, VA", phone: "(703) 777-6552", tags: ["Open 24/7"] },
  ],
  "221": [
    { name: "ACTS (Alexandria DV)", city: "Alexandria, VA", addr: "Alexandria, VA", phone: "(703) 683-1741", tags: ["Open 24/7"] },
  ],
  /* ── Georgia / Southeast ── */
  "300": [
    { name: "Partnership Against DV", city: "Atlanta, GA", addr: "Fulton County, GA", phone: "(770) 963-9799", tags: ["Open 24/7"] },
    { name: "Safe House Outreach", city: "Atlanta, GA", addr: "Metro Atlanta area", phone: "(404) 615-0808", tags: ["Open 24/7"] },
  ],
  "303": [
    { name: "DeKalb County DV Intervention", city: "Decatur, GA", addr: "DeKalb County, GA", phone: "(404) 370-8060", tags: ["Open 24/7"] },
  ],
  "304": [
    { name: "Gateway Center – Atlanta DV", city: "Atlanta, GA", addr: "275 Pryor St SW, Atlanta, GA", phone: "(404) 588-4000", tags: ["Open 24/7"] },
  ],
  /* ── Florida ── */
  "328": [
    { name: "Harbor House of Central Florida", city: "Orlando, FL", addr: "Orange County, FL", phone: "(407) 886-2856", tags: ["Open 24/7"] },
    { name: "Serv Family Violence Prevention", city: "Orlando, FL", addr: "407 Mercy Dr, Orlando, FL", phone: "(407) 886-2856", tags: ["Open 24/7"] },
  ],
  "330": [
    { name: "The Shelter for Abused Women", city: "Naples, FL", addr: "Collier County, FL", phone: "(239) 775-1101", tags: ["Open 24/7"] },
  ],
  "331": [
    { name: "Safespace – Miami", city: "Miami, FL", addr: "Miami-Dade County", phone: "(305) 553-1100", tags: ["Open 24/7"] },
    { name: "Lotus House Women's Shelter", city: "Miami, FL", addr: "Overtown, Miami, FL", phone: "(305) 442-5700", tags: ["Open 24/7"] },
  ],
  "336": [
    { name: "Spring of Tampa Bay", city: "Tampa, FL", addr: "Hillsborough County, FL", phone: "(813) 247-7233", tags: ["Open 24/7"] },
  ],
  "337": [
    { name: "CASA (Community Action Stops Abuse)", city: "St. Petersburg, FL", addr: "Pinellas County, FL", phone: "(727) 895-4912", tags: ["Open 24/7"] },
  ],
  "342": [
    { name: "Peaceful Paths", city: "Gainesville, FL", addr: "Alachua County, FL", phone: "(352) 377-8255", tags: ["Open 24/7"] },
  ],
  "346": [
    { name: "Aid to Victims of DV", city: "Fort Lauderdale, FL", addr: "Broward County, FL", phone: "(954) 761-1133", tags: ["Open 24/7"] },
  ],
  /* ── Ohio ── */
  "432": [
    { name: "CHOICES (Columbus DV)", city: "Columbus, OH", addr: "Franklin County, OH", phone: "(614) 224-4663", tags: ["Open 24/7"] },
    { name: "YWCA Columbus", city: "Columbus, OH", addr: "65 S 4th St, Columbus, OH", phone: "(614) 224-4663", tags: ["Open 24/7"] },
  ],
  "441": [
    { name: "Templum House", city: "Toledo, OH", addr: "Lucas County, OH", phone: "(419) 241-3235", tags: ["Open 24/7"] },
  ],
  "452": [
    { name: "YWCA Cincinnati", city: "Cincinnati, OH", addr: "Hamilton County, OH", phone: "(513) 872-9259", tags: ["Open 24/7"] },
  ],
  "441": [
    { name: "Domestic Violence & Child Advocacy Center", city: "Cleveland, OH", addr: "Cuyahoga County, OH", phone: "(216) 391-4357", tags: ["Open 24/7"] },
  ],
  /* ── Michigan ── */
  "481": [
    { name: "HAVEN", city: "Pontiac, MI", addr: "Oakland County, MI", phone: "(248) 334-1274", tags: ["Open 24/7"] },
    { name: "CARE House", city: "Oakland County, MI", addr: "Crisis center, MI", phone: "(248) 332-7173", tags: ["Hotline 24/7"] },
  ],
  "482": [
    { name: "Detroit Rescue Mission DV", city: "Detroit, MI", addr: "Detroit, MI", phone: "(313) 993-4700", tags: ["Open 24/7"] },
    { name: "First Step (Wayne County DV)", city: "Plymouth, MI", addr: "Wayne County, MI", phone: "(734) 459-5900", tags: ["Open 24/7"] },
  ],
  "495": [
    { name: "YWCA West Central Michigan", city: "Grand Rapids, MI", addr: "25 Sheldon SE, Grand Rapids, MI", phone: "(616) 451-2744", tags: ["Open 24/7"] },
  ],
  /* ── Kentucky ── */
  "400": [
    { name: "YWCA Louisville", city: "Louisville, KY", addr: "604 S 3rd St, Louisville, KY", phone: "(502) 581-7222", tags: ["Open 24/7"] },
    { name: "Center for Women & Families", city: "Louisville, KY", addr: "Louisville Metro, KY", phone: "(502) 581-7222", tags: ["Open 24/7", "Walk-ins welcome"] },
  ],
  "406": [
    { name: "DOVES (Lexington DV)", city: "Lexington, KY", addr: "Fayette County, KY", phone: "(859) 253-2444", tags: ["Open 24/7"] },
  ],
  /* ── Illinois ── */
  "606": [
    { name: "Sarah's Inn", city: "Chicago, IL", addr: "Oak Park, IL", phone: "(708) 386-4225", tags: ["Open 24/7"] },
    { name: "YWCA Metropolitan Chicago", city: "Chicago, IL", addr: "Loop, Chicago, IL", phone: "(312) 372-6600", tags: ["Call ahead"] },
    { name: "Between Friends", city: "Chicago, IL", addr: "Citywide hotline, Chicago", phone: "(800) 603-4357", tags: ["Open 24/7"] },
  ],
  "607": [
    { name: "Connections for Abused Women (CAWI)", city: "Chicago, IL", addr: "N. Chicago, IL", phone: "(773) 278-4566", tags: ["Open 24/7"] },
  ],
  "608": [
    { name: "South Suburban Family Shelter", city: "Harvey, IL", addr: "Cook County, IL", phone: "(708) 335-3028", tags: ["Open 24/7"] },
  ],
  /* ── Minnesota ── */
  "612": [
    { name: "Day One Crisis Shelter", city: "Minneapolis, MN", addr: "Hennepin County, MN", phone: "(866) 223-1111", tags: ["Open 24/7"] },
    { name: "Casa de Esperanza", city: "St. Paul, MN", addr: "657 University Ave W, St. Paul, MN", phone: "(651) 772-1611", tags: ["Open 24/7"] },
  ],
  "551": [
    { name: "Southern MN Regional DV", city: "Rochester, MN", addr: "Olmsted County, MN", phone: "(507) 285-1010", tags: ["Open 24/7"] },
  ],
  /* ── Wisconsin ── */
  "531": [
    { name: "Sojourner Family Peace Center", city: "Milwaukee, WI", addr: "Milwaukee County, WI", phone: "(414) 933-2722", tags: ["Open 24/7"] },
    { name: "UMOS DV Program", city: "Milwaukee, WI", addr: "Milwaukee, WI", phone: "(414) 389-6510", tags: ["Open 24/7"] },
  ],
  "537": [
    { name: "Domestic Abuse Intervention Svcs", city: "Madison, WI", addr: "Dane County, WI", phone: "(608) 251-4445", tags: ["Open 24/7"] },
  ],
  "631": [
    { name: "Voices Against Violence", city: "Wausau, WI", addr: "Marathon County, WI", phone: "(715) 842-7323", tags: ["Open 24/7"] },
  ],
  /* ── Iowa ── */
  "641": [
    { name: "Iowa DV Hotline", city: "Des Moines, IA", addr: "Statewide service", phone: "(800) 942-0333", tags: ["Open 24/7"] },
    { name: "Polk County Crisis & Advocacy", city: "Des Moines, IA", addr: "Des Moines, IA", phone: "(515) 286-3600", tags: ["Open 24/7"] },
  ],
  /* ── North Dakota ── */
  "701": [
    { name: "Abuse and Rape Crisis Shelter", city: "Fargo, ND", addr: "Cass County, ND", phone: "(701) 293-7273", tags: ["Open 24/7"] },
  ],
  /* ── Texas ── */
  "750": [
    { name: "Family Place", city: "Dallas, TX", addr: "6500 Greenville Ave, Dallas, TX", phone: "(214) 823-1343", tags: ["Open 24/7"] },
    { name: "Genesis Women's Shelter", city: "Dallas, TX", addr: "Multiple Dallas sites", phone: "(214) 946-4357", tags: ["Open 24/7"] },
  ],
  "751": [
    { name: "SafeHaven of Tarrant County", city: "Fort Worth, TX", addr: "Tarrant County, TX", phone: "(877) 701-7233", tags: ["Open 24/7"] },
  ],
  "770": [
    { name: "Houston Area Women's Center", city: "Houston, TX", addr: "1010 Waugh Dr, Houston, TX", phone: "(713) 528-2121", tags: ["Open 24/7"] },
    { name: "The Bridge Over Troubled Waters", city: "Houston, TX", addr: "Harris County, TX", phone: "(713) 473-2801", tags: ["Open 24/7"] },
  ],
  "782": [
    { name: "BCFS Crisis Shelter – San Antonio", city: "San Antonio, TX", addr: "Bexar County, TX", phone: "(210) 930-3669", tags: ["Open 24/7"] },
    { name: "WINGS (SA DV Program)", city: "San Antonio, TX", addr: "San Antonio, TX", phone: "(800) 221-7036", tags: ["Open 24/7"] },
  ],
  "787": [
    { name: "SafePlace Austin", city: "Austin, TX", addr: "Travis County, TX", phone: "(512) 267-7233", tags: ["Open 24/7"] },
    { name: "Austin DV Shelter – DV Hotline TX", city: "Austin, TX", addr: "Austin, TX", phone: "(800) 799-7233", tags: ["Hotline 24/7"] },
  ],
  /* ── Colorado ── */
  "800": [
    { name: "SafeHouse Denver", city: "Denver, CO", addr: "Multiple Denver sites", phone: "(303) 318-9989", tags: ["Open 24/7"] },
    { name: "Safehouse Progressive Alliance", city: "Boulder, CO", addr: "Boulder County, CO", phone: "(303) 449-8623", tags: ["Open 24/7"] },
  ],
  "809": [
    { name: "Teller Women's Crisis & Family Outreach", city: "Colorado Springs, CO", addr: "El Paso County, CO", phone: "(719) 633-3819", tags: ["Open 24/7"] },
  ],
  /* ── Utah ── */
  "841": [
    { name: "YWCA Utah", city: "Salt Lake City, UT", addr: "322 E 300 S, Salt Lake City, UT", phone: "(801) 537-8600", tags: ["Open 24/7"] },
    { name: "Utah DV Hotline", city: "Salt Lake City, UT", addr: "Statewide, UT", phone: "(800) 897-5465", tags: ["Hotline 24/7"] },
  ],
  /* ── Arizona ── */
  "852": [
    { name: "Sojourner Center", city: "Phoenix, AZ", addr: "Maricopa County, AZ", phone: "(602) 244-0989", tags: ["Open 24/7"] },
    { name: "UMOM New Day Centers", city: "Phoenix, AZ", addr: "Multiple AZ locations", phone: "(602) 263-6232", tags: ["Call ahead"] },
  ],
  "857": [
    { name: "Emerge! Center Against DV", city: "Tucson, AZ", addr: "Pima County, AZ", phone: "(520) 795-4266", tags: ["Open 24/7"] },
  ],
  /* ── Nevada ── */
  "891": [
    { name: "Safe Nest Las Vegas", city: "Las Vegas, NV", addr: "Clark County, NV", phone: "(702) 646-4981", tags: ["Open 24/7"] },
    { name: "SafeHouse of Las Vegas", city: "Las Vegas, NV", addr: "Las Vegas, NV", phone: "(702) 385-0072", tags: ["Open 24/7"] },
  ],
  /* ── California ── */
  "900": [
    { name: "Peace Over Violence", city: "Los Angeles, CA", addr: "605 W Olympic Blvd, Los Angeles, CA", phone: "(213) 626-3393", tags: ["Open 24/7"] },
    { name: "YWCA Greater LA", city: "Los Angeles, CA", addr: "Southwest LA, CA", phone: "(213) 365-3925", tags: ["Call ahead"] },
    { name: "A Safe Place Shelter", city: "East LA, CA", addr: "East Los Angeles, CA", phone: "(800) 339-3940", tags: ["Open 24/7"] },
  ],
  "902": [
    { name: "Step Up on Second", city: "Santa Monica, CA", addr: "Los Angeles County, CA", phone: "(310) 394-6889", tags: ["Call ahead"] },
    { name: "Peace Over Violence – West LA", city: "West Los Angeles, CA", addr: "West LA, CA", phone: "(310) 392-8381", tags: ["Open 24/7"] },
  ],
  "907": [
    { name: "Casa de las Madres – LA", city: "Los Angeles, CA", addr: "Los Angeles County, CA", phone: "(800) 339-3940", tags: ["Open 24/7"] },
  ],
  "908": [
    { name: "Interface Children & Family Services", city: "Camarillo, CA", addr: "Ventura County, CA", phone: "(800) 339-9597", tags: ["Open 24/7"] },
  ],
  "910": [
    { name: "The Serena House", city: "San Diego, CA", addr: "San Diego County, CA", phone: "(619) 234-3164", tags: ["Open 24/7"] },
    { name: "YWCA San Diego", city: "San Diego, CA", addr: "Multiple SD locations", phone: "(619) 234-3164", tags: ["Open 24/7"] },
  ],
  "920": [
    { name: "Becky's House (SD DV Shelter)", city: "San Diego, CA", addr: "San Diego, CA", phone: "(619) 234-3164", tags: ["Open 24/7"] },
  ],
  "926": [
    { name: "Human Options", city: "Orange County, CA", addr: "Orange County, CA", phone: "(949) 737-5242", tags: ["Open 24/7"] },
  ],
  "927": [
    { name: "Laura's House", city: "Aliso Viejo, CA", addr: "South Orange County, CA", phone: "(949) 498-1511", tags: ["Open 24/7"] },
  ],
  "928": [
    { name: "YWCA Riverside", city: "Riverside, CA", addr: "Riverside County, CA", phone: "(951) 687-9922", tags: ["Open 24/7"] },
  ],
  "932": [
    { name: "Alliance Against Family Violence", city: "Bakersfield, CA", addr: "Kern County, CA", phone: "(661) 327-1091", tags: ["Open 24/7"] },
  ],
  "936": [
    { name: "Marjaree Mason Center", city: "Fresno, CA", addr: "Fresno County, CA", phone: "(559) 237-4706", tags: ["Open 24/7"] },
  ],
  "940": [
    { name: "La Casa de las Madres", city: "San Francisco, CA", addr: "Citywide SF, CA", phone: "(877) 503-1850", tags: ["Open 24/7"] },
    { name: "W.O.M.A.N. Inc.", city: "San Francisco, CA", addr: "Crisis hotline, SF", phone: "(415) 864-4722", tags: ["Hotline 24/7"] },
  ],
  "941": [
    { name: "Center for Domestic Peace", city: "San Rafael, CA", addr: "Marin County, CA", phone: "(415) 924-6616", tags: ["Open 24/7"] },
  ],
  "943": [
    { name: "YWCA Silicon Valley", city: "San Jose, CA", addr: "Santa Clara County, CA", phone: "(408) 295-4011", tags: ["Open 24/7"] },
    { name: "Next Door Solutions", city: "San Jose, CA", addr: "San Jose, CA", phone: "(408) 279-7550", tags: ["Open 24/7"] },
  ],
  "944": [
    { name: "YWCA East Bay", city: "Oakland, CA", addr: "Alameda County, CA", phone: "(510) 992-9392", tags: ["Open 24/7"] },
  ],
  "945": [
    { name: "STAND! For Families Free of Violence", city: "Concord, CA", addr: "Contra Costa County, CA", phone: "(888) 215-5555", tags: ["Open 24/7"] },
  ],
  /* ── Oregon ── */
  "971": [
    { name: "Bradley-Angle", city: "Portland, OR", addr: "Multiple Portland sites, OR", phone: "(503) 281-2442", tags: ["Open 24/7"] },
    { name: "Raphael House", city: "Portland, OR", addr: "4110 SE Hawthorne Blvd, Portland, OR", phone: "(503) 222-6222", tags: ["Open 24/7"] },
  ],
  "974": [
    { name: "WEAVE – Womenspace", city: "Eugene, OR", addr: "Lane County, OR", phone: "(541) 485-6513", tags: ["Open 24/7"] },
  ],
  /* ── Washington State ── */
  "980": [
    { name: "New Beginnings", city: "Seattle, WA", addr: "King County, WA", phone: "(206) 522-9472", tags: ["Open 24/7"] },
    { name: "API Chaya", city: "Seattle, WA", addr: "South Seattle, WA", phone: "(206) 568-7971", tags: ["Open 24/7"] },
  ],
  "982": [
    { name: "YWCA Tacoma / Pierce County", city: "Tacoma, WA", addr: "Pierce County, WA", phone: "(253) 383-2593", tags: ["Open 24/7"] },
  ],
  "986": [
    { name: "YWCA Spokane", city: "Spokane, WA", addr: "Spokane County, WA", phone: "(509) 326-2255", tags: ["Open 24/7"] },
  ],
  /* ── Hawaii ── */
  "967": [
    { name: "Domestic Violence Action Center", city: "Honolulu, HI", addr: "Statewide HI", phone: "(808) 531-3771", tags: ["Open 24/7"] },
  ],
  /* ── Alaska ── */
  "995": [
    { name: "Abused Women's Aid in Crisis", city: "Anchorage, AK", addr: "Statewide AK", phone: "(907) 272-0100", tags: ["Open 24/7"] },
  ],
  /* ── Massachusetts ── */
  "021": [
    { name: "Rosie's Place", city: "Boston, MA", addr: "889 Harrison Ave, Boston, MA", phone: "(617) 442-9322", tags: ["Open 24/7"] },
    { name: "Casa Myrna", city: "Boston, MA", addr: "Greater Boston area, MA", phone: "(800) 992-2600", tags: ["Open 24/7"] },
  ],
  "024": [
    { name: "REACH Beyond DV", city: "Waltham, MA", addr: "Middlesex County, MA", phone: "(800) 899-4000", tags: ["Open 24/7"] },
  ],
  "018": [
    { name: "Healing Abuse Working for Change (HAWC)", city: "Salem, MA", addr: "Essex County, MA", phone: "(978) 744-8552", tags: ["Open 24/7"] },
  ],
  /* ── Connecticut ── */
  "060": [
    { name: "YWCA Hartford", city: "Hartford, CT", addr: "Hartford County, CT", phone: "(860) 547-1550", tags: ["Open 24/7"] },
    { name: "Interval House", city: "Hartford, CT", addr: "50 Vine St, Hartford, CT", phone: "(860) 527-0550", tags: ["Open 24/7"] },
  ],
  "065": [
    { name: "Safe Haven of Greater Waterbury", city: "Waterbury, CT", addr: "Litchfield/New Haven counties", phone: "(203) 575-0036", tags: ["Open 24/7"] },
  ],
  "068": [
    { name: "YWCA Greenwich", city: "Greenwich, CT", addr: "Fairfield County, CT", phone: "(203) 622-0003", tags: ["Open 24/7"] },
  ],
  /* ── Rhode Island ── */
  "029": [
    { name: "Sojourner House", city: "Providence, RI", addr: "Providence County, RI", phone: "(401) 765-3232", tags: ["Open 24/7"] },
    { name: "Day One RI", city: "Providence, RI", addr: "Statewide, RI", phone: "(800) 494-8100", tags: ["Hotline 24/7"] },
  ],
  /* ── North Carolina ── */
  "272": [
    { name: "Interact", city: "Raleigh, NC", addr: "Wake County, NC", phone: "(919) 828-7740", tags: ["Open 24/7"] },
  ],
  "282": [
    { name: "Safe Alliance Charlotte", city: "Charlotte, NC", addr: "Mecklenburg County, NC", phone: "(704) 332-2513", tags: ["Open 24/7"] },
  ],
  /* ── South Carolina ── */
  "291": [
    { name: "My Sister's House", city: "Charleston, SC", addr: "Charleston County, SC", phone: "(843) 744-3242", tags: ["Open 24/7"] },
  ],
  "292": [
    { name: "Safe Homes Rape Crisis Coalition", city: "Spartanburg, SC", addr: "Upstate SC", phone: "(864) 583-9803", tags: ["Open 24/7"] },
  ],
  /* ── Tennessee ── */
  "370": [
    { name: "Renewal House", city: "Nashville, TN", addr: "Davidson County, TN", phone: "(615) 321-4824", tags: ["Open 24/7"] },
    { name: "YWCA Nashville & Mid-TN", city: "Nashville, TN", addr: "Nashville, TN", phone: "(615) 269-9922", tags: ["Open 24/7"] },
  ],
  "378": [
    { name: "YWCA Chattanooga", city: "Chattanooga, TN", addr: "Hamilton County, TN", phone: "(423) 755-2700", tags: ["Open 24/7"] },
  ],
  /* ── Missouri ── */
  "631": [
    { name: "Safe Connections", city: "St. Louis, MO", addr: "St. Louis County, MO", phone: "(314) 531-2003", tags: ["Open 24/7"] },
  ],
  "641": [
    { name: "YWCA Kansas City", city: "Kansas City, MO", addr: "Jackson County, MO", phone: "(816) 931-9922", tags: ["Open 24/7"] },
  ],
  /* ── Indiana ── */
  "462": [
    { name: "Prevail (Marion County DV)", city: "Indianapolis, IN", addr: "Marion County, IN", phone: "(317) 634-6341", tags: ["Open 24/7"] },
    { name: "Beacon of Hope Crisis Center", city: "Indianapolis, IN", addr: "Indianapolis, IN", phone: "(317) 731-6140", tags: ["Open 24/7"] },
  ],
};

/* ─── Fallback (shown when no local data exists) ─── */
const FALLBACK = [
  { name: "National DV Hotline", city: "Nationwide — call anytime, free & confidential", addr: "thehotline.org — online chat available", phone: "1-800-799-7233", tags: ["Open 24/7", "Can find local shelters"] },
  { name: "Crisis Text Line", city: "Nationwide — text HOME to 741741", addr: "Available in English & Spanish", phone: "", tags: ["24/7 text support", "Free & confidential"] },
  { name: "Safe Horizon Hotline", city: "Nationwide emergency referrals", addr: "safehorizon.org", phone: "(800) 621-4673", tags: ["Open 24/7", "Referrals to local shelters"] },
];

/* ─── Helper: look up DB with fuzzy matching ────── */
/* Tries exact 3-digit prefix, then first 2 digits   */
function lookupShelters(zip) {
  const p3 = zip.slice(0, 3);
  const p2 = zip.slice(0, 2);
  if (SHELTER_DB[p3]) return { results: SHELTER_DB[p3], matched: true };
  // Try all DB keys that start with same first 2 digits (nearby zips)
  const nearby = Object.keys(SHELTER_DB)
    .filter(k => k.startsWith(p2))
    .flatMap(k => SHELTER_DB[k]);
  if (nearby.length) return { results: nearby.slice(0, 3), matched: true, approximate: true };
  return { results: null, matched: false };
}

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

  const { results, matched, approximate } = lookupShelters(zip);

  if (!matched) {
    status.textContent = `No local listings for ${zip} yet — showing national hotlines. They will connect you to a shelter near you.`;
    renderShelterCards(FALLBACK);
  } else if (approximate) {
    status.textContent = `📍 Nearby shelters for zip ${zip}`;
    renderShelterCards(results);
  } else {
    status.textContent = `✅ Shelters near zip ${zip}`;
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
      const { latitude, longitude } = pos.coords;
      // Reverse geocode using free nominatim API to get zip code
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        .then(r => r.json())
        .then(data => {
          const zip = data.address && (data.address.postcode || '').replace(/\D/g, '').slice(0, 5);
          if (zip && zip.length === 5) {
            document.getElementById('zip-input').value = zip;
            const { results, matched, approximate } = lookupShelters(zip);
            if (matched) {
              status.textContent = `📍 Shelters near your location (zip ${zip})`;
              renderShelterCards(results);
            } else {
              status.textContent = `📍 Location found (zip ${zip}) — showing national resources. Call the hotline for local referrals.`;
              renderShelterCards(FALLBACK);
            }
          } else {
            status.textContent = '📍 Location found — showing national resources. Call for local referrals.';
            renderShelterCards(FALLBACK);
          }
        })
        .catch(() => {
          status.textContent = '📍 Location found — showing national resources. Call for local referrals.';
          renderShelterCards(FALLBACK);
        });
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
  list.slice(0, 3).forEach(s => {
    const card = document.createElement('div');
    card.className = 'card shelter-card';
    const tagsHtml = (s.tags || []).map(t => {
      let cls = 'shelter-tag';
      if (t.toLowerCase().includes('open 24')) cls += ' open247';
      else if (t.toLowerCase().includes('hotline')) cls += ' hotline';
      else if (t.toLowerCase().includes('call ahead')) cls += ' call';
      return `<span class="${cls}">${t}</span>`;
    }).join('');
    const mapsUrl = s.addr
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.addr)}`
      : '';
    card.innerHTML = `
      <div class="shelter-name">${escHtml(s.name)}</div>
      <div class="shelter-city">📍 ${escHtml(s.city)}</div>
      ${s.addr ? `<a href="${mapsUrl}" target="_blank" rel="noopener" class="shelter-addr">🗺️ ${escHtml(s.addr)}</a>` : ''}
      <div class="shelter-tags" style="margin-bottom:10px;">${tagsHtml}</div>
      ${s.phone ? `<a href="tel:${s.phone.replace(/\D/g,'')}" class="shelter-call-btn">📞 Call ${escHtml(s.phone)}</a>` : ''}
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
