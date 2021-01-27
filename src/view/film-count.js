import AbstractView from "./abstract.js";

const createFilmCountTemplate = (filmsCount) => {
  return (
    `<p>${filmsCount} movies inside</p>`
  );
};

export default class FilmCount extends AbstractView {
  constructor(filmsCount) {
    super();
    this._filmsCount = filmsCount;
  }

  _getTemplate() {
    return createFilmCountTemplate(this._filmsCount);
  }
}

