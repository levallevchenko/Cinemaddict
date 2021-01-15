import Observer from "../utils/observer.js";
import {UserRating} from "../const";

export default class UserModel extends Observer {
  constructor(filmsModel) {
    super();
    this._filmsModel = filmsModel;
    this._userRating = UserRating.MOVIE_BUFF;
    this._observers = {
      updateRating: []
    };

    this.updateRating = this.updateRating.bind(this);
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
    return films.reduce((acc, currentFilm) => acc + currentFilm.isInHistory, 0);
  }

  _getUserRating(watchedFilms) {
    if (watchedFilms > 20) {
      return UserRating.MOVIE_BUFF;
    } else if (watchedFilms > 10 && watchedFilms <= 20) {
      return UserRating.FAN;
    } else if (watchedFilms > 0 && watchedFilms <= 10) {
      return UserRating.NOVICE;
    } else {
      return null;
    }
  }
}
