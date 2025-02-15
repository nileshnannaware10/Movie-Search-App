const apiKey = '70ebccaf'; // Replace with your OMDb API key
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('results');
const errorMessage = document.getElementById('error-message');
const loadMoreButton = document.getElementById('load-more');
const loadingSpinner = document.getElementById('loading-spinner');
const modal = document.getElementById('movie-modal');
const closeModal = document.getElementById('close-modal');
const modalBody = document.getElementById('modal-body');
const addToFavoritesButton = document.getElementById('add-to-favorites');

let currentPage = 1;
let currentQuery = '';

// Function to fetch movies from OMDb API
async function fetchMovies(query, page = 1) {
  const response = await fetch(`https://www.omdbapi.com/?s=${query}&page=${page}&apikey=${apiKey}`);
  const data = await response.json();
  return data;
}

// Function to fetch detailed movie information by IMDb ID
async function fetchMovieDetails(imdbID) {
  const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`);
  const data = await response.json();
  return data;
}

// Function to display movies
function displayMovies(movies) {
  if (movies.length === 0) {
    errorMessage.textContent = 'No movies found. Please try another search.';
    resultsContainer.innerHTML = '';
    loadMoreButton.style.display = 'none';
    return;
  }

  errorMessage.textContent = '';
  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    movieCard.innerHTML = `
      <img src="${movie.Poster}" alt="${movie.Title}" data-imdbid="${movie.imdbID}">
      <div class="movie-info">
        <h3>${movie.Title}</h3>
        <p>Year: ${movie.Year}</p>
        <p>Type: ${movie.Type}</p>
      </div>
    `;

    resultsContainer.appendChild(movieCard);
  });

  // Add click event listener to movie images
  const movieImages = document.querySelectorAll('.movie-card img');
  movieImages.forEach(img => {
    img.addEventListener('click', async () => {
      const imdbID = img.getAttribute('data-imdbid');
      const movieDetails = await fetchMovieDetails(imdbID);
      showMovieDetails(movieDetails);
    });
  });

  loadMoreButton.style.display = 'block';
}

// Function to show movie details in the modal
function showMovieDetails(movie) {
  modalBody.innerHTML = `
    <img src="${movie.Poster}" alt="${movie.Title}">
    <h2>${movie.Title}</h2>
    <p><strong>Year:</strong> ${movie.Year}</p>
    <p><strong>Rated:</strong> ${movie.Rated}</p>
    <p><strong>Released:</strong> ${movie.Released}</p>
    <p><strong>Runtime:</strong> ${movie.Runtime}</p>
    <p><strong>Genre:</strong> ${movie.Genre}</p>
    <p><strong>Director:</strong> ${movie.Director}</p>
    <p><strong>Actors:</strong> ${movie.Actors}</p>
    <p><strong>Plot:</strong> ${movie.Plot}</p>
    <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
  `;
  modal.style.display = 'block';

  // Add to favorites functionality
  addToFavoritesButton.onclick = () => {
    addToFavorites(movie);
  };
}

// Function to add a movie to favorites
function addToFavorites(movie) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.some(fav => fav.imdbID === movie.imdbID)) {
    favorites.push(movie);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`${movie.Title} added to favorites!`);
  } else {
    alert(`${movie.Title} is already in favorites!`);
  }
}

// Event listener for search button
searchButton.addEventListener('click', async () => {
  const query = searchInput.value.trim();
  if (query) {
    loadingSpinner.style.display = 'block';
    currentQuery = query;
    currentPage = 1;
    const data = await fetchMovies(query);
    loadingSpinner.style.display = 'none';
    if (data.Response === 'True') {
      resultsContainer.innerHTML = '';
      displayMovies(data.Search);
    } else {
      errorMessage.textContent = data.Error;
      resultsContainer.innerHTML = '';
      loadMoreButton.style.display = 'none';
    }
  }
});

// Event listener for pressing Enter key
searchInput.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) {
      loadingSpinner.style.display = 'block';
      currentQuery = query;
      currentPage = 1;
      const data = await fetchMovies(query);
      loadingSpinner.style.display = 'none';
      if (data.Response === 'True') {
        resultsContainer.innerHTML = '';
        displayMovies(data.Search);
      } else {
        errorMessage.textContent = data.Error;
        resultsContainer.innerHTML = '';
        loadMoreButton.style.display = 'none';
      }
    }
  }
});

// Event listener for "Load More" button
loadMoreButton.addEventListener('click', async () => {
  currentPage++;
  loadingSpinner.style.display = 'block';
  const data = await fetchMovies(currentQuery, currentPage);
  loadingSpinner.style.display = 'none';
  if (data.Response === 'True') {
    displayMovies(data.Search);
  } else {
    loadMoreButton.style.display = 'none';
  }
});

// Close modal when clicking the close button
closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Close modal when clicking outside the modal
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});