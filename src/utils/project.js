import dayjs from "dayjs";

const minuteInHour = 60;

const getWeightForNoDataFilm = (dataA, dataB) => {
  if (dataA === null && dataB === null) {
    return 0;
  }

  if (dataA === null) {
    return 1;
  }

  if (dataB === null) {
    return -1;
  }

  return null;
};

export const getFormatTime = (time) => {
  const hours = `${Math.floor(time / minuteInHour)}h`;
  const minutes = `${time % minuteInHour}m`;
  const formatTime = hours.slice(0, 1) === `0` ? `${minutes}` : `${hours} ${minutes}`;

  return formatTime;
};

export const checkActiveElement = (active, activeClass) => active
  ? activeClass
  : ``;

export const escPressHandler = (evt, action) => {
  if (evt.key === `Escape` || evt.key === `Esc`) {
    evt.preventDefault();
    action();
  }
};

export const sortByDate = (filmA, filmB) => {
  const weight = getWeightForNoDataFilm(filmA.releaseDate, filmB.releaseDate);

  if (weight !== null) {
    return weight;
  }

  return dayjs(filmB.releaseDate).diff(filmA.releaseDate);
};

export const sortByRating = (filmA, filmB) => {
  const weight = getWeightForNoDataFilm(filmA.rating, filmB.rating);

  if (weight !== null) {
    return weight;
  }

  return filmB.rating - filmA.rating;
};

export const sortByComments = (filmA, filmB) => {
  const weight = getWeightForNoDataFilm(filmA.comments.length, filmB.comments.length);

  if (weight !== null) {
    return weight;
  }

  return filmB.comments.length - filmA.comments.length;
};

export const getScroll = () => window.pageYOffset;

export const backToScroll = (scrollValue) => window.scrollTo(0, scrollValue);

