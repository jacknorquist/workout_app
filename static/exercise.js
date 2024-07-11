'use strict';

$calendar.on('click', '.workout-s', showWorkout);
$workouts.on('click', '.workout-card', showWorkout);
$workouts.on('click', '.update-weight', updateWeight);
$workouts.on('click', '.close', closePopup);




/**
 *Shows popup of workout with workout details.
 */
async function showWorkout(event) {
  const workout = event.currentTarget.dataset.workout;
  const user_workouts = await getUserWorkouts();
  const response = await fetch(`/workout/${workout}`);
  const result = await response.json();
  $(".workout-detail").remove();

  $workouts.append(`<div class="workout-detail" data-workout="${result.workout.name}">
  <b class="ws-detail">${result.workout.name}</b>
  <b class="ws-detail">Equipment: ${result.workout.equipment}</b>
  <p>Explanation: ${result.workout.long_explanation}</p>
  <iframe src="${result.workout.video}"></iframe>
  <i class = ${user_workouts.user.some(obj => obj.name === result.workout.name) ? "bi-star-fill" : "bi-star"}></i>
  <button type="button" class="close" aria-label="Close">
  <span aria-hidden="true">&times;</span>
  </button>

  </div>`
  );

  $('.workout-detail').on('click', '.bi-star', favorite_workout);
  $('.workout-detail').on('click', '.bi-star-fill', favorite_workout);

  // If the user liked this workout, show graph and input to update the weight
  if (user_workouts.user.some(obj => obj.name === result.workout.name)) {
    $('.workout-detail').append(`<canvas id="myChart" style="width:100%;max-width:700px"></canvas>
    <form>
    <label for="weight">Weight</label>
    <input type="number" name="weight" class ="weight"></input>
    <button class="update-weight" data-workout ="${result.workout.name}">Update My Weight</button>
    </form>`);

    const workoutWeightResp = await fetch(`get-workout-weight/${result.workout.name}`);
    const workoutWeights = await workoutWeightResp.json();

    const yValues = workoutWeights[0].split(',');
    const xValues = Array(yValues.length).fill("|");
    console.log(yValues);
    new Chart("myChart", {
      type: "line",
      data: {
        labels: xValues,
        datasets: [{
          fill: false,
          data: yValues
        }]
      },
    });
  }

}


/**
 * Updates user's weight for workout in the database
 */
async function updateWeight(event) {
  event.preventDefault();
  const updateWeightData = {
    weight: $(".weight").val(),
    workout: event.currentTarget.dataset.workout

  };

  await fetch(`/update-workout-weight`, {
    method: "POST",
    body: JSON.stringify(updateWeightData),
    headers: {
      "Content-Type": "application/json"
    }
  });

}

/**
 * Close the popup
 */
function closePopup() {
  $(".workout-detail").remove();
}