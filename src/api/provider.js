import {isOnline, renderToast} from '../utils/project.js';

const createStoreStructure = (items) => {
  return items.reduce((acc, current) => {
    return Object.assign({}, acc, {
      [current.id]: current,
    });
  }, {});
};

export default class Provider {
  constructor(api, store) {
    this._api = api;
    this._store = store;
  }

  getFilms() {
    if (isOnline()) {
      return this._api.getFilms()
      .then((films) => {
        this._store.setItems(createStoreStructure(films));
        return films;
      });
    }
    return Promise.resolve(
        Object.values(this._store.getItems())
    );
  }

  updateFilm(film) {
    if (isOnline()) {
      return this._api.updateFilm(film)
        .then((updatedFilm) => {
          this._store.setItem(updatedFilm.id, updatedFilm);
          return updatedFilm;
        });
    }

    this._store.setItem(film.id, Object.assign({}, film));

    return Promise.resolve(film);
  }

  sync() {
    const updatedFilms = Object.values(this._store.getItems()).filter((film) => !film.isSynced).map(this._api.adaptFilmToServer);
    if (updatedFilms.length) {
      return isOnline() ? this._api.sync(updatedFilms) : Promise.reject(new Error(`No connection to sync`));
    }
    return Promise.resolve(`Sync not needed`);
  }

  getComments(filmId) {
    return this._api.getComments(filmId);
  }

  addComment(comment, filmId) {
    if (!isOnline()) {
      renderToast(`Can't add comment offline`);
      return Promise.reject(new Error(`No connection to add`));
    }
    return this._api.addComment(comment, filmId);
  }

  deleteComment(filmId) {
    if (!isOnline()) {
      renderToast(`Can't delete offline`);
      return Promise.reject(new Error(`No connection to delete`));
    }
    return this._api.deleteComment(filmId);
  }
}

