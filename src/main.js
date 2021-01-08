import {render, RenderPosition} from "./utils/render.js";
import {FILM_COUNT} from "./view/film-count.js";
import UserRatingView from "./view/user-rating.js";
import FilmCountView from "./view/film-count.js";
import {generateFilm} from "./mock/film.js";
import FilmListPresenter from "./presenter/film-list.js";
import FilterPresenter from "./presenter/filter.js";
import FilmsModel from "./model/films.js";
import FilterModel from "./model/filter.js";

const films = new Array(FILM_COUNT).fill().map(generateFilm);

const filmsModel = new FilmsModel();
filmsModel.setFilms(films);

const filterModel = new FilterModel();

const siteHeaderElement = document.querySelector(`.header`);
const siteMainElement = document.querySelector(`.main`);
const filmCountElement = document.querySelector(`.footer__statistics`);

const filmListPresenter = new FilmListPresenter(siteMainElement, filmsModel, filterModel);
const filterPresenter = new FilterPresenter(siteMainElement, filterModel, filmsModel);

render(siteHeaderElement, new UserRatingView().getElement(), RenderPosition.BEFOREEND);

filterPresenter.init();
filmListPresenter.init();

render(filmCountElement, new FilmCountView().getElement(), RenderPosition.BEFOREEND);
