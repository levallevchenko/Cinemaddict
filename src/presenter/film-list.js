import {escPressHandler, sortByDate, sortByRating, sortByComments, backToScroll} from "../utils/project.js";
import {render, RenderPosition, remove, replace} from "../utils/render.js";
import {filter} from "../utils/filter.js";
import {SortType, UserAction, UpdateType} from "../const.js";
import SortView from "../view/films-sort.js";
import LoadingView from "../view/loading.js";
import NoFilmsView from "../view/no-films.js";
import FilmListView from "../view/film-list.js";
import FilmCardView from "../view/film-card.js";
import FilmDetailsView from "../view/film-details.js";
import CommentView from "../view/comment.js";
import ShowMoreButtonView from "../view/show-more-button.js";
import TopRatedFilmsView from "../view/top-rated-films.js";
import MostCommentedFilmsView from "../view/most-commented-films.js";
// import CommentPresenter from "./comment.js"

const FILM_COUNT_PER_STEP = 5;
const FILM_EXTRA_COUNT = 2;

export default class FilmList {
  constructor(filmListContainer, filmsModel, filterModel, commentsModel, api) {
    this._filmListContainer = filmListContainer;
    this._filmsModel = filmsModel;
    this._filterModel = filterModel;
    this._commentsModel = commentsModel;
    this._api = api;
    this._renderedFilmCount = FILM_COUNT_PER_STEP;

    this._loadingComponent = new LoadingView();
    this._noFilmsComponent = new NoFilmsView();
    this._filmListComponent = new FilmListView();
    this._topRatedFilmsComponent = new TopRatedFilmsView();
    this._mostCommentedFilmsComponent = new MostCommentedFilmsView();

    this._cardComponent = new Map();
    this._cardTopRatedComponent = new Map();
    this._cardMostCommentedComponent = new Map();
    this._userCommentComponent = new Map();

    this._filmDetailsComponent = null;
    this._filmDetailsId = null;
    this._sortComponent = null;
    this._showMoreButtonComponent = null;

    this._currentSortType = SortType.DEFAULT;
    this._isLoading = true;

    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);

