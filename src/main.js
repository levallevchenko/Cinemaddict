import {SiteState, UpdateType} from './const';
import {render, RenderPosition, remove} from "./utils/render.js";
import FilmCountView from "./view/film-count.js";
import StatsView from './view/statistics';
import UserPresenter from './presenter/user.js';
import FilmListPresenter from "./presenter/film-list.js";
import FilterPresenter from "./presenter/filter.js";
import FilmsModel from "./model/films.js";
import FilterModel from "./model/filter.js";
import CommentsModel from "./model/comments.js";
import UserModel from './model/user.js';
import Api from "./api.js";


const AUTHORIZATION = `Basic 7sfij3v23hjhd8d1a`;
const END_POINT = `https://13.ecmascript.pages.academy/cinemaddict/`;

const api = new Api(END_POINT, AUTHORIZATION);

const siteMainElement = document.querySelector(`.main`);
const filmCountElement = document.querySelector(`.footer__statistics`);

const filmsModel = new FilmsModel();
const filterModel = new FilterModel();
const commentsModel = new CommentsModel(api);
const userModel = new UserModel(filmsModel);

let stats;
const changeSiteState = (action) => {
  switch (action) {
    case SiteState.FILMS:
      remove(stats);
      filmListPresenter.init();
      break;
    case SiteState.STATS:
      filmListPresenter.destroy();
      stats = new StatsView(filmsModel.getFilms(), userModel.getRating());
      render(siteMainElement, stats.getElement(), RenderPosition.BEFOREEND);
      break;
  }
};

const userPresenter = new UserPresenter(userModel);
const filmListPresenter = new FilmListPresenter(siteMainElement, filmsModel, filterModel, commentsModel, userPresenter, api);
const filterPresenter = new FilterPresenter(siteMainElement, filterModel, filmsModel, changeSiteState);

filterPresenter.init();
filmListPresenter.init();

api.getFilms()
  .then((films) => {
    filmsModel.setFilms(UpdateType.INIT, films);
    userPresenter.init();
    render(filmCountElement, new FilmCountView(films.length), RenderPosition.BEFOREEND);
  })
  .catch(() => {
    filmsModel.setFilms(UpdateType.INIT, []);
  });
