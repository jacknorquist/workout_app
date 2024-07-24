import os
import requests, json
from dotenv import load_dotenv

from flask import Flask, render_template, flash, redirect, session, g, jsonify, request
from flask_debugtoolbar import DebugToolbarExtension
from sqlalchemy.exc import IntegrityError, PendingRollbackError
from psycopg2.errors import UniqueViolation

from forms import SignUpForm, LoginForm, CSRFForm
from models import db, connect_db, User, Workout, Category, WorkoutSplit, UserWorkout

load_dotenv()


CURR_USER_KEY = "curr_user"

app = Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.config['SQLALCHEMY_ECHO'] = False
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
app.config['SECRET_KEY'] = ['SECRET_KEY']
app.config['API_SECRET_KEY'] = os.environ['API_SECRET_KEY']
toolbar = DebugToolbarExtension(app)

API_SECRET_KEY = os.environ['API_SECRET_KEY']

connect_db(app)



@app.before_request
def add_user_to_g():
    """If we're logged in, add curr user to Flask global."""

    if CURR_USER_KEY in session:
        g.user = User.query.get(session[CURR_USER_KEY])

    else:
        g.user = None

@app.before_request
def add_csrf_to_g():
    ''' Add csrf to Flask global. '''

    g.csrf_form = CSRFForm()

def do_login(user):
    """Log in user."""

    session[CURR_USER_KEY] = user.id


def do_logout():
    """Log out user."""

    if CURR_USER_KEY in session:
        del session[CURR_USER_KEY]



@app.route('/login', methods=["GET", "POST"])
def login():
    """Handle user login and redirect to homepage on success."""

    form = LoginForm()

    if form.validate_on_submit():
        user = User.authenticate(
            form.username.data,
            form.password.data,
        )

        if user:
            do_login(user)
            flash(f"Hello, {user.username}!", "success")
            return redirect("/")

        flash("Invalid credentials.", 'danger')

    return render_template('users/login.html', form=form)


@app.route('/signup', methods=["GET", "POST"])
def signup():
    """Handle user signup.

    Create new user and add to DB. Redirect to home page.

    If form not valid, present form.

    If the there already is a user with that username: flash message
    and re-present form.
    """

    do_logout()

    form = SignUpForm()

    if form.validate_on_submit():
        try:
            user = User.signup(
                username=form.username.data,
                password=form.password.data,
                email=form.email.data,
                image_url=form.image_url.data or User.image_url.default.arg,
            )
            db.session.commit()

        except IntegrityError:
            flash("Username already taken", 'danger')
            return render_template('users/signup.html', form=form)

        do_login(user)
        make_workout_split(user)

        return redirect("/")

    else:
        return render_template('users/signup.html', form=form)




@app.get("/")
def homepage():
    """Show home page if user is logged in, show page to login or signup if not."""
    if g.user:
        return render_template ("home.html")
    return render_template("home-anon.html")


@app.get('/get_workouts')
def get_workouts():
    """Gets all workouts from database and returns them"""
    workouts = Workout.query.all()

    serialized_workouts = [w.serialize() for w in workouts]

    return jsonify(workouts = serialized_workouts)

@app.get('/get_categories')
def get_categories():
    """Gets all categories from database and returns them"""
    categories = Category.query.all()
    serialized_categories = [c.serialize() for c in categories]

    return jsonify( categories = serialized_categories)

@app.get('/user')
def get_user():
    """Gets user record and returns it"""
    user = User.query.get_or_404(g.user.id)
    serialized_workouts = [w.serialize() for w in user.workouts]

    return jsonify(user=serialized_workouts)


# def get_video_id(workout):
#     response = requests.get(f'https://www.googleapis.com/youtube/v3/search?part=snippet&q={workout}&key=AIzaSyA-VxK81nFPXhdUzhZ3qkOD6k6_ZL1Xpys').json()
#     video_id = response['items']
#     print('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$', video_id)


