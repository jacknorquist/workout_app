from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

bcrypt = Bcrypt()
db = SQLAlchemy()

DEFAULT_IMAGE_URL = (
    "https://i.pngimg.me/thumb/f/720/m2i8Z5K9b1N4d3N4.png")

class User(db.Model):
    """User in the system."""

    __tablename__ = 'users'

    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True,
    )

    email = db.Column(
        db.String(50),
        nullable=False,
        unique=True,
    )

    username = db.Column(
        db.String(30),
        nullable=False,
        unique=True,
    )

    image_url = db.Column(
        db.String(255),
        nullable=False,
        default = DEFAULT_IMAGE_URL
    )

    password = db.Column(
        db.String(100),
        nullable=False,
    )
    workouts = db.relationship(
        'Workout', secondary='user_workouts', backref='users'
    )
    workout_split = db.relationship('WorkoutSplit', backref='users')

    def serialize(self):
        """Serialize user workouts to dictionary."""

        return {
            "workouts": self.workouts,
        }


    @classmethod
    def signup(cls, username, email, password, image_url):
        """Sign up user.

        Hashes password and adds user to session.
        """

        hashed_pwd = bcrypt.generate_password_hash(password).decode('UTF-8')

        user = User(
            username=username,
            email=email,
            password=hashed_pwd,
            image_url=image_url,
        )

        db.session.add(user)
        return user

    @classmethod
    def authenticate(cls, username, password):
        """Find user with `username` and `password`.

        This is a class method (call it on the class, not an individual user.)
        It searches for a user whose password hash matches this password
        and, if it finds such a user, returns that user object.

        If this can't find matching user (or if password is wrong), returns
        False.
        """
        user = cls.query.filter_by(username=username).one_or_none()

        if user:
            is_auth = bcrypt.check_password_hash(user.password, password)
            if is_auth:
                return user

        return False


def connect_db(app):
    """ Connect to database. """

    app.app_context().push()
    db.app = app
    db.init_app(app)


class Workout(db.Model):
    """Table for workout"""

    __tablename__ = 'workouts'

    workout_name = db.Column(
        db.String(200),
        primary_key = True
    )

    category_name = db.Column(
        db.String(200),
        db.ForeignKey('categories.name'),
        )


    intensity_level = db.Column(
        db.String(20)
    )
    equipment = db.Column(
        db.String(200),
        default = ""
    )

    explanation = db.Column(
        db.String(600)
    )

    long_explanation = db.Column(
        db.String(1000)
    )
    video = db.Column(
        db.String(400)
    )

    def serialize(self):
        """Serialize to dictionary."""

        return {
            "name": self.workout_name,
            "category_name": self.category_name,
            "intensity_level": self.intensity_level,
            "equipment": self.equipment,
            "explanation": self.explanation,
            "long_explanation": self.long_explanation,
            "video": self.video
        }



class Category(db.Model):
    """Table for workout category"""
    __tablename__ = 'categories'

    name = db.Column(
        db.String(200),
        primary_key = True
    )
    workouts = db.relationship('Workout', backref='categories')


    def serialize(self):
        """Serialize to dictionary."""

        return {
            "name": self.name,
        }

    @classmethod
    def add_category(cls,name):
        category = Category(
               name=name
            )

        db.session.add(category)
        return category





class UserWorkout(db.Model):
    """Table users's likes workouts"""
    __tablename__ = 'user_workouts'

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        primary_key=True
    )

    workout= db.Column(
        db.String(200),
        db.ForeignKey("workouts.workout_name"),
        primary_key = True
    )

    weight = db.Column (
        db.ARRAY(db.String(5000)),
        default = [0]
    )






class WorkoutSplit(db.Model):
    """Table for user's workout calendar"""
    __tablename__ = 'workout_split'


    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        primary_key=True
    )

    monday = db.Column (
        db.ARRAY(db.String(1000))
    )

    tuesday = db.Column (
        db.ARRAY(db.String(1000))
    )

    wednesday= db.Column (
        db.ARRAY(db.String(1000))
    )

    thursday = db.Column (
        db.ARRAY(db.String(1000))
    )

    friday = db.Column (
        db.ARRAY(db.String(1000))
    )

    saturday = db.Column (
        db.ARRAY(db.String(1000))
    )

    sunday= db.Column (
        db.ARRAY(db.String(1000))
    )

    def serialize(self):
        """Serialize to dictionary."""

        return {
            "monday": self.monday,
            "tuesday": self.tuesday,
            "wednesday": self.wednesday,
            "thursday": self.thursday,
            "friday": self.friday,
            "saturday": self.saturday,
            "sunday": self.sunday
        }


