// === Game State ===
let gold = 0;
let maxInventorySize = 25;
let inventory = [];
let hasScale = false;
let showPrices = false;

// === DOM Elements ===
const goldDisplay = document.getElementById('gold');
const fishDisplay = document.getElementById('fish-count');
const fishButton = document.getElementById('fish-button');
const sellButton = document.getElementById('sell-button');
const log = document.getElementById('log');
const fishPriceDisplay = document.getElementById('fish-price');
const storePanel = document.getElementById('right-panel'); // where store items go

// === Fish Types and Sizes ===
const fishTypes = {
  "Minnow": { baseValue: 0.25, supply: 0 },
  "Bass": { baseValue: 0.5, supply: 0 },
  "Tuna": { baseValue: 1.0, supply: 0 },
  "Swordfish": { baseValue: 3.0, supply: 0 },
  "Golden Koi": { baseValue: 5.0, supply: 0 },
};

const sizes = [
  { name: "Tiny", multiplier: 0.5 },
  { name: "Small", multiplier: 0.75 },
  { name: "Medium", multiplier: 1.0 },
  { name: "Large", multiplier: 1.25 },
  { name: "Massive", multiplier: 1.5 },
];

// === Upgrades ===
let fishPerClick = 1;

const upgrades = [
  {
    id: "wooden-rod",
    name: "Wooden Rod",
    description: "+1 Fish per Click",
    cost: 50,
    category: "Gear",
    purchased: false,
    effect: () => {
      fishPerClick += 1;
      addToLog("🎣 Your Wooden Rod increases fish per click!");
    }
  },
  {
    id: "cooler",
    name: "Cooler",
    description: "+10 Inventory Capacity",
    cost: 100,
    category: "Utility",
    purchased: false,
    effect: () => {
      maxInventorySize += 10;
      addToLog("🧊 Cooler installed! Inventory +10.");
    }
  },
  {
    id: "scale",
    name: "Scale",
    description: "Reveals fish value after catching",
    cost: 200,
    category: "Utility",
    purchased: false,
    effect: () => {
      hasScale = true;
      addToLog("⚖️ You can now weigh your fish!");
    }
  },
  {
    id: "market-scanner",
    name: "Market Scanner",
    description: "Shows market prices in HUD",
    cost: 300,
    category: "Utility",
    purchased: false,
    effect: () => {
      showPrices = true;
      addToLog("📉 Market scanner activated! Prices are now visible.");
      updatePriceHUD();
    }
  }
];


// === UI Update ===
function updateUI() {
  goldDisplay.textContent = gold.toFixed(2);
  fishDisplay.textContent = `${inventory.length} / ${maxInventorySize}`;
  updatePriceHUD();
}

function updatePriceHUD() {
  if (showPrices) {
    let sampleFish = Object.keys(fishTypes)[0];
    const supply = fishTypes[sampleFish].supply;
    const price = Math.max(0.5, 1.5 - (supply * 0.05));
    fishPriceDisplay.textContent = price.toFixed(2);
  } else {
    fishPriceDisplay.textContent = "???";
  }
}

// === Inventory Logic ===
function catchFish(e) {
    if (inventory.length >= maxInventorySize) {
      addToLog("❌ Inventory full! Sell your fish.");
      return;
    }
  
    for (let i = 0; i < fishPerClick; i++) {
      if (inventory.length >= maxInventorySize) break;
  
      const fishNames = Object.keys(fishTypes);
      const fishName = fishNames[Math.floor(Math.random() * fishNames.length)];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const fish = {
        name: fishName,
        size: size.name,
        baseValue: fishTypes[fishName].baseValue,
        sizeMultiplier: size.multiplier,
      };
  
      inventory.push(fish);
  
      if (hasScale) {
        const worth = fish.baseValue * fish.sizeMultiplier;
        addToLog(`🎣 Caught a ${fish.size} ${fish.name} worth $${worth.toFixed(2)}`);
      } else {
        addToLog(`🎣 Caught a ${fish.size} ${fish.name}`);
      }
    }
  
    showFloatText(`+${fishPerClick} Fish`, e.clientX, e.clientY);
    updateUI();
  }
  
  function sellAllFish() {
    if (inventory.length === 0) {
      addToLog("🚫 No fish to sell!");
      return;
    }
  
    let total = 0;
    for (const fish of inventory) {
      const { name, baseValue, sizeMultiplier } = fish;
      const supply = fishTypes[name].supply;
      const marketMultiplier = Math.max(0.5, 1.5 - (supply * 0.05));
      const saleValue = baseValue * sizeMultiplier * marketMultiplier;
  
      total += saleValue;
      fishTypes[name].supply += 1;
    }
  
    gold += total;
    addToLog(`💰 Sold ${inventory.length} fish for $${total.toFixed(2)}`);
    inventory = [];
    updateUI();
  }
  

// === Utility ===
function addToLog(text) {
  const entry = document.createElement("div");
  entry.textContent = text;
  log.prepend(entry);
  if (log.childElementCount > 50) {
    log.removeChild(log.lastChild);
  }
}

function showFloatText(text, x, y) {
  const float = document.createElement("div");
  float.className = "float-text";
  float.textContent = text;
  document.body.appendChild(float);
  float.style.left = x + "px";
  float.style.top = y + "px";
  setTimeout(() => float.remove(), 1000);
}

// === Upgrade Store Renderer ===
function renderUpgrades() {
    storePanel.innerHTML = ""; // Clear existing items first
    const categories = [...new Set(upgrades.map(upg => upg.category))];
  
    categories.forEach(category => {
      const section = document.createElement("div");
      section.className = "store-category";
  
      const header = document.createElement("h3");
      header.textContent = category;
      section.appendChild(header);
  
      upgrades
        .filter(upg => upg.category === category)
        .forEach(upg => {
          const card = document.createElement("div");
          card.className = "store-item";
          card.id = `upgrade-${upg.id}`;
  
          const label = document.createElement("p");
          label.innerHTML = `<strong>${upg.name}</strong><br>${upg.description}<br>Cost: ${upg.cost} Gold`;
  
          const btn = document.createElement("button");
          btn.textContent = "Buy";
          btn.addEventListener("click", () => {
            if (gold >= upg.cost && !upg.purchased) {
              gold -= upg.cost;
              upg.purchased = true;
              upg.effect();
              btn.disabled = true;
              btn.textContent = "Purchased";
              updateUI();
            } else {
              addToLog("🚫 Not enough gold or already purchased.");
            }
          });
  
          card.appendChild(label);
          card.appendChild(btn);
          section.appendChild(card);
        });
  
      storePanel.appendChild(section);
    });
  }
  

// === Events ===
fishButton.addEventListener("click", catchFish);
sellButton.addEventListener("click", sellAllFish);
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "s") sellAllFish();
});

// === Init ===
updateUI();
renderUpgrades();
