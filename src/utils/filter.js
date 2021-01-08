import {FilterType} from "../const";

  export const filter = {
    [FilterType.WATCHLIST]: (films) => films.filter((film) => film.isWatchlist),
    [FilterType.WATCHED]: (films) => films.filter((film) => film.isWatched),
    [FilterType.FAVORITES]: (films) => films.filter((film) => film.isFavorite),
  };

