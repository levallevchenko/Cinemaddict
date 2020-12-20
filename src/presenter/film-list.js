import {escPressHandler, sortByDate, sortByRating} from "../utils/project.js";
import {render, RenderPosition, remove, replace} from "../utils/render.js";
import {updateItem} from "../utils/common.js";
import {SortType} from "../const.js";
import SortView from "../view/films-sort.js";
import NoFilmsView from "../view/no-films.js";
import FilmListView from "../view/film-list.js";
import FilmCardView from "../view/film-card.js";
import FilmDetailsView from "../view/film-details.js";
import CommentsView from "../view/comments.js";
import ShowMoreButtonView from "../view/show-more-button.js";
import TopRatedFilmsView from "../view/top-rated-films.js";
import MostCommentedFilmsView from "../view/most-commented-films.js";

const FILM_COUNT_PER_STEP = 5;
const FILM_EXTRA_COUNT = 2;

const Mode = {
  DEFAULT: `DEFAULT`,
  POPUP: `POPUP`
};

export default class FilmList {
  constructor(filmListContainer) {
    this._filmListContainer = filmListContainer;
    this._renderedFilmCount = FILM_COUNT_PER_STEP;

    this._filmListComponent = new FilmListView();
    this._sortComponent = new SortView(this._currentSortType);
    this._noFilmsComponent = new NoFilmsView();
    this._showMoreButtonComponent = new ShowMoreButtonView();
    this._topRatedFilmsComponent = new TopRatedFilmsView();
    this._MostCommentedFilmsComponent = new MostCommentedFilmsView();

    this._cardComponent = new Map();
    this._filmDetailsComponent = null;
    this._currentSortType = SortType.DEFAULT;
    this._mode = Mode.DEFAULT;

    this._handleWatchlistClick = this._handleWatchlistClick.bind(this);
    this._handleWatchedClick = this._handleWatchedClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);

    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);
    this._handleShowMoreButtonClick = this._handleShowMoreButtonClick.bind(this);

    this._renderFilmCard = this._renderFilmCard.bind(this);

    this._filmsList = this._filmListComponent.getElement().querySelector(`.films-list`); // список
    this._filmsContainer = this._filmListComponent.getElement().querySelector(`.films-list__container`); // карточки
  }

  init(films) {
    this._films = films.slice();
    this._sourcedFilms = films.slice();

    render(this._filmListContainer, this._filmListComponent, RenderPosition.BEFOREEND);
    this._renderFilmList();
    this._renderExtraFilms();
  }

  _resetView() {
    if (this._mode !== Mode.DEFAULT) {
      remove(this._filmDetailsComponent);
    }
  }

  _handleModeChange() {
    Object
      .values(this._cardComponent)
      .forEach((component) => component.this._resetView());
  }

  _handleFilmChange(updatedFilm) {
    this._films = updateItem(this._films, updatedFilm);
    this._reRenderFilmCard(updatedFilm);
    this._reRenderFilmDetails(updatedFilm);
  }

  _sortFilmCards(sortType) {
    switch (sortType) {
      case SortType.DATE:
        this._films.sort(sortByDate);
        break;
      case SortType.RATING:
        this._films.sort(sortByRating);
        break;
      default:
        this._films = this._sourcedFilms.slice();
    }

    this._currentSortType = sortType;
  }

  _handleSortTypeChange(sortType) {
    if (this._currentSortType === sortType) {
      return;
    }

    this._sortFilmCards(sortType);
    this._clearFilmList();
    this._renderFilmList();
  }

  _renderSort() {
    render(this._filmListContainer, this._sortComponent, RenderPosition.AFTERBEGIN);
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);
  }

  _renderNoFilms() {
    render(this._filmListContainer, this._noFilmsComponent, RenderPosition.BEFOREEND);
  }

  _createFilmCard(film) {
    const filmCardComponent = new FilmCardView(film);

    filmCardComponent.setFilmCardClickHandler(() => this._renderFilmDetails(film));
    filmCardComponent.setWatchlistClickHandler(() => this._handleWatchlistClick(film));
    filmCardComponent.setWatchedClickHandler(() => this._handleWatchedClick(film));
    filmCardComponent.setFavoriteClickHandler(() => this._handleFavoriteClick(film));

    return filmCardComponent;
  }

  _renderFilmCard(container, film) {
    this._filmCardComponent = this._createFilmCard(film);
    this._mode = Mode.DEFAULT;

    this._cardComponent.set(film.id, this._filmCardComponent);
    this._handleModeChange();

    render(container, this._filmCardComponent, RenderPosition.BEFOREEND);
  }

  _reRenderFilmCard(film) {
    this._filmCardComponent = this._createFilmCard(film);
    // Новым компонентом заменяем старый
    replace(this._filmCardComponent, this._cardComponent.get(film.id));
    // Перезапишет по тому же ключу
    this._cardComponent.set(film.id, this._filmCardComponent);
  }

  _renderFilmDetails(film) {
    this._filmDetailsComponent = new FilmDetailsView(film);
    this._commentsComponent = new CommentsView(film);

    this._mode = Mode.POPUP;
    // this._handleModeChange();

    const escKeyDownHandler = (evt) => escPressHandler(evt, this._closeFilmDetails);

    document.addEventListener(`keydown`, escKeyDownHandler);

    this._closeFilmDetails = () => {
      remove(this._filmDetailsComponent);
      document.removeEventListener(`keydown`, escKeyDownHandler);
    };

    this._chooseEmoji = (evt) => {
      const emojiContainer = document.querySelector(`.film-details__add-emoji-label`);
      emojiContainer.removeChild(emojiContainer.firstChild);

      const emoji = this._commentsComponent.createCommentsEmoji(evt);
      emojiContainer.insertAdjacentHTML(RenderPosition.BEFOREEND, emoji);
    }

    this._commentsComponent.setEmojiClickHandler((evt) => this._chooseEmoji(evt));

    this._filmDetailsComponent.setCloseButtonClickHandler(() => this._closeFilmDetails());
    this._filmDetailsComponent.setFavoriteClickHandler(() => this._handleFavoriteClick(film));
    this._filmDetailsComponent.setWatchlistClickHandler(() => this._handleWatchlistClick(film));
    this._filmDetailsComponent.setWatchedClickHandler(() => this._handleWatchedClick(film));

    render(this._filmListContainer, this._filmDetailsComponent, RenderPosition.BEFOREEND);
    render(this._filmDetailsComponent, this._commentsComponent, RenderPosition.BEFOREEND);
  }

  _reRenderFilmDetails(film) {
    this._filmDetailsComponent = new FilmDetailsView(film);

    this._renderFilmDetails(film);

    const prevFilmDetailsComponent = this._filmDetailsComponent;

    if (this._mode === Mode.POPUP) {
      replace(this._filmDetailsComponent, prevFilmDetailsComponent);
    }

    remove(prevFilmDetailsComponent);
  }

  _handleWatchlistClick(film) {
    this._handleFilmChange(
        Object.assign(
            {},
            film,
            {
              isWatchlist: !film.isWatchlist
            }
        )
    );
  }

  _handleWatchedClick(film) {
    this._handleFilmChange(
        Object.assign(
            {},
            film,
            {
              isWatched: !film.isWatched
            }
        )
    );
  }

  _handleFavoriteClick(film) {
    this._handleFilmChange(
        Object.assign(
            {},
            film,
            {
              isFavorite: !film.isFavorite
            }
        )
    );
  }

  _handleShowMoreButtonClick() {
    this._renderFilms(this._filmsContainer, this._renderedFilmCount, this._renderedFilmCount + FILM_COUNT_PER_STEP);
    this._renderedFilmCount += FILM_COUNT_PER_STEP;

    if (this._renderedFilmCount >= this._films.length) {
      remove(this._showMoreButtonComponent);
    }
  }

  _renderShowMoreButton() {
    render(this._filmsList, this._showMoreButtonComponent, RenderPosition.BEFOREEND);
    this._showMoreButtonComponent.setShowMoreClickHandler(this._handleShowMoreButtonClick);
  }

  _renderFilms(container, from, to) {
    this._films
      .slice(from, to)
      .forEach((film) => this._renderFilmCard(container, film));
  }

  _renderExtraFilms() {
    render(this._filmListComponent, this._topRatedFilmsComponent, RenderPosition.BEFOREEND);
    render(this._filmListComponent, this._MostCommentedFilmsComponent, RenderPosition.BEFOREEND);

    this._filmsExtraContainers = this._filmListComponent.getElement().querySelectorAll(`.films-list--extra .films-list__container`);
    this._renderFilms(this._filmsExtraContainers[0], 0, FILM_EXTRA_COUNT);
    this._renderFilms(this._filmsExtraContainers[1], 0, FILM_EXTRA_COUNT);
  }

  _renderFilmList() {
    this._renderSort();

    if (this._films.length === 0) {
      this._renderNoFilms();
      return;
    }

    this._renderFilms(this._filmsContainer, 0, Math.min(this._films.length, FILM_COUNT_PER_STEP));

    if (this._films.length > FILM_COUNT_PER_STEP) {
      this._renderShowMoreButton();
    }
  }

  _clearFilmList() {
    Object
      .values(this._cardComponent)
      .forEach((component) => component.this._destroy());
    this._cardComponent = new Map();
    this._renderedFilmCount = FILM_COUNT_PER_STEP;
    remove(this._showMoreButtonComponent);
  }

  _destroy() {
    remove(this._filmCardComponent);
    remove(this._filmDetailsComponent);
  }

}