    this._handleWatchlistClick = this._handleWatchlistClick.bind(this);
    this._handleWatchedClick = this._handleWatchedClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
    this._handleCommentSubmit = this._handleCommentSubmit.bind(this);
    this._handleCommentDelete = this._handleCommentDelete.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);
    this._handleShowMoreButtonClick = this._handleShowMoreButtonClick.bind(this);
    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
    this._closeFilmDetails = this._closeFilmDetails.bind(this);

    this._renderFilmCard = this._renderFilmCard.bind(this);
    this._renderExtraFilmCard = this._renderExtraFilmCard.bind(this);

    this._renderComments = this._renderComments.bind(this);

    this._filmsModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);
    this._commentsModel.addObserver(this._handleModelEvent);
  }

  init() {
    this._filmsList = this._filmListComponent.getElement().querySelector(`.films-list`); // список
    this._filmsContainer = this._filmListComponent.getElement().querySelector(`.films-list__container`); // карточки

    render(this._filmListContainer, this._filmListComponent, RenderPosition.BEFOREEND);

    if (this._isLoading) {
      this._renderLoading();
      return;
    }

    this._renderFilmList();
    this._renderExtraFilms();
  }

  _getFilms() {
    const filterType = this._filterModel.getFilter();
    const films = this._filmsModel.getFilms();
    const filteredFilms = filter[filterType](films);
    this._filteredFilmsCount = filteredFilms.length;
    const currentFilteredFilms = filteredFilms.slice();

    switch (this._currentSortType) {
      case SortType.DATE:
        return currentFilteredFilms.sort(sortByDate);
      case SortType.RATING:
        return currentFilteredFilms.sort(sortByRating);
      default:
        return filteredFilms;
    }
  }

  destroy() {
    this._clearFilmList({resetRenderedFilms: true, resetSort: true});
    remove(this._filmListComponent);
  }

  _handleViewAction(actionType, updateType, update, film) {
    switch (actionType) {
      case UserAction.UPDATE_FILM:
        this._api.updateFilm(update).then((response) => {
          this._filmsModel.updateFilm(updateType, response);
        });
        break;
      case UserAction.ADD_COMMENT:
        this._commentsModel.addComment(update, film.id);
        break;
      case UserAction.DELETE_COMMENT:
        this._commentsModel.deleteComment(updateType, update);
        break;
    }
  }

  _handleModelEvent(updateType, updatedFilm) {
    // В зависимости от типа изменений решаем, что делать:
    switch (updateType) {
      case UpdateType.PATCH:
      // - обновить часть списка (например, при изменении кнопки управления)
        this._handleFilmChange(updatedFilm);
        break;
      case UpdateType.MINOR:
      // - обновить список (например, при изменении кнопки управления в отфильтрованном списке (возможно здесь MAJOR – сам фильтр и показ кнопки show more тоже изменятся. Но сброс сортировки не нужен (т.к в отфильтрованном всегда default))
        this._handleFilmChange(updatedFilm);
        this._clearFilmList();
        this._renderFilmList();
        break;
      case UpdateType.MAJOR:
        // - обновить всю доску (например, при переключении фильтра)
        this._clearFilmList({resetRenderedFilmCount: true, resetSortType: true});
        this._renderFilmList();
        break;
      case UpdateType.INIT:
        this._isLoading = false;
        remove(this._loadingComponent);
        this._renderFilmList();
        this._renderExtraFilms();
        break;
    }
  }

  _handleFilmChange(updatedFilm) {
    this._reRenderFilmCard(updatedFilm, this._cardComponent);

    this._renderExtraFilmCard(updatedFilm, this._cardTopRatedComponent, this._topRatedContainer);
    this._renderExtraFilmCard(updatedFilm, this._cardMostCommentedComponent, this._mostCommentedContainer);

    if (updatedFilm.id === this._filmDetailsId && this._filmDetailsComponent) {
      this._renderFilmDetails(updatedFilm);
    }
  }

  _handleSortTypeChange(sortType) {
    if (this._currentSortType === sortType) {
      return;
    }

    this._currentSortType = sortType;
    this._clearFilmList({resetRenderedFilmCount: true});
    this._renderFilmList();
  }

  _renderSort() {
    if (this._sortComponent !== null) {
      this._sortComponent = null;
    }

    this._sortComponent = new SortView(this._currentSortType);
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);

    render(this._filmListContainer, this._sortComponent, RenderPosition.AFTERBEGIN);
  }

  _renderLoading() {
    render(this._filmListContainer, this._loadingComponent, RenderPosition.BEFOREEND);
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

    if (!collection.has(film.id)) {
      collection.set(film.id, this._filmCardComponent);
    }

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
    this._userCommentComponent.forEach((component) => remove(component));
    this._userCommentComponent = new Map();

    document.removeEventListener(`keydown`, this._escKeyDownHandler);
    document.removeEventListener(`keydown`, this._handleCommentSubmit);
  }

  _escKeyDownHandler(evt) {
    escPressHandler(evt, this._closeFilmDetails);
  }

  _renderComments(film) {
    this._api.getComments(film.id)
    .then((comments) => {
      comments.forEach((comment) => {
        this._commentComponent = new CommentView(comment);
        render(this._commentsContainer, this._commentComponent, RenderPosition.BEFOREEND);

        this._commentComponent.setDeleteButtonClickHandler(() => this._handleCommentDelete(comment, film));

        this._userCommentComponent.set(comment.id, this._commentComponent);
        return this._userCommentComponent;
      });
    })
    .catch(() => this._commentsModel.getErrorComment());
  }

  _renderFilmDetails(film) {
    if (this._filmDetailsComponent) {
      remove(this._filmDetailsComponent);
    }

    this._filmDetailsId = film.id;

    this._renderComments(film);

    this._commentsCount = this._userCommentComponent.size;

    this._filmDetailsComponent = new FilmDetailsView(film, this._commentsCount);
    this._commentsContainer = this._filmDetailsComponent.getElement().querySelector(`.film-details__comments-list`);

    const scrollValue = this._filmDetailsComponent.getElement().scrollTop;
    backToScroll(scrollValue)

    render(this._filmListContainer, this._filmDetailsComponent, RenderPosition.BEFOREEND);

    this._filmDetailsComponent.setCloseButtonClickHandler(() => this._closeFilmDetails());
    this._filmDetailsComponent.setWatchlistChangeHandler(() => this._handleWatchlistClick(film));
    this._filmDetailsComponent.setWatchedChangeHandler(() => this._handleWatchedClick(film));
    this._filmDetailsComponent.setFavoriteChangeHandler(() => this._handleFavoriteClick(film));

    document.addEventListener(`keydown`, this._handleCommentSubmit);
    document.addEventListener(`keydown`, this._escKeyDownHandler);
  }

  _handleWatchlistClick(film) {
    this._handleViewAction(
        UserAction.UPDATE_FILM,
        UpdateType.MINOR,
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
    this._handleViewAction(
        UserAction.UPDATE_FILM,
        UpdateType.MINOR,
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
    this._handleViewAction(
        UserAction.UPDATE_FILM,
        UpdateType.MINOR,
        Object.assign(
            {},
            film,
            {
              isFavorite: !film.isFavorite
            }
        )
    );
  }

  _handleCommentSubmit(evt) {
    // const scrollValue = window.pageYOffset;
    if (evt.ctrlKey && evt.key === `Enter`) {
      const userComment = this._filmDetailsComponent.getUserCommentData();
      if (userComment === null) {
        return;
      }
      const {text, emoji, film} = userComment;
      this._handleViewAction(
          UserAction.ADD_COMMENT,
          UpdateType.PATCH,
          Object.assign(
              {},
              {
                text,
                emoji
              },
              {
                date: new Date()
              }),
          film
      );
      this._userCommentComponent.forEach((component) => remove(component));
      this._userCommentComponent = new Map();
      this._handleViewAction(UserAction.UPDATE_FILM, UpdateType.PATCH, film);
      // backToScroll(scrollValue);
    }
  }

  _handleCommentDelete(comment, film) {
    this._commentComponent.changeDeleteButtonState();
    this._handleViewAction(UserAction.DELETE_COMMENT, UpdateType.PATCH, comment);
    this._userCommentComponent.delete(comment.id);
    this._handleViewAction(
        UserAction.UPDATE_FILM,
        UpdateType.PATCH,
        Object.assign(
            {},
            film,
            {
              comments: film.comments.filter((filmComment) => (filmComment !== comment.id))
            }
        ));
  }

  _handleShowMoreButtonClick() {
    const filmCount = this._getFilms().length;
    const newRenderedFilmCount = Math.min(filmCount, this._renderedFilmCount + FILM_COUNT_PER_STEP);
    const films = this._getFilms().slice(this._renderedFilmCount, newRenderedFilmCount);

    this._renderFilms(films, this._cardComponent, this._filmsContainer);
    this._renderedFilmCount = newRenderedFilmCount;

    if (this._renderedFilmCount >= filmCount) {
      remove(this._showMoreButtonComponent);
    }
  }

  _renderShowMoreButton() {
    if (this._showMoreButtonComponent !== null) {
      this._showMoreButtonComponent = null;
    }

    this._showMoreButtonComponent = new ShowMoreButtonView();
    this._showMoreButtonComponent.setShowMoreClickHandler(this._handleShowMoreButtonClick);
    render(this._filmsList, this._showMoreButtonComponent, RenderPosition.BEFOREEND);
  }

  _renderFilms(films, collection, container, renderCard = this._renderFilmCard) {
    films.forEach((film) => renderCard(film, collection, container));
  }

  _renderExtraFilms() {
    const films = this._getFilms().slice();
    const filmCount = films.length;

    if (filmCount === 0) {
      return;
    }
    const topRatedFilms = films.sort(sortByRating).slice(0, FILM_EXTRA_COUNT);
    const mostCommentedFilms = films.sort(sortByComments).slice(0, FILM_EXTRA_COUNT);

    render(this._filmListComponent, this._topRatedFilmsComponent, RenderPosition.BEFOREEND);
    render(this._filmListComponent, this._mostCommentedFilmsComponent, RenderPosition.BEFOREEND);

    this._extraContainers = this._filmListComponent.getElement().querySelectorAll(`.films-list--extra .films-list__container`);
    this._topRatedContainer = this._extraContainers[0];
    this._mostCommentedContainer = this._extraContainers[1];

    this._renderFilms(topRatedFilms, this._cardTopRatedComponent, this._topRatedContainer, this._renderExtraFilmCard);
    this._renderFilms(mostCommentedFilms, this._cardMostCommentedComponent, this._mostCommentedContainer, this._renderExtraFilmCard);
  }

  _renderFilmList() {
    if (this._isLoading) {
      this._renderLoading();
      return;
    }

    const filmCount = this._getFilms().length;
    const films = this._getFilms().slice(0, Math.min(filmCount, this._renderedFilmCount));

    if (filmCount === 0 || this._filteredFilmsCount === 0) {
      this._renderNoFilms();
      return;
    }

    if (filmCount > this._renderedFilmCount) {
      this._renderShowMoreButton();
    }

    this._renderSort();
    this._renderFilms(films, this._cardComponent, this._filmsContainer);
  }

  _clearFilmList({resetRenderedFilmCount = false, resetSortType = false} = {}) {
    const filmCount = this._getFilms().length;

    this._cardComponent.forEach((component) => remove(component));
    this._cardComponent = new Map();

    remove(this._sortComponent);
    remove(this._loadingComponent);
    remove(this._noFilmsComponent);
    remove(this._showMoreButtonComponent);

    if (resetRenderedFilmCount) {
      this._renderedFilmCount = FILM_COUNT_PER_STEP;
    } else {
      this._renderedFilmCount = (filmCount === this._filteredFilmsCount)
        ? this._renderedFilmCount
        : Math.min(filmCount, this._filteredFilmsCount);
    }

    if (resetSortType) {
      this._currentSortType = SortType.DEFAULT;
    }
  }

}
