import FilterView from "../view/filter.js";
import {render, RenderPosition, replace, remove} from "../utils/render.js";
import {filter} from "../utils/filter.js";
import {FilterType, UpdateType, SiteState} from "../const.js";

export default class Filter {
  constructor(filterContainer, filterModel, filmsModel, changeSiteState) {
    this._filterContainer = filterContainer;
    this._filterModel = filterModel;
    this._filmsModel = filmsModel;
    this._changeSiteState = changeSiteState;

    this._currentFilter = FilterType.ALL;
    this._filterComponent = null;

    this._isFilmListShowing = true;

    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleFilterTypeChange = this._handleFilterTypeChange.bind(this);
    this._handleStatsButtonClick = this._handleStatsButtonClick.bind(this);

    this._filmsModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);
  }

  init() {
    this._currentFilter = this._filterModel.getFilter();

    const filters = this._getFilters();
    const prevFilterComponent = this._filterComponent;

    this._filterComponent = new FilterView(filters, this._currentFilter);
    this._filterButtons = Array.from(this._filterComponent.getElement().querySelectorAll(`.main-navigation__item`));

    this._filterComponent.setFilterTypeChangeHandler(this._handleFilterTypeChange);
    this._filterComponent.setStatsButtonClickHandler(this._handleStatsButtonClick);

    if (prevFilterComponent === null) {
      render(this._filterContainer, this._filterComponent, RenderPosition.BEFOREEND);
      return;
    }

    replace(this._filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  _handleModelEvent() {
    this.init();
  }

  _handleFilterTypeChange(filterType) {
    if (this._currentFilter === filterType && this._isFilmListShowing) {
      return;
    }

    if (!this._isFilmListShowing) {
      this._isFilmListShowing = true;
      this._changeSiteState(SiteState.FILMS);
    }

    this._filterModel.setFilter(UpdateType.MAJOR, filterType);
  }

  _handleStatsButtonClick() {
    if (!this._isFilmListShowing) {
      return;
    }
    this._filterButtons.forEach((filterButton) => {
      filterButton.classList.remove(`main-navigation__item--active`);
    });

    this._filterComponent.getElement().querySelector(`.main-navigation__additional`).classList.add(`main-navigation__additional--active`);

    this._isFilmListShowing = false;

    this._changeSiteState(SiteState.STATS);
  }

  _getFilters() {
    const films = this._filmsModel.getFilms();

    return [
      {
        type: FilterType.WATCHLIST,
        name: `watchlist`,
        count: filter[FilterType.WATCHLIST](films).length
      },
      {
        type: FilterType.WATCHED,
        name: `watched`,
        count: filter[FilterType.WATCHED](films).length
      },
      {
        type: FilterType.FAVORITES,
        name: `favorites`,
        count: filter[FilterType.FAVORITES](films).length
      }
    ];
  }
}
