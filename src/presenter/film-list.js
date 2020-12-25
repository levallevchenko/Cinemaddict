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

export default class FilmList {
  constructor(filmListContainer) {
    this._filmListContainer = filmListContainer;
    this._renderedFilmCount = FILM_COUNT_PER_STEP;

    this._filmListComponent = new FilmListView();
    this._sortComponent = new SortView(this._currentSortType);
    this._noFilmsComponent = new NoFilmsView();
    this._showMoreButtonComponent = new ShowMoreButtonView();
    this._topRatedFilmsComponent = new TopRatedFilmsView();
    this._mostCommentedFilmsComponent = new MostCommentedFilmsView();

    this._cardComponent = new Map();
    this._cardTopRatedComponent = new Map();
    this._cardMostCommentedComponent = new Map();

    this._filmDetailsComponent = null;
    this._filmDetailsId = null;

    this._currentSortType = SortType.DEFAULT;

    this._handleWatchlistClick = this._handleWatchlistClick.bind(this);
    this._handleWatchedClick = this._handleWatchedClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
    this._closeFilmDetails = this._closeFilmDetails.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);
    this._handleShowMoreButtonClick = this._handleShowMoreButtonClick.bind(this);

    this._renderFilmCard = this._renderFilmCard.bind(this);
    this._renderExtraFilmCard = this._renderExtraFilmCard.bind(this);

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

  _handleFilmChange(updatedFilm) {
    this._films = updateItem(this._films, updatedFilm);
    this._reRenderFilmCard(updatedFilm, this._cardComponent);
    this._renderExtraFilmCard(updatedFilm, this._cardTopRatedComponent, this._topRatedContainer);
    this._renderExtraFilmCard(updatedFilm, this._cardMostCommentedComponent, this._mostCommentedContainer);

    if (updatedFilm.id === this._filmDetailsId && this._filmDetailsComponent) {
      this._renderFilmDetails(updatedFilm);
    }
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

  _renderFilmCard(film, collection, container) {
    this._filmCardComponent = this._createFilmCard(film);

    collection.set(film.id, this._filmCardComponent);
    render(container, this._filmCardComponent, RenderPosition.BEFOREEND);
  }

  _reRenderFilmCard(film, collection) {
    this._filmCardComponent = this._createFilmCard(film);

    replace(this._filmCardComponent, collection.get(film.id));
    collection.set(film.id, this._filmCardComponent);
  }

  _renderExtraFilmCard(film, collection, container) {
    const filmCardComponent = this._createFilmCard(film);

    if (collection.has(film.id)) {
      replace(filmCardComponent, collection.get(film.id));
      collection.set(film.id, filmCardComponent);
    }
    if (collection.size < FILM_EXTRA_COUNT) {
      render(container, filmCardComponent, RenderPosition.BEFOREEND);
      collection.set(film.id, filmCardComponent);
    }
  }

  _closeFilmDetails() {
    remove(this._filmDetailsComponent);
    this._filmDetailsComponent = null;
    document.removeEventListener(`keydown`, this._escKeyDownHandler);
  }

  _escKeyDownHandler(evt) {
    escPressHandler(evt, this._closeFilmDetails);
  }

  _renderFilmDetails(film) {
    if (this._filmDetailsComponent) {
      remove(this._filmDetailsComponent);
    }

    this._filmDetailsId = film.id;

    this._filmDetailsComponent = new FilmDetailsView(film);
    this._commentsComponent = new CommentsView(film);

    document.addEventListener(`keydown`, this._escKeyDownHandler);

    this._filmDetailsComponent.setCloseButtonClickHandler(() => this._closeFilmDetails());
    this._filmDetailsComponent.setWatchlistChangeHandler(() => this._handleWatchlistClick(film));
    this._filmDetailsComponent.setWatchedChangeHandler(() => this._handleWatchedClick(film));
    this._filmDetailsComponent.setFavoriteChangeHandler(() => this._handleFavoriteClick(film));

    render(this._filmListContainer, this._filmDetailsComponent, RenderPosition.BEFOREEND);
    render(this._filmDetailsComponent, this._commentsComponent, RenderPosition.BEFOREEND);
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
    this._renderFilms(this._renderedFilmCount, this._renderedFilmCount + FILM_COUNT_PER_STEP, this._cardComponent, this._filmsContainer);
    this._renderedFilmCount += FILM_COUNT_PER_STEP;

    if (this._renderedFilmCount >= this._films.length) {
      remove(this._showMoreButtonComponent);
    }
  }

  _renderShowMoreButton() {
    render(this._filmsList, this._showMoreButtonComponent, RenderPosition.BEFOREEND);
    this._showMoreButtonComponent.setShowMoreClickHandler(this._handleShowMoreButtonClick);
  }

  _renderFilms(from, to, collection, container, renderCard = this._renderFilmCard) {
    this._films
      .slice(from, to)
      .forEach((film) => renderCard(film, collection, container));
  }

  _renderExtraFilms() {
    render(this._filmListComponent, this._topRatedFilmsComponent, RenderPosition.BEFOREEND);
    render(this._filmListComponent, this._mostCommentedFilmsComponent, RenderPosition.BEFOREEND);

    this._extraContainers = this._filmListComponent.getElement().querySelectorAll(`.films-list--extra .films-list__container`);
    this._topRatedContainer = this._extraContainers[0];
    this._mostCommentedContainer = this._extraContainers[1];

    this._renderFilms(0, FILM_EXTRA_COUNT, this._cardTopRatedComponent, this._topRatedContainer, this._renderExtraFilmCard);
    this._renderFilms(0, FILM_EXTRA_COUNT, this._cardMostCommentedComponent, this._mostCommentedContainer, this._renderExtraFilmCard);
  }

  _renderFilmList() {
    this._renderSort();

    if (this._films.length === 0) {
      this._renderNoFilms();
      return;
    }

    this._renderFilms(0, Math.min(this._films.length, FILM_COUNT_PER_STEP), this._cardComponent, this._filmsContainer);

    if (this._films.length > FILM_COUNT_PER_STEP) {
      this._renderShowMoreButton();
    }
  }

  _clearFilmList() {
    this._cardComponent.forEach((component) => remove(component));
    this._cardComponent = new Map();
    this._renderedFilmCount = FILM_COUNT_PER_STEP;
    remove(this._showMoreButtonComponent);
  }

}
