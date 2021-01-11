import Observer from '../utils/observer.js';
import {UserRaiting} from "../const";

export default class UserModel extends Observer {
  constructor(filmsModel) {
    super();
    this._filmsModel = filmsModel;
    this._userRaiting = UserRaiting.MOVIE_BUFF;
    this._observers = {
      updateRaiting: []
    };

    this.updateRaiting = this.updateRaiting.bind(this);
  }

  getRaiting() {
    return this._userRaiting;
  }

  updateRaiting() {
    const watchedFilms = this._getWatchedFilmsNumber(this._filmsModel.getFilms());
    const userRaiting = this._getUserRaiting(watchedFilms);

    if (this._userRaiting === userRaiting) {
      return;
    }

    this._userRaiting = userRaiting;
  }

  _getWatchedFilmsNumber(films) {
    return films.reduce((acc, currentFilm) => acc + currentFilm.isInHistory, 0);
  }

  _getUserRaiting(watchedFilms) {
    if (watchedFilms > 20) {
      return UserRaiting.MOVIE_BUFF;
    } else if (watchedFilms > 10 && watchedFilms <= 20) {
      return UserRaiting.FAN;
    } else if (watchedFilms > 0 && watchedFilms <= 10) {
      return UserRaiting.NOVICE;
    } else {
      return null;
    }
  }
}
