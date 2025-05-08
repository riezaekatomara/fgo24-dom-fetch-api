const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const genderFilter = document.getElementById("gender-filter");
const speciesFilter = document.getElementById("species-filter");
const charactersContainer = document.getElementById("characters-container");
const paginationContainer = document.getElementById("pagination");

let allCharacters = [];
let filteredCharacters = [];
let paginationInfo = {
  count: 0,
  pages: 0,
  next: null,
  prev: null,
  currentPage: 1,
};

async function init() {
  try {
    await fetchCharacters(1);
    setupEventListeners();
  } catch (error) {
    displayError(
      "Failed to initialize the application. Please refresh and try again."
    );
    console.error("Initialization error:", error);
  }
}

async function fetchCharacters(page = 1) {
  try {
    charactersContainer.innerHTML = `<div class="loading">Loading characters...</div>`;

    const response = await fetch(
      `https://rickandmortyapi.com/api/character?page=${page}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    allCharacters = data.results;
    filteredCharacters = [...allCharacters];
    paginationInfo = {
      count: data.info.count,
      pages: data.info.pages,
      next: data.info.next,
      prev: data.info.prev,
      currentPage: page,
    };

    await populateSpeciesFilter();
    displayCharacters(allCharacters);
    setupPagination();
  } catch (error) {
    displayError(`Error fetching characters: ${error.message}`);
    console.error("Error fetching characters:", error);
  }
}

async function populateSpeciesFilter() {
  try {
    while (speciesFilter.options.length > 1) {
      speciesFilter.remove(1);
    }

    const speciesSet = new Set();

    allCharacters.forEach((character) => {
      speciesSet.add(character.species);
    });

    const speciesArray = Array.from(speciesSet).sort();

    const fragment = document.createDocumentFragment();

    speciesArray.forEach((species) => {
      const option = document.createElement("option");
      option.value = species.toLowerCase();
      option.textContent = species;
      fragment.appendChild(option);
    });

    speciesFilter.appendChild(fragment);
  } catch (error) {
    console.error("Error populating species filter:", error);
  }
}

function displayCharacters(characters) {
  try {
    if (characters.length === 0) {
      charactersContainer.innerHTML = `<div class="no-results">No characters match your filters. Try adjusting your search.</div>`;
      return;
    }

    const fragment = document.createDocumentFragment();

    characters.forEach((character) => {
      const card = document.createElement("div");
      card.className = "character-card";

      const statusClass =
        character.status.toLowerCase() === "alive"
          ? "status-alive"
          : character.status.toLowerCase() === "dead"
          ? "status-dead"
          : "status-unknown";

      card.innerHTML = `
                        <img class="character-image" src="${character.image}" alt="${character.name}">
                        <div class="character-info">
                            <h3 class="character-name">${character.name}</h3>
                            <div class="character-details">
                                <p><span class="status ${statusClass}">${character.status}</span></p>
                                <p><strong>Species:</strong> ${character.species}</p>
                                <p><strong>Gender:</strong> ${character.gender}</p>
                                <p><strong>Origin:</strong> ${character.origin.name}</p>
                                <p><strong>Location:</strong> ${character.location.name}</p>
                            </div>
                        </div>
                    `;

      fragment.appendChild(card);
    });

    charactersContainer.innerHTML = "";
    charactersContainer.appendChild(fragment);
  } catch (error) {
    displayError("Error displaying characters");
    console.error("Error displaying characters:", error);
  }
}

async function filterCharacters() {
  try {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value.toLowerCase();
    const genderValue = genderFilter.value.toLowerCase();
    const speciesValue = speciesFilter.value.toLowerCase();

    filteredCharacters = allCharacters.filter((character) => {
      const nameMatch = character.name.toLowerCase().includes(searchTerm);
      const statusMatch =
        statusValue === "" || character.status.toLowerCase() === statusValue;
      const genderMatch =
        genderValue === "" || character.gender.toLowerCase() === genderValue;
      const speciesMatch =
        speciesValue === "" || character.species.toLowerCase() === speciesValue;

      return nameMatch && statusMatch && genderMatch && speciesMatch;
    });

    displayCharacters(filteredCharacters);
  } catch (error) {
    displayError("Error filtering characters");
    console.error("Error filtering characters:", error);
  }
}

function setupPagination() {
  try {
    paginationContainer.innerHTML = "";

    if (paginationInfo.pages <= 1) return;

    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.disabled = !paginationInfo.prev;
    prevButton.addEventListener("click", async () => {
      if (paginationInfo.prev) {
        await fetchCharacters(paginationInfo.currentPage - 1);
      }
    });

    const pageInfo = document.createElement("span");
    pageInfo.textContent = `Page ${paginationInfo.currentPage} of ${paginationInfo.pages}`;
    pageInfo.style.padding = "8px 15px";

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = !paginationInfo.next;
    nextButton.addEventListener("click", async () => {
      if (paginationInfo.next) {
        await fetchCharacters(paginationInfo.currentPage + 1);
      }
    });

    paginationContainer.appendChild(prevButton);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextButton);
  } catch (error) {
    console.error("Error setting up pagination:", error);
  }
}

function setupEventListeners() {
  try {
    searchInput.addEventListener("input", debounce(filterCharacters, 300));

    statusFilter.addEventListener("change", filterCharacters);
    genderFilter.addEventListener("change", filterCharacters);
    speciesFilter.addEventListener("change", filterCharacters);
  } catch (error) {
    console.error("Error setting up event listeners:", error);
  }
}

function displayError(message) {
  charactersContainer.innerHTML = `<div class="no-results">${message}</div>`;
}

function debounce(func, delay) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

document.addEventListener("DOMContentLoaded", init);
