import Observer from "./observer.js";
import {UserRating, RatingFilmCount} from "../const";

export default class UserModel extends Observer {
  constructor(filmsModel) {
    super();
    this._filmsModel = filmsModel;
    this._userRating = UserRating.NOVICE;

    this.updateRating = this.updateRating.bind(this);
    this._filmsModel.addObserver(this.updateRating);
  }

  setRating(updateType, rating) {
    this._userRating = rating;
    this._notify(updateType, rating);
  }

  getRating() {
    return this._userRating;
  }

  updateRating() {
    const watchedFilms = this._getWatchedFilmsNumber(this._filmsModel.getFilms());
    const userRating = this._getUserRating(watchedFilms);

    if (this._userRating === userRating) {
      return;
    }

    this._userRating = userRating;
  }

  _getWatchedFilmsNumber(films) {
    return films.reduce((acc, currentFilm) => acc + currentFilm.isWatched, 0);
  }

  _getUserRating(watchedFilms) {
    if (watchedFilms > RatingFilmCount.FAN_FILMS_MAX) {
      return UserRating.MOVIE_BUFF;
    } else if (watchedFilms > RatingFilmCount.NOVICE_FILMS_MAX && watchedFilms <= RatingFilmCount.FAN_FILMS_MAX) {
      return UserRating.FAN;
    } else if (watchedFilms > 0 && watchedFilms <= RatingFilmCount.NOVICE_FILMS_MAX) {
      return UserRating.NOVICE;
    }
    return null;
  }
}
