const STORAGE_KEYS = {
  checklist: "safeexit-checklist",
  logEntries: "safeexit-log-entries",
  logDraft: "safeexit-log-draft",
  activeTab: "safeexit-active-tab"
};

const affirmations = [
  "You deserve safety, privacy, and support today.",
  "Small steps still count. Opening this app was one of them.",
  "What happened to you is real, and your record matters.",
  "You are allowed to make a plan before anyone else understands it.",
  "Your safety can come first, even if everything feels urgent."
];

const emergencyResources = [
  {
    name: "National Domestic Violence Hotline",
    subtitle: "24/7 phone and chat support",
    distanceLabel: "United States",
    phone: "1-800-799-7233",
    website: "https://www.thehotline.org",
    maps: "https://www.thehotline.org"
  },
  {
    name: "Text START to 88788",
    subtitle: "Text support if calling is unsafe",
    distanceLabel: "United States",
    phone: "88788",
    website: "https://www.thehotline.org/get-help/domestic-violence-local-resources/",
    maps: "https://www.thehotline.org"
  }
];

const checklistTemplate = [
  {
    title: "Documents",
    items: [
      "Government-issued ID",
      "Social Security card",
      "Birth certificate",
      "Protective or restraining orders"
    ]
  },
  {
    title: "Essentials",
    items: [
      "Emergency cash or hidden card",
      "Phone charger and backup battery",
      "Medications (1 week supply)",
      "Extra set of keys"
    ]
  },
  {
    title: "Safety planning",
    items: [
      "Trusted contact knows my code word",
      "Transportation option identified",
      "Important numbers memorized or written down",
      "Bag location chosen"
    ]
  }
];

const state = {
  checklist: loadJSON(STORAGE_KEYS.checklist, {}),
  logEntries: loadJSON(STORAGE_KEYS.logEntries, []),
  currentCoords: null,
  currentLocationLabel: "",
  lastLocationLookupSource: ""
};

const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".panel");
const affirmationText = document.getElementById("affirmationText");
const checklistGroups = document.getElementById("checklistGroups");
const checklistCount = document.getElementById("checklistCount");
const checklistTotal = document.getElementById("checklistTotal");
const logEntriesContainer = document.getElementById("logEntries");
const incidentText = document.getElementById("incidentText");
const incidentLocation = document.getElementById("incidentLocation");
const draftStatus = document.getElementById("draftStatus");
const logForm = document.getElementById("logForm");
const callButton = document.getElementById("callButton");
const safeExitButton = document.getElementById("safeExitButton");
const decoyScreen = document.getElementById("decoyScreen");
const returnToAppButton = document.getElementById("returnToAppButton");
const useLocationButton = document.getElementById("useLocationButton");
const attachCurrentLocationButton = document.getElementById("attachCurrentLocationButton");
const locationStatus = document.getElementById("locationStatus");
const resourceResults = document.getElementById("resourceResults");
const zipForm = document.getElementById("zipForm");
const zipInput = document.getElementById("zipInput");

initializeApp();

function initializeApp() {
  rotateAffirmation();
  renderChecklist();
  hydrateDraft();
  renderLogEntries();
  renderEmergencyResources();
  restoreTab();
  bindEvents();
}

function bindEvents() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.tabTarget));
  });

  document.querySelectorAll("[data-jump-tab]").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.jumpTab));
  });

  checklistGroups.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
      return;
    }

    state.checklist[event.target.name] = event.target.checked;
    saveJSON(STORAGE_KEYS.checklist, state.checklist);
    updateChecklistProgress();
  });

  incidentText.addEventListener("input", persistDraft);
  incidentLocation.addEventListener("input", persistDraft);

  logForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveLogEntry();
  });

  safeExitButton.addEventListener("click", showDecoyScreen);
  returnToAppButton.addEventListener("click", hideDecoyScreen);

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "h" && event.shiftKey) {
      showDecoyScreen();
    }
  });

  callButton.addEventListener("click", () => {
    window.location.href = "tel:18007997233";
  });

  useLocationButton.addEventListener("click", () => {
    locateUserAndSearch();
  });

  attachCurrentLocationButton.addEventListener("click", async () => {
    await populateCurrentLocationField();
  });

  zipForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const zip = zipInput.value.trim();
    if (!/^\d{5}$/.test(zip)) {
      setStatus(locationStatus, "Enter a valid 5-digit ZIP code.");
      return;
    }

    await searchByZip(zip);
  });
}

function rotateAffirmation() {
  const selected = affirmations[Math.floor(Math.random() * affirmations.length)];
  affirmationText.textContent = selected;
}

function activateTab(panelId) {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tabTarget === panelId;
    tab.classList.toggle("active", isActive);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === panelId);
  });

  localStorage.setItem(STORAGE_KEYS.activeTab, panelId);
}

function restoreTab() {
  const savedTab = localStorage.getItem(STORAGE_KEYS.activeTab);
  if (savedTab && document.getElementById(savedTab)) {
    activateTab(savedTab);
  }
}

