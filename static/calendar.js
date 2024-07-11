'use strict';

$workoutSplit.on('click', '.save-workout-split', saveWorkoutSplit);
$('.my-workout-split').on('click', getWorkoutSplit);


/**
 * Gets the workout split for user from the database
 */
async function getWorkoutSplit() {
  const response = await fetch('/workout-split');
  const workoutSplit = await response.json();

  showWorkoutSplit(workoutSplit);
}



/**
 * Shows users workout split
 */
async function showWorkoutSplit(workoutSplit) {
  $categories.empty();
  $workouts.empty();
  $calendar.show();
  $workoutSplit.empty();

  $workoutSplit.append(`<tr class="days"></tr>`);
  let workoutIds = 0;

  $('.days').append(`<th class ="monday day"  ondrop="drop(event)" ondragover="allowDrop(event)">Monday</th>`);
  $('.monday').append(`<tr class="tr-monday"></tr>`);
  for (let wo of workoutSplit.workout.monday) {
    $('.tr-monday').append(`<td draggable="true" ondragstart="drag(event)" id="td-${workoutIds}" data-workout="${wo}"  class ="workout-s"><b class ="ws">${wo}</b></td>`);
    workoutIds++;
  }

  $('.days').append(`<th class ="tuesday day" ondrop="drop(event)" ondragover="allowDrop(event)">Tuesday</th>`);
  $('.tuesday').append(`<tr class ="tr-tuesday"></tr>`);
  for (let wo of workoutSplit.workout.tuesday) {
    $(`.tr-tuesday`).append(`<td draggable="true" ondragstart="drag(event)" id="td-${workoutIds}" data-workout="${wo}"  class ="workout-s"><b class ="ws">${wo}</b></td>`);
    workoutIds++;
  }

  $('.days').append(`<th class ="wednesday day" ondrop="drop(event)" ondragover="allowDrop(event)">Wednesday</th>`);
  $('.wednesday').append(`<tr class="tr-wednesday"></tr>`);
  for (let wo of workoutSplit.workout.wednesday) {
    $(`.tr-wednesday`).append(`<td draggable="true" ondragstart="drag(event)" id="td-${workoutIds}" data-workout="${wo}"  class ="workout-s"><b class ="ws">${wo}</b></td>`);
    workoutIds++;
  }

  $('.days').append(`<th class ="thursday day" ondrop="drop(event)" ondragover="allowDrop(event)">Thursday</th>`);
  $('.thursday').append(`<tr class="tr-thursday"></tr>`);
  for (let wo of workoutSplit.workout.thursday) {
    $('.tr-thursday').append(`<td draggable="true" ondragstart="drag(event)" id="td-${workoutIds}" data-workout="${wo}"  class ="workout-s"><b class ="ws">${wo}</b></td>`);
    workoutIds++;
  }

  $('.days').append(`<th class ="friday day" ondrop="drop(event)" ondragover="allowDrop(event)">Friday</th>`);
  $('.friday').append(`<tr class="tr-friday"></tr>`);
  for (let wo of workoutSplit.workout.friday) {
    $('.tr-friday').append(`<td draggable="true" ondragstart="drag(event)" id="td-${workoutIds}" data-workout="${wo}"  class ="workout-s"><b class ="ws">${wo}</b></td>`);
    workoutIds++;
  }
  $('.days').append(`<th class ="saturday day" ondrop="drop(event)" ondragover="allowDrop(event)">Saturday</th>`);
  $('.saturday').append(`<tr class="tr-saturday"></tr>`);
  for (let wo of workoutSplit.workout.saturday) {
    $('.tr-saturday').append(`<td draggable="true" ondragstart="drag(event)" id="td-${workoutIds}" data-workout="${wo}"  class ="workout-s"><b class ="ws">${wo}</b></td>`);
    workoutIds++;
  }

  $('.days').append(`<th class ="sunday day" ondrop="drop(event)" ondragover="allowDrop(event)">Sunday</th>`);
  $('.sunday').append(`<tr class="tr-sunday"></tr>`);
  for (let wo of workoutSplit.workout.sunday) {
    console.log(wo);
    $('.tr-sunday').append(`<td draggable="true" ondragstart="drag(event)" id="td-${workoutIds}" data-workout="${wo}"  class ="workout-s"><b class ="ws">${wo}</b></td>`);
    workoutIds++;
  }

  await appendFavoriteWorkouts(workoutIds);

  $workoutSplit.append('<button class="save-workout-split">Save</button>');
  $workoutSplit.append('<div class="delete-split" ondrop="deleteDrop(event)" ondragover="allowDrop(event)"><h2>Remove Exercise</h2></div>');

}


/**
 * Adds workouts that user has liked to the page. These workouts can be
 * dragged in to the workout split.
 */
async function appendFavoriteWorkouts(workoutIds) {
  let workoutIdss = workoutIds;
  $('.calendar-workouts').empty();
  const user_workouts = await getUserWorkouts();

  for (let workout of user_workouts.user) {
    $('.calendar-workouts').append(
      `<td draggable="true" ondragstart="drag(event)" id="td-${workoutIdss}"
      data-workout="${workout.name}" class ="workout-s">
      <b class ="ws">${workout.name}</b>
      </td>`);
    workoutIdss++;
  }


}


/**
 *Allows drop on elements.
 */
function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * Transfers data for the dragged item
 */
function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

/**
 *Appends the dragged element to the dropped element
 */
function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const appendEl = ev.target.children[0];
  console.log(data, appendEl);
  const ev1 = document.getElementById(data);
  appendEl.appendChild(ev1);
}

/**
 * Removes the dragged element from the dom.
 */
function deleteDrop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const ev1 = document.getElementById(data);
  ev1.remove();
}



/**
 * Saves the user's current workout split.
 */
async function saveWorkoutSplit() {
  const [monday, tuesday, wednesday, thursday, friday, saturday, sunday] = getSplitData();

  const split = {
    monday: monday,
    tuesday: tuesday,
    wednesday: wednesday,
    thursday: thursday,
    friday: friday,
    saturday: saturday,
    sunday: sunday
  };

  await fetch(`/save-workout-split`, {
    method: "POST",
    body: JSON.stringify(split),
    headers: {
      "Content-Type": "application/json"
    }
  });

}


/**
 * Gets the data from the current workout split. Returns the data.
 */

function getSplitData() {
  let monday = [];
  for (let w of $('.tr-monday').children()) {
    monday.push(w.dataset.workout);
  }

  let tuesday = [];
  for (let w of $('.tr-tuesday').children()) {
    tuesday.push(w.dataset.workout);
  }

  let wednesday = [];
  for (let w of $('.tr-wednesday').children()) {
    wednesday.push(w.dataset.workout);
  }

  let thursday = [];
  for (let w of $('.tr-thursday').children()) {
    thursday.push(w.dataset.workout);
  }

  let friday = [];
  for (let w of $('.tr-friday').children()) {
    friday.push(w.dataset.workout);
  }

  let saturday = [];
  for (let w of $('.tr-saturday').children()) {
    saturday.push(w.dataset.workout);
  }

  let sunday = [];
  for (let w of $('.tr-sunday').children()) {
    sunday.push(w.dataset.workout);
  }
  return [monday, tuesday, wednesday, thursday, friday, saturday, sunday];

}
