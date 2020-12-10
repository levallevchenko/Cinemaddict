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
    this._currentSortType = SortType.DEFAULT;

    this._filmInstanceList = new Map;

    this._filmListComponent = new FilmListView();
    this._sortComponent = new SortView(this._currentSortType);
    this._noFilmsComponent = new NoFilmsView();
    this._showMoreButtonComponent = new ShowMoreButtonView();
    this._topRatedFilmsComponent = new TopRatedFilmsView();
    this._MostCommentedFilmsComponent = new MostCommentedFilmsView();

    this._filmCardComponent = null;
    this._filmDetailsComponent = null;
    this._commentsComponent = null;

    this._handleFilmChange = this._handleFilmChange.bind(this);

    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);
    this._handleShowMoreButtonClick = this._handleShowMoreButtonClick.bind(this);

    this._filmsList = this._filmListComponent.getElement().querySelector(`.films-list`);
    this._filmsContainer = this._filmListComponent.getElement().querySelector(`.films-list__container`);
  }

  init(films) {
    this._films = films.slice();
    this._sourcedFilms = films.slice();

    render(this._filmListContainer, this._filmListComponent, RenderPosition.BEFOREEND);
    this._renderAllFilms();
  }

  _handleFilmChange(updatedFilm) {
    this._films = updateItem(this._films, updatedFilm);
    // new FilmCardView(updatedFilm);
    // this._renderFilmCard(container, updatedFilm..);???
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
    this._destroy();
    this._renderFilmList();
  }

  _renderSort() {
    render(this._filmListContainer, this._sortComponent, RenderPosition.AFTERBEGIN);
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);
  }

  _renderNoFilms() {
    render(this._filmListContainer, this._noFilmsComponent, RenderPosition.BEFOREEND);
  }

  _updateFilmCard(container) {
    if (container.contains(prevFilmCardComponent.getElement())) {
      replace(this._filmCardComponent, prevFilmCardComponent);
    }

    if (container.contains(prevFilmDetailsComponent.getElement())) {
      replace(this._filmDetailsComponent, prevFilmDetailsComponent);
    }

    remove(prevFilmCardComponent);
    remove(prevDetailsComponent);
  }

  _renderFilmCard(container, film, changeData) {
    const prevFilmCardComponent = this._filmCardComponent;
    const prevFilmDetailsComponent = this._filmDetailsComponent;

    this._filmCardComponent = new FilmCardView(film);
    this._filmInstanceList[film.id] = this._filmCardComponent;
    this._changeData = changeData;

    this._filmCardComponent.setFilmCardClickHandler(() => this._renderFilmDetails(film));

    if (prevFilmCardComponent === null || prevFilmDetailsComponent === null) {
      render(container, this._filmCardComponent, RenderPosition.BEFOREEND);
      return;
    }

    this._updateFilmCard(container);

    this._handleWatchlistClick = () => {
      this._changeData(
        Object.assign(
          {},
          film,
          {
            isWatchlist: !film.isWatchlist
          }
        )
      );
    }

    this._handleWatchedClick = () => {
      this._changeData(
        Object.assign(
          {},
          film,
          {
            isWatched: !film.isWatched
          }
        )
      );
    }

    this._handleFavoriteClick = () => {
      this._changeData(
        Object.assign(
          {},
          film,
          {
            isFavorite: !film.isFavorite
          }
        )
      );
    }

    this._handleWatchlistClick = this._handleWatchlistClick.bind(this);
    this._handleWatchedClick = this._handleWatchedClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);

    this._filmCardComponent.setWatchlistClickHandler(this._handleWatchlistClick);
    this._filmCardComponent.setWatchedClickHandler(this._handleWatchedClick);
    this._filmCardComponent.setFavoriteClickHandler(this._handleFavoriteClick);
  }

  _renderFilmDetails(film) {
    this._filmDetailsComponent = new FilmDetailsView(film);
    this._commentsComponent = new CommentsView(film);

    this._detailsScreenEscPressHandler = (evt) => escPressHandler(evt, this._closeFilmDetails);
    document.addEventListener(`keydown`, this._detailsScreenEscPressHandler);

    this._closeFilmDetails = () => {
      remove(this._filmDetailsComponent);
      document.removeEventListener(`keydown`, this._detailsScreenEscPressHandler);
    };

    this._handleCloseButtonClick = () => this._closeFilmDetails();
    this._filmDetailsComponent.setCloseButtonClickHandler(this._handleCloseButtonClick);

    render(this._filmListContainer, this._filmDetailsComponent, RenderPosition.BEFOREEND);
    render(this._filmDetailsComponent, this._commentsComponent, RenderPosition.BEFOREEND);
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
    this._showMoreButtonComponent.setShowMoreClickHandler(() => {
      this._handleShowMoreButtonClick();
    });
  }

  _renderFilms(container, from, to, changeData) {
    this._films
      .slice(from, to)
      .forEach((film) => this._renderFilmCard(container, film, changeData));
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
    this._renderFilms(this._filmsContainer, 0, Math.min(this._films.length, FILM_COUNT_PER_STEP), this._handleFilmChange);

    if (this._films.length > FILM_COUNT_PER_STEP) {
      this._renderShowMoreButton();
    }
  }

  _clearFilmList() {
    Object
      .values(this._filmInstanceList)
      .forEach((filmInstance) => filmInstance.this._destroy());
    this._filmInstanceList = {};
    this._renderedFilmCount = FILM_COUNT_PER_STEP;
    remove(this._showMoreButtonComponent);
  }

  _destroy() {
    remove(this._filmCardComponent);
    remove(this._filmDetailsComponent);
  }

  _renderAllFilms() {
    this._renderFilmList();
    this._renderExtraFilms();
  }

}