function renderChecklist() {
  checklistGroups.innerHTML = checklistTemplate
    .map((group, groupIndex) => {
      const listItems = group.items.map((item, itemIndex) => {
        const key = `${groupIndex}-${itemIndex}`;
        const isChecked = Boolean(state.checklist[key]);

        return `
          <li class="checklist-item">
            <label>
              <input type="checkbox" name="${key}" ${isChecked ? "checked" : ""}>
              <span>${escapeHtml(item)}</span>
            </label>
          </li>
        `;
      }).join("");

      return `
        <section class="checklist-group">
          <p class="label">${group.title}</p>
          <h3>${escapeHtml(group.title)}</h3>
          <ul>${listItems}</ul>
        </section>
      `;
    })
    .join("");

  updateChecklistProgress();
}

function updateChecklistProgress() {
  const total = checklistTemplate.reduce((sum, group) => sum + group.items.length, 0);
  const checked = Object.values(state.checklist).filter(Boolean).length;
  checklistCount.textContent = String(checked);
  checklistTotal.textContent = String(total);
}

function hydrateDraft() {
  const draft = loadJSON(STORAGE_KEYS.logDraft, {
    text: "",
    location: ""
  });

  incidentText.value = draft.text || "";
  incidentLocation.value = draft.location || "";

  if (draft.text || draft.location) {
    setStatus(draftStatus, `Draft restored from ${new Date().toLocaleString()}.`);
  }
}

function persistDraft() {
  const draft = {
    text: incidentText.value,
    location: incidentLocation.value
  };

  saveJSON(STORAGE_KEYS.logDraft, draft);
  setStatus(draftStatus, `Draft auto-saved at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`);
}

function saveLogEntry() {
  const text = incidentText.value.trim();
  const location = incidentLocation.value.trim();

  if (!text) {
    setStatus(draftStatus, "Write a short note before saving.");
    return;
  }

  const entry = {
    id: createEntryId(),
    text,
    location,
    createdAt: new Date().toISOString()
  };

  state.logEntries.unshift(entry);
  saveJSON(STORAGE_KEYS.logEntries, state.logEntries);

  incidentText.value = "";
  incidentLocation.value = "";
  saveJSON(STORAGE_KEYS.logDraft, { text: "", location: "" });

  renderLogEntries();
  setStatus(draftStatus, `Entry saved at ${new Date(entry.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`);
}

function renderLogEntries() {
  if (state.logEntries.length === 0) {
    logEntriesContainer.innerHTML = `
      <article class="log-entry">
        <p class="label">No saved entries yet</p>
        <p class="small-note">When you save an incident, it appears here and stays in browser storage on this device.</p>
      </article>
    `;
    return;
  }

  logEntriesContainer.innerHTML = state.logEntries.map((entry) => `
    <article class="log-entry">
      <p class="label">${formatDate(entry.createdAt)}</p>
      <div class="entry-meta">
        <span>${formatTime(entry.createdAt)}</span>
        ${entry.location ? `<span>${escapeHtml(entry.location)}</span>` : ""}
      </div>
      <p>${escapeHtml(entry.text)}</p>
    </article>
  `).join("");
}

function showDecoyScreen() {
  document.title = "Study Planner";
  decoyScreen.classList.remove("hidden");
  decoyScreen.setAttribute("aria-hidden", "false");
}

function hideDecoyScreen() {
  document.title = "SafeExit";
  decoyScreen.classList.add("hidden");
  decoyScreen.setAttribute("aria-hidden", "true");
}

