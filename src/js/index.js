import Search from './modules/Search';
import Recipe from './modules/Recipe';
import List from './modules/List';
import Likes from './modules/Likes';
import * as searchView from './views/search-view';
import * as recipeView from './views/recipe-view';
import * as listView from './views/list-view';
import * as likeView from './views/likes-view';
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
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
      
    } catch (error) {
      alert('Error processing recipe!');
    }
  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// List controller
const controlList = () => {
  // Create a new list IF there si not yet
  if (!state.list) state.list = new List();

  // Add each ingredient to the list and UI
  state.recipe.ingredients.forEach(elem => {
    const item = state.list.addItem(elem.count, elem.unit, elem.ingredient);
    listView.renderItem(item);
  });
};

// handle delete and update list items events
elements.shopping.addEventListener('click', event => {
  const id = event.target.closest('.shopping__item').dataset.itemId;
  // handle the delete event
  if (event.target.matches('.shopping__delete, .shopping__delete *')) {
    // Delete from stete
    state.list.deleteItem(id);
    // Delete from UI
    listView.deleteItem(id);
    // Handle the count update
  } else if (event.target.matches('.shopping__count-value')) {
    const val = parseFloat(event.target.value);
    state.list.updateCount(id, val);
  }
});

// Like controller
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentId = state.recipe.id;
  // User has not yet liked current recipe
  if (!state.likes.isLiked(currentId)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      currentId,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img,
    );
    // Toggle the like btn
      likeView.toggleLikeBtn(true)
    // Add like to the UI list
      likeView.renderLike(newLike);
      console.log(state.likes);
      
  // User has liked current recipe
  } else {
     // Remove like from the state
      state.likes.deleteLike(currentId)
     // Toggle the like btn
      likeView.toggleLikeBtn(false)
     // Remove like from the UI list
      console.log(state.likes);
      likeView.deleteLike(currentId);
  }
  likeView.toggleLikeMenu(state.likes.getNumLikes())
};

// Restore like recipes on page load
window.addEventListener('load', () => {
  state.likes = new Likes();
  // Restore likes
  state.likes.readStorage();
  // Toggle like btn
  likeView.toggleLikeMenu(state.likes.getNumLikes());
  // Render the existing likes
  state.likes.likes.forEach(like => likeView.renderLike(like));
})

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
 } else if (event.target.matches('.recipe__btn-add, recipe__btn-add *')) {
  //  Add ingredirnts and shopping list
    controlList()
 } else if(event.target.matches('.recipe__love, .recipe__love *')) {
  //  Like controller
    controlLike()
 }
});



