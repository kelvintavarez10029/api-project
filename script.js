const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=30';

const collectionContainer = document.getElementById('collection-container');
const favoritesContainer = document.getElementById('favorites-container');
const sortToggleBtn = document.getElementById('sort-toggle');
const dataSummary = document.getElementById('data-summary');

let collection = [];
let favorites = [];
let allPokemon = [];
let isAscending = true;

async function apiCall() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const detailedData = await Promise.all(
      data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()))
    );

    allPokemon = detailedData.map(pokemon => ({
      id: pokemon.id,
      name: pokemon.name,
      image: pokemon.sprites.front_default,
      base_experience: pokemon.base_experience
    }));

    const saved = loadFavorites();
    favorites = allPokemon.filter(p => saved.some(fav => fav.id === p.id));
    collection = allPokemon.filter(p => !favorites.some(fav => fav.id === p.id));

    render();
  } catch (error) {
    console.error('Failed to fetch Pokémon:', error);
  }
}

function createCard(pokemon, isFavorite) {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <img src="${pokemon.image}" alt="${pokemon.name}">
    <h3>${pokemon.name}</h3>
    <p>Base Exp: ${pokemon.base_experience}</p>
    <button class="fav-btn">${isFavorite ? 'Remove ❌' : 'Fav ❤️'}</button>
  `;

  card.querySelector('.fav-btn').addEventListener('click', () => {
    if (isFavorite) {
      handleRemoveFromFavorites(pokemon);
    } else {
      handleAddToFavorites(pokemon);
    }
  });

  return card;
}

function handleAddToFavorites(pokemon) {
  collection = collection.filter(p => p.id !== pokemon.id);
  favorites.push(pokemon);
  saveFavorites();
  render();
}

function handleRemoveFromFavorites(pokemon) {
  favorites = favorites.filter(p => p.id !== pokemon.id);
  collection.push(pokemon);
  saveFavorites();
  render();
}

function render() {
  collectionContainer.innerHTML = '';
  favoritesContainer.innerHTML = '';

  const sortedCollection = sortByName(collection, isAscending);
  const sortedFavorites = sortByName(favorites, isAscending);

  sortedCollection.forEach(p => {
    const card = createCard(p, false);
    collectionContainer.appendChild(card);
  });

  sortedFavorites.forEach(p => {
    const card = createCard(p, true);
    favoritesContainer.appendChild(card);
  });

  updateSummary();
  updateScoreboard();
}

function sortByName(arr, asc = true) {
  return arr.slice().sort((a, b) =>
    asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );
}

function updateSummary() {
  const totalExp = favorites.reduce((sum, p) => sum + p.base_experience, 0);
  dataSummary.textContent = `Total EXP of Favorites: ${totalExp}`;
}

function updateScoreboard() {
  const scoreboard = document.getElementById('favorites-scoreboard');
  scoreboard.textContent = `Favorites Count: ${favorites.length}`;
}

function saveFavorites() {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadFavorites() {
  const saved = localStorage.getItem('favorites');
  return saved ? JSON.parse(saved) : [];
}

sortToggleBtn.addEventListener('click', () => {
  isAscending = !isAscending;
  sortToggleBtn.dataset.ascending = String(isAscending);
  sortToggleBtn.textContent = isAscending ? 'Sort Z-A' : 'Sort A-Z';
  render();
});

const resetBtn = document.getElementById('reset-button');

resetBtn.addEventListener('click', () => {
  localStorage.removeItem('favorites');
  favorites = [];
  collection = [...allPokemon]; // reset collection to full list
  render();
});

apiCall();

  
  
 
  