async function populateCurrentLocationField() {
  try {
    setStatus(draftStatus, "Requesting current location...");
    const coords = await getCurrentPosition();
    state.currentCoords = coords;

    const label = await reverseGeocode(coords.latitude, coords.longitude);
    state.currentLocationLabel = label;
    incidentLocation.value = label || `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
    persistDraft();
  } catch (error) {
    setStatus(draftStatus, error.message || "Unable to get current location.");
  }
}

async function locateUserAndSearch() {
  try {
    setStatus(locationStatus, "Requesting current location...");
    const coords = await getCurrentPosition();
    state.currentCoords = coords;
    state.lastLocationLookupSource = "current location";

    const label = await reverseGeocode(coords.latitude, coords.longitude);
    state.currentLocationLabel = label;
    setStatus(locationStatus, `Searching near ${label || `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`}.`);

    const results = await findNearbyResources(coords.latitude, coords.longitude);
    renderResourceResults(results, label);
  } catch (error) {
    setStatus(locationStatus, error.message || "Unable to search by current location.");
    renderEmergencyResources();
  }
}

async function searchByZip(zip) {
  try {
    setStatus(locationStatus, `Finding ZIP ${zip}...`);
    const coords = await geocodeZip(zip);
    state.currentCoords = coords;
    state.lastLocationLookupSource = zip;

    const label = await reverseGeocode(coords.latitude, coords.longitude);
    state.currentLocationLabel = label || `ZIP ${zip}`;
    setStatus(locationStatus, `Searching near ${state.currentLocationLabel}.`);

    const results = await findNearbyResources(coords.latitude, coords.longitude);
    renderResourceResults(results, state.currentLocationLabel);
  } catch (error) {
    setStatus(locationStatus, error.message || "ZIP code search failed.");
    renderEmergencyResources();
  }
}

function renderEmergencyResources() {
  renderResourceCards(emergencyResources, "National resources");
}

function renderResourceResults(results, areaLabel) {
  if (!results.length) {
    setStatus(locationStatus, `No nearby shelter records were returned for ${areaLabel || "this area"}. Showing national options instead.`);
    renderEmergencyResources();
    return;
  }

  renderResourceCards(results, areaLabel ? `Results near ${areaLabel}` : "Nearby resources");
}

function renderResourceCards(resources, heading) {
  const cards = resources.map((resource) => {
    const mapsLink = resource.maps || buildMapsSearchLink(resource.name, state.currentCoords);
    const websiteLink = resource.website || mapsLink;

    return `
      <article class="resource-card">
        <p class="label">${escapeHtml(heading)}</p>
        <h3>${escapeHtml(resource.name)}</h3>
        ${resource.subtitle ? `<p>${escapeHtml(resource.subtitle)}</p>` : ""}
        <div class="resource-meta">
          ${resource.distanceLabel ? `<span>${escapeHtml(resource.distanceLabel)}</span>` : ""}
          ${resource.phone ? `<span>${escapeHtml(resource.phone)}</span>` : ""}
        </div>
        <div class="resource-links">
          ${resource.phone ? `<a class="resource-link" href="tel:${resource.phone.replace(/[^0-9]/g, "")}">Call</a>` : ""}
          <a class="resource-link" href="${websiteLink}" target="_blank" rel="noreferrer">Open</a>
          <a class="resource-link" href="${mapsLink}" target="_blank" rel="noreferrer">Directions</a>
        </div>
      </article>
    `;
  }).join("");

  resourceResults.innerHTML = cards;
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("This browser does not support geolocation."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        const messages = {
          1: "Location permission was denied. You can still search by ZIP code.",
          2: "The browser could not determine a location.",
          3: "Location request timed out."
        };
        reject(new Error(messages[error.code] || "Location request failed."));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000
      }
    );
  });
}

async function reverseGeocode(latitude, longitude) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
    {
      headers: {
        Accept: "application/json"
      }
    }
  );

  if (!response.ok) {
    return "";
  }

  const data = await response.json();
  const address = data.address || {};
  const locality = address.city || address.town || address.village || address.county || "";
  const region = address.state || "";
  const postcode = address.postcode || "";
  return [locality, region, postcode].filter(Boolean).join(", ");
}

async function geocodeZip(zip) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&country=USA&postalcode=${zip}`,
    {
      headers: {
        Accept: "application/json"
      }
    }
  );

  if (!response.ok) {
    throw new Error("ZIP code search is unavailable right now.");
  }

  const results = await response.json();
  if (!results.length) {
    throw new Error("No location found for that ZIP code.");
  }

  return {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon)
  };
}

async function findNearbyResources(latitude, longitude) {
  const radiusMeters = 40000;
  const query = `
    [out:json][timeout:25];
    (
      node["social_facility"="shelter"](around:${radiusMeters},${latitude},${longitude});
      node["amenity"="social_facility"](around:${radiusMeters},${latitude},${longitude});
      node["amenity"="shelter"](around:${radiusMeters},${latitude},${longitude});
      node["office"="social_service"](around:${radiusMeters},${latitude},${longitude});
      way["social_facility"="shelter"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"="social_facility"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"="shelter"](around:${radiusMeters},${latitude},${longitude});
      way["office"="social_service"](around:${radiusMeters},${latitude},${longitude});
    );
    out center tags;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8"
    },
    body: query
  });

  if (!response.ok) {
    throw new Error("Nearby resource search is unavailable right now.");
  }

  const data = await response.json();
  const mapped = (data.elements || [])
    .map((element) => {
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;
      const name = element.tags?.name || element.tags?.operator || "Nearby resource";

      return {
        name,
        subtitle: element.tags?.description || element.tags?.["social_facility:for"] || "Open map details for more information",
        distanceLabel: `${calculateDistanceMiles(latitude, longitude, lat, lon).toFixed(1)} miles away`,
        website: element.tags?.website || element.tags?.url || "",
        phone: element.tags?.phone || element.tags?.contact?.phone || "",
        maps: buildMapsCoordinateLink(lat, lon, name)
      };
    })
    .filter((resource) => resource.name)
    .sort((a, b) => parseFloat(a.distanceLabel) - parseFloat(b.distanceLabel))
    .slice(0, 6);

  return [...mapped, ...emergencyResources].slice(0, 8);
}

function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
  if (![lat1, lon1, lat2, lon2].every((value) => Number.isFinite(value))) {
    return 0;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

function buildMapsCoordinateLink(latitude, longitude, label) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`;
}

function buildMapsSearchLink(query, coords) {
  if (coords) {
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${coords.latitude},${coords.longitude},12z`;
  }

  return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
}

function setStatus(element, message) {
  element.textContent = message;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createEntryId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
