import {render, RenderPosition} from "./utils/render.js";
import {escPressHandler} from "./utils/project.js";
import {FILM_COUNT} from "./view/film-count.js";
import UserRatingView from "./view/user-rating.js";
import FilterView from "./view/filter.js";
import SortView from "./view/films-sort.js";
import filmListView from "./view/film-list.js";
import FilmCardView from "./view/film-card.js";
import ShowMoreButtonView from "./view/show-more-button.js";
import FilmDetailsView from "./view/film-details.js";
import CommentsView from "./view/comments.js";
import TopRatedFilmsView from "./view/top-rated-films.js";
import MostCommentedFilmsView from "./view/most-commented-films.js";
import FilmCountView from "./view/film-count.js";
import NoFilmsView from "./view/no-films.js";
import {generateFilm} from "./mock/film.js";
import {generateFilmsFilter} from "./mock/filter.js";

const FILM_COUNT_PER_STEP = 5;
const FILM_EXTRA_COUNT = 2;

const films = new Array(FILM_COUNT).fill().map(generateFilm);
const filters = generateFilmsFilter(films);

const siteHeaderElement = document.querySelector(`.header`);
const siteMainElement = document.querySelector(`.main`);

const filmListComponent = new filmListView();
const filmListElement = filmListComponent.getElement().querySelector(`.films-list`);
const filmsContainerElement = filmListElement.querySelector(`.films-list__container`);

const renderFilmDetails = (film) => {
  const filmDetailsComponent = new FilmDetailsView(film);
  const filmDetailsFormElement = filmDetailsComponent.getElement().querySelector(`.film-details__inner`);
  render(filmListComponent.getElement(), filmDetailsComponent.getElement(), RenderPosition.BEFOREEND);
  render(filmDetailsFormElement, new CommentsView(film).getElement(), RenderPosition.BEFOREEND);

  const closeFilmDetails = () => {
    filmDetailsComponent.getElement().remove();
  };

  const detailsScreenEscPressHandler = (evt) => escPressHandler(evt, closeFilmDetails);

  if (filmDetailsComponent.getElement()) {
    document.addEventListener(`keydown`, detailsScreenEscPressHandler);
  } else {
    document.removeEventListener(`keydown`, detailsScreenEscPressHandler);
  }

  filmDetailsComponent.setCloseButtonClickHandler(() => {
    closeFilmDetails();
    document.removeEventListener(`keydown`, detailsScreenEscPressHandler);
  });
};

const renderFilm = (filmsContainer, film) => {
  const filmCardComponent = new FilmCardView(film);

  // Открывает попап
  filmCardComponent.setFilmCardClickHandler(() => {
    renderFilmDetails(film);
  });

  render(filmsContainer, filmCardComponent.getElement(), RenderPosition.BEFOREEND);
};

const renderFilmsList = (filmListContainer, filmList) => {
  render(filmListContainer, filmListComponent.getElement(), RenderPosition.BEFOREEND);

  for (let i = 0; i < Math.min(filmList.length, FILM_COUNT_PER_STEP); i++) {
    renderFilm(filmsContainerElement, filmList[i]);
  }

  if (filmList.length > FILM_COUNT_PER_STEP) {
    let renderedFilmCount = FILM_COUNT_PER_STEP;
    const showMoreButtonComponent = new ShowMoreButtonView();
    render(filmListElement, showMoreButtonComponent.getElement(), RenderPosition.BEFOREEND);

    showMoreButtonComponent.setShowMoreClickHandler(() => {
      filmList
        .slice(renderedFilmCount, renderedFilmCount + FILM_COUNT_PER_STEP)
        .forEach((film) => renderFilm(filmsContainerElement, film));

      renderedFilmCount += FILM_COUNT_PER_STEP;

      if (renderedFilmCount >= filmList.length) {
        showMoreButtonComponent.getElement().remove();
      }
    });
  }

  render(filmListComponent.getElement(), new TopRatedFilmsView().getElement(), RenderPosition.BEFOREEND);
  render(filmListComponent.getElement(), new MostCommentedFilmsView().getElement(), RenderPosition.BEFOREEND);

  const filmsExtraListElement = filmListComponent.getElement().querySelectorAll(`.films-list--extra`);

  filmsExtraListElement.forEach((filmExtraListElement) => {
    const filmsExtraContainerElement = filmExtraListElement.querySelector(`.films-list__container`);

    for (let i = 0; i < FILM_EXTRA_COUNT; i++) {
      renderFilm(filmsExtraContainerElement, filmList[i]);
    }
  });
};

render(siteHeaderElement, new UserRatingView().getElement(), RenderPosition.BEFOREEND);
render(siteMainElement, new FilterView(filters).getElement(), RenderPosition.BEFOREEND);
render(siteMainElement, new SortView().getElement(), RenderPosition.BEFOREEND);

if (FILM_COUNT === 0) {
  render(siteMainElement, new NoFilmsView().getElement(), RenderPosition.BEFOREEND);
} else {
  renderFilmsList(siteMainElement, films);
}

const filmCountElement = document.querySelector(`.footer__statistics`);
render(filmCountElement, new FilmCountView().getElement(), RenderPosition.BEFOREEND);
