import {generateTemplate} from "../utils/render.js";
import {checkActiveElement} from "../utils/project.js";
import SmartView from "./smart.js";

const createGenresTemplate = (genre) => {
  return `<span class="film-details__genre">${genre}</span>`;
};

const createFilmDetailsTemplate = (state) => {
  const {filmPoster, filmTitle, rating, filmDuration, genres, description, filmOriginTitle, director, writers, actors, releaseDate, country, ageLimit, isWatchlist, isWatched, isFavorite} = state;

  const filmGenresTemplate = generateTemplate(genres, createGenresTemplate);

  const checkedClass = `checked`;

  const isWatchlistChecked = checkActiveElement(isWatchlist, checkedClass);
  const isWatchedChecked = checkActiveElement(isWatched, checkedClass);
  const isFavoriteChecked = checkActiveElement(isFavorite, checkedClass);

  return (
    `<section class="film-details">
      <form class="film-details__inner" action="" method="get">
        <div class="film-details__top-container">
          <div class="film-details__close">
            <button class="film-details__close-btn" type="button">close</button>
          </div>
          <div class="film-details__info-wrap">
            <div class="film-details__poster">
              <img class="film-details__poster-img" src="./images/posters/${filmPoster}" alt="">

              <p class="film-details__age">${ageLimit}</p>
            </div>

            <div class="film-details__info">
              <div class="film-details__info-head">
                <div class="film-details__title-wrap">
                  <h3 class="film-details__title">${filmTitle}</h3>
                  <p class="film-details__title-original">Original: ${filmOriginTitle}</p>
                </div>

                <div class="film-details__rating">
                  <p class="film-details__total-rating">${rating}</p>
                </div>
              </div>

              <table class="film-details__table">
                <tbody><tr class="film-details__row">
                  <td class="film-details__term">Director</td>
                  <td class="film-details__cell">${director}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Writers</td>
                  <td class="film-details__cell">${writers}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Actors</td>
                  <td class="film-details__cell">${actors}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Release Date</td>
                  <td class="film-details__cell">${releaseDate}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Runtime</td>
                  <td class="film-details__cell">${filmDuration}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Country</td>
                  <td class="film-details__cell">${country}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">${genres.length > 1 ? `Genres` : `Genre`}</td>
                  <td class="film-details__cell">${filmGenresTemplate}</td>
                </tr>
              </tbody></table>

              <p class="film-details__film-description">
                ${description}
              </p>
            </div>
          </div>

          <section class="film-details__controls">
            <input type="checkbox" class="film-details__control-input visually-hidden" id="watchlist" name="watchlist" ${isWatchlistChecked}>
            <label for="watchlist" class="film-details__control-label film-details__control-label--watchlist">Add to watchlist</label>

            <input type="checkbox" class="film-details__control-input visually-hidden" id="watched" name="watched" ${isWatchedChecked}>
            <label for="watched" class="film-details__control-label film-details__control-label--watched">Already watched</label>

            <input type="checkbox" class="film-details__control-input visually-hidden" id="favorite" name="favorite" ${isFavoriteChecked}>
            <label for="favorite" class="film-details__control-label film-details__control-label--favorite">Add to favorites</label>
          </section>
        </div>

      </form>
    </section>`
  );
};

export default class FilmDetails extends SmartView {
  constructor(film) {
    super();
    this._state = film;

    this._closeButtonClickHandler = this._closeButtonClickHandler.bind(this);
    this._watchlistToggleHandler = this._watchlistToggleHandler.bind(this);
    this._watchedToggleHandler = this._watchedToggleHandler.bind(this);
    this._favoriteToggleHandler = this._favoriteToggleHandler.bind(this);
  }

  _getTemplate() {
    return createFilmDetailsTemplate(this._state);
  }

  restoreHandlers() {
    this.setCloseClickHandler(this._callback.click);
    this.setFavoriteClickHandler(this._callback.favoriteClick);
    this.setWatchlistClickHandler(this._callback.watchlistClick);
    this.setWatchedlistClickHandler(this._callback.watchedClick);
  }

  _closeButtonClickHandler(evt) {
    evt.preventDefault();
    this._callback.click();
  }

  _watchlistToggleHandler(evt) {
    evt.preventDefault();
    this._callback.watchlistClick();
  }

  _watchedToggleHandler(evt) {
    evt.preventDefault();
    this._callback.watchedClick();
  }

  _favoriteToggleHandler(evt) {
    evt.preventDefault();
    this._callback.favoriteClick();
  }

  setCloseButtonClickHandler(callback) {
    const closeButton = this.getElement().querySelector(`.film-details__close-btn`);
    this._callback.click = callback;
    closeButton.addEventListener(`click`, this._closeButtonClickHandler);
  }

  setWatchlistChangeHandler(callback) {
    this._callback.watchlistClick = callback;
    this.getElement()
        .querySelector(`#watchlist`)
        .addEventListener(`change`, this._watchlistToggleHandler);
  }

  setWatchedChangeHandler(callback) {
    this._callback.watchedClick = callback;
    this.getElement()
        .querySelector(`#watched`)
        .addEventListener(`change`, this._watchedToggleHandler);
  }

  setFavoriteChangeHandler(callback) {
    this._callback.favoriteClick = callback;
    this.getElement()
        .querySelector(`#favorite`)
        .addEventListener(`change`, this._favoriteToggleHandler);
  }
}
