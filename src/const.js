export const MAX_DESCRIPTION_LENGTH = 140;

export const EMOJIS = [`smile`, `angry`, `puke`, `sleeping`];

export const SortType = {
  DEFAULT: `default`,
  DATE: `date`,
  RATING: `rating`,
};

export const UserAction = {
  UPDATE_FILM: `UPDATE_FILM`,
  ADD_COMMENT: `ADD_COMMENT`,
  DELETE_COMMENT: `DELETE_COMMENT`
};

 export const UpdateType = {
  PATCH: `PATCH`,
  MINOR: `MINOR`,
  MAJOR: `MAJOR`,
  INIT: `INIT`
};

export const FilterType = {
  ALL: `all`,
  WATCHLIST: `watchlist`,
  WATCHED: `watched`,
  FAVORITES: `favorites`
};

export const StatsPeriod = {
  ALL: `all-time`,
  TODAY: `day`,
  WEEK: `week`,
  MONTH: `month`,
  YEAR: `year`
};

export const SiteState = {
  MOVIES: `FILMS`,
  STATS: `STATS`
};

export const UserRating = {
  NOVICE: `novice`,
  FAN: `fan`,
  MOVIE_BUFF: `movie buff`
};

export const RatingFilmCount = {
  NOVICE_FILMS_MAX: 10,
  FAN_FILMS_MAX: 20,
};

export const DeleteButtonState = {
  REGULAR: `Delete`,
  DISABLED: `Deleting...`
};
