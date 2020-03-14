import Search from './modules/Search';
import Recipe from './modules/Recipe';
import List from './modules/List';
import * as searchView from './views/search-view';
import * as recipeView from './views/recipe-view';
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
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlidht the selected 
    if(state.search) searchView.highlightSelected(id);
  
    // Creatong Recipe obj
    state.recipe = new Recipe(id);
    try {
      // Get Recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      // Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();
  
      // Render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);
      
    } catch (error) {
      alert('Error processing recipe!');
    }
  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// handling recipe button clicks
elements.recipe.addEventListener('click', event => {
 if (event.target.matches('.btn-decrease, .btn-decrease *')) {
  //  Deccrease button is clicked
  if (state.recipe.servings > 1) {
    state.recipe.updateServings('dec');
    recipeView.updateServingsIngredients(state.recipe);
  }
 } else if (event.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
 }
 console.log(state.recipe);
});

const l = new List();

window.l = l;



