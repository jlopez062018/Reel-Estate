// === Game State ===
let fishCount = 0;
let fishPerClick = 1;
let gold = 0;
let fishPrice = 0.25;

// === DOM Elements ===
const goldDisplay = document.getElementById('gold');
const fishDisplay = document.getElementById('fish-count');
const fishPriceDisplay = document.getElementById('fish-price');
const fishButton = document.getElementById('fish-button');

// === Functions ===

// Updates gold and fish count displays
function updateUI() {
  goldDisplay.textContent = gold.toFixed(2);
  fishDisplay.textContent = fishCount;
  fishPriceDisplay.textContent = fishPrice.toFixed(2);
}

// Handle fishing click
function catchFish() {
  fishCount += fishPerClick;
  updateUI();
}

// Sell all fish for gold
function sellAllFish() {
  const profit = fishCount * fishPrice;
  gold += profit;
  fishCount = 0;
  updateUI();
}

// === Event Listeners ===
fishButton.addEventListener('click', catchFish);

// For now, add a basic key press (e.g., 'S' key) to sell fish
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 's') {
    sellAllFish();
  }
});

// === Initial UI Update ===
updateUI();
