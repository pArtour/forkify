import Search from './modules/Search';
import Recipe from './modules/Recipe';
import * as searchView from './views/search-view';
import { elements, renderLoader, clearLoader } from './views/base';

// Global state of the app
// * - Search object
// * - Current recipe object
// * - Shopping list object
// * - Liked recipes
const state = {};

// * Search controller
const controlSearch = async () => {
  // 1) get query from view
  const query = searchView.getInput() // to do
  if (query) {
    // 2) New search object and add to state
    state.search = new Search(query);
    // 3)  Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // 4) Search for recipes
      await state.search.getResults();
      // 5) Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert('Something went wrong! :(');
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener('submit', event => {
  event.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', event => {
  const btn = event.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  };
});

// Recipe controller
const controlRecipe = async () => {
  // Get ID from url
  const id = window.location.hash.replace('#', '');
  console.log(id);

  if (id) {
    // Prepare UI for changes

    // Creatong Recipe obj
    state.recipe = new Recipe(id);
    try {
      // Get Recipe data
      await state.recipe.getRecipe();
  
      // Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();
  
      // Render recipe
      console.log(state.recipe);
      
    } catch (error) {
      alert('Error processing recipe!');
    }
  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