@app.get("/get-workouts/db")
def add_workouts():
    """Adds workouts from api to the database"""
    response =requests.get("https://work-out-api1.p.rapidapi.com/search/",
                            headers={"X-RapidAPI-Key":f"{API_SECRET_KEY}",
                            "X-RapidAPI-Host":"work-out-api1.p.rapidapi.com"}).json()
    workout_data = response

    for workout in workout_data:
        try:
            Category.add_category(name =workout["Muscles"])
            db.session.commit()
        except (UniqueViolation, IntegrityError, PendingRollbackError):
            db.session.remove()
            try:
                db.session.remove()
                workout_add = Workout(workout_name = workout['WorkOut'],
                                        category_name = workout["Muscles"],
                                        intensity_level= workout["Intensity_Level"],
                                        equipment = workout["Equipment"],
                                        explanation = workout["Explaination"],
                                        long_explanation = workout["Long Explanation"],
                                        video = "http://www.youtube.com/embed/xhr3cZaDg2s?enablejsapi")
                db.session.add(workout_add)
                db.session.commit()
                continue
            except (UniqueViolation, IntegrityError, PendingRollbackError):
                continue


        try:
            db.session.remove()
            workout_add = Workout(workout_name = workout['WorkOut'],
                                    category_name = workout["Muscles"],
                                    intensity_level= workout["Intensity_Level"],
                                    equipment = workout["Equipment"],
                                    explanation = workout["Explaination"],
                                    long_explanation = workout["Long Explanation"],
                                    video = "http://www.youtube.com/embed/xhr3cZaDg2s?enablejsapi")
            db.session.add(workout_add)
            db.session.commit()
        except (UniqueViolation, IntegrityError, PendingRollbackError):
            continue



    return 'success'


@app.get("/workouts/<category>")
def get_category_workout(category):
    """Gets workouts under certain category and returns them"""
    curr_category = Category.query.get_or_404(category)
    workouts = curr_category.workouts

    serialized = [w.serialize() for w in workouts]
    redirect('/')
    return jsonify(workouts = serialized)


@app.get("/workout/<workout>")
def get_workout_data(workout):
    """Gets a workout and returns it"""
    workout = Workout.query.get_or_404(workout)
    serialized = workout.serialize()
    return jsonify(workout = serialized)


@app.get("/workout-split")
def get_workout_split():
    """Gets workout split for the user and returns it"""
    user = User.query.get_or_404(g.user.id)
    workout_split = user.workout_split[0]
    serialized = workout_split.serialize()
    return jsonify(workout = serialized)



@app.post("/favorite/<workout>")
def favorite_unfavorite_workout(workout):
    """Favorites or unfavorites a workout"""
    user = User.query.get_or_404(g.user.id)
    workout = Workout.query.get_or_404(workout)

    if workout in user.workouts:
        user.workouts.remove(workout)

    else:
        user.workouts.append(workout)
    db.session.commit()

    return redirect("/")

@app.post('/save-workout-split')
def save_workout_split():
    """Saves the currents users workout split"""
    split = WorkoutSplit.query.get_or_404(g.user.id)

    split.monday = request.json['monday']
    split.tuesday = request.json['tuesday']
    split.wednesday = request.json['wednesday']
    split.thursday = request.json['thursday']
    split.friday = request.json['friday']
    split.saturday = request.json['saturday']
    split.sunday = request.json['sunday']

    db.session.commit()

    return redirect("/")


@app.post('/update-workout-weight')
def update_workout_weight():
    """Updates the weight that the user submits for a certain workout"""
    workout = UserWorkout.query.get_or_404((g.user.id, request.json['workout']))
    holder=workout.weight
    holder.append(request.json['weight'])

    modified_list = ', '.join(map(str, holder))
    workout.weight = [modified_list]
    db.session.commit()

    return redirect("/")


@app.get('/get-workout-weight/<workout>')
def get_workout_weight(workout):
    """Gets array of weights for certain workout under a user."""
    workout_rec = UserWorkout.query.get_or_404((g.user.id, workout))

    return jsonify(workout_rec.weight)


def make_workout_split(user):
    """Makes workout split for a user once they signup"""
    split = WorkoutSplit(
    user_id = user.id,
    monday = [],
    tuesday = [],
    wednesday = [],
    thursday = [],
    friday = [],
    saturday = [],
    sunday = []
    )

    db.session.add(split)
    db.session.commit()











