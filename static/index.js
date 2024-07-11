'use strict';


const $workouts = $(".workouts");
const $categories = $(".categories");
const $profileNav = $('.profile-nav');
const $calendar = $('.calendar');
const $workoutSplit = $('.workout-split');

$categories.on('click', '.category-btn', filterCategories);
$profileNav.on('click', '.my-workouts-btn', showUserWorkouts);
$profileNav.on('click', '.workouts-btn', showWorkouts);

let workoutList;
let categoryList;




/**
 * Shows all workouts
*/
async function showWorkouts() {
  $calendar.hide();
  $categories.empty();
  $workouts.empty();
  const user_workouts = await getUserWorkouts();
  const result = workoutList;
  for (let workout of result.workouts) {
    $workouts.append(`<div class="workout-card" data-workout="${workout.name}">
    <b class="workout-name ws-detail">${workout.name}</b>
    <b class="ws-detail">Equipment: ${workout.equipment}</b>
    <p>${workout.explanation}</p>
    <i class = ${user_workouts.user.some(obj => obj.name === workout.name) ? "bi-star-fill" : "bi-star"}></i>
    </div>`);
  }

  $('.bi-star').on('click', favorite_workout);
  $('.bi-star-fill').on('click', favorite_workout);
  showCategories();
}


/**
 * Shows all categories
*/
function showCategories() {
  const result = categoryList;
  for (let category of result.categories) {
    $categories.append(`<li class ="btn btn-info p-5 rounded-circle btn-lg category-btn" data-category="${category.name}">
    ${category.name}</li>`);

  }
}

/**
 * Shows workouts that the user has favorited.
*/

async function showUserWorkouts() {
  $calendar.hide();
  $categories.empty();
  $workouts.empty();
  const user_workouts = await getUserWorkouts();

  for (let workout of user_workouts.user) {
    $workouts.append(`<div class="workout-card" data-workout="${workout.name}">
    <b class="workout-name ws-detail">${workout.name}</b>
    <b class="ws-detail"> Equipment: ${workout.equipment}</b>
    <p>${workout.explanation}</p>
    <i class = ${user_workouts.user.some(obj => obj.name === workout.name) ? "bi-star-fill" : "bi-star"}></i>
    </div>`);
  }
  $('.bi-star').on('click', favorite_workout);
  $('.bi-star-fill').on('click', favorite_workout);

}

/**
 *
 * Filters the list of workouts shown based on the category that is clicked.
*/
async function filterCategories(event) {
  $workouts.empty();

  const user_workouts = await getUserWorkouts();
  const category = event.target.dataset.category;
  const response = await fetch(`/workouts/${category}`);

  const result = await response.json();
  for (let workout of result.workouts) {
    $workouts.append(`<div class="workout-card" data-workout="${workout.name}">
    <b class="workout-name ws-detail">${workout.name}</b>
    <b class="ws-detail">Equipment: ${workout.equipment}</b>
    <p>${workout.explanation}</p>
    <i class = ${user_workouts.user.some(obj => obj.name === workout.name) ? "bi-star-fill" : "bi-star"}></i>
    </div>`);
  }
  $('.bi-star').on('click', favorite_workout);
  $('.bi-star-fill').on('click', favorite_workout);


}



/**
 * favorite_workout: Makes ajax request to server to update the favorite.
 * Changes the class of the icon.
 *
 */
async function favorite_workout(event) {
  event.stopPropagation();
  const workout = event.target.parentNode.dataset.workout;
  await fetch(`/favorite/${workout}`, { method: "POST" });


  if (event.target.className === "bi-star") {
    event.target.className = "bi-star-fill";
  }
  else {
    event.target.className = "bi-star";
  }
}


/**
 * Makes ajax request to server to get the user's workouts from the database.
 */
async function getUserWorkouts() {
  const response = await fetch('/user');
  const result = await response.json();
  return result;
}

/**
 * Makes ajax request to server to get all workouts in the database.
*/
async function getAllWorkouts() {
  $workouts.empty();
  const user_workouts = await getUserWorkouts();
  const response = await fetch(`/get_workouts`);

  const result = await response.json();
  workoutList = result;

}

/**
 * Gets all categories in the database
*/
async function getAllCategories() {
  $categories.empty();
  $workouts.empty();
  const response = await fetch('/get_categories');
  const result = await response.json();
  categoryList = result;
}







/**
 *Makes api call to create workouts on load
 */
(async function () {
  await fetch('get-workouts/db');
})();

getAllWorkouts();
getAllCategories();
// showWorkouts();
// showCategories();



/// link works http://www.youtube.com/embed/xhr3cZaDg2s?enablejsapi for embed\

// $('.bi-star').on('click', favorite_workout);
// $('.bi-star-fill').on('click', favorite_workout);


