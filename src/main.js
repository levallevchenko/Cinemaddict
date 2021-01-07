import {render, RenderPosition} from "./utils/render.js";
import {FILM_COUNT} from "./view/film-count.js";
import UserRatingView from "./view/user-rating.js";
import FilterView from "./view/filter.js";
import FilmCountView from "./view/film-count.js";
import {generateFilm} from "./mock/film.js";
import {generateFilmsFilter} from "./mock/filter.js";
import FilmListPresenter from "./presenter/film-list.js";
import FilmsModel from "./model/films.js";

const films = new Array(FILM_COUNT).fill().map(generateFilm);
const filters = generateFilmsFilter(films);

const filmsModel = new FilmsModel();
filmsModel.setFilms(films);

const siteHeaderElement = document.querySelector(`.header`);
const siteMainElement = document.querySelector(`.main`);
const filmCountElement = document.querySelector(`.footer__statistics`);

const filmListPresenter = new FilmListPresenter(siteMainElement, filmsModel);

render(siteHeaderElement, new UserRatingView().getElement(), RenderPosition.BEFOREEND);
render(siteMainElement, new FilterView(filters).getElement(), RenderPosition.BEFOREEND);

filmListPresenter.init();

render(filmCountElement, new FilmCountView().getElement(), RenderPosition.BEFOREEND);
