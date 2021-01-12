import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {nanoid} from "nanoid";
import {getRandomInteger, getRandomNumber, getElementFromArray, generateSentenceFromString, generateRandomArray, generateRandomDate} from "../utils/common.js";
import {EMOJIS} from "../const.js";

const NAMES_MIN_COUNT = 2;
const NAMES_MAX_COUNT = 4;
const GENRES_MIN_COUNT = 1;
const GENRES_MAX_COUNT = 4;

const COMMENT_MIN_COUNT = 1;
const COMMENT_MAX_COUNT = 5;
const RATING_MIN_VALUE = 1;
const RATING_MAX_VALUE = 10;

const FILM_CREATE_MIN_DATE = `1900, 2, 1`;
const FILM_MIN_DURATION = 90;
const FILM_MAX_DURATION = 360;

const COMMENTS_MIN_COUNT = 1;
const COMMENTS_MAX_COUNT = 5;

const DATE_OF_FIRST_COMMENT = `2020, 2, 1`;

dayjs.extend(relativeTime);

const filmTitles = [
  `The Dance of Life`,
  `Sagebrush Trail`,
  `The Man with the Golden Arm`,
  `Santa Claus Conquers the Martians`,
  `Popeye the Sailor Meets Sindbad the Sailor`,
];

const posters = [
  `made-for-each-other.png`,
  `popeye-meets-sinbad.png`,
  `sagebrush-trail.jpg`,
  `santa-claus-conquers-the-martians.jpg`,
  `the-dance-of-life.jpg`,
  `the-great-flamarion.jpg`,
  `the-man-with-the-golden-arm.jpg`,
];

const descriptionString = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras aliquet varius magna, non porta ligula feugiat eget. Fusce tristique felis at fermentum pharetra. Aliquam id orci ut lectus varius viverra. Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante. Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum. Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui. Sed sed nisi sed augue convallis suscipit in sed felis. Aliquam erat volutpat. Nunc fermentum tortor ac porta dapibus. In rutrum ac purus sit amet tempus.`;

const descriptionArray = descriptionString.split(`. `);

const filmGenres = [`Western`, `Musical`, `Drama`, `Comedy`, `Cartoon`, `Horror`, `Film-Noir`, `Mystery`];

const originalTitles = [
  `The Dance of Life`,
  `Sagebrush Trail`,
  `The Man with the Golden Arm`,
  `Santa Claus Conquers the Martians`,
  `Popeye the Sailor Meets Sindbad the Sailor`,
];

const namesOfDirectors = [
  `Steven Spielberg`,
  `Martin Scorsese `,
  `Alfred Hitchcock`,
  `Stanley Kubrick`,
  `Quentin Tarantino`,
  `Orson Welles`,
  `Francis Ford Coppola`,
  `Ridley Scott`,
];

const namesOfWriters = [
  `David O. Russell`,
  `James Cameron`,
  `Aaron Sorkin`,
  `John Ridley`,
  `Quentin Tarantino`,
  `Steven Spielberg`,
];

const namesOfActors = [
  `Robert De Niro`,
  `Jack Nicholson`,
  `Meryl Streep`,
  `Tom Hanks`,
  `Leonardo DiCaprio`,
  `Kate Winslet`,
  `Jodie Foster`,
  `Charles Chaplin`,
];

const names = [
  `John Smith`,
  `Lise Kane`,
  `Michel Mur`,
  `Genry Right`,
  `Mary Black`,
  `Tim Bert`,
];

const countries = [`Canada`, `China`, `UK`, `Russia`, `Australia`, `USA`];
const ageLimits = [`0+`, `6+`, `12+`, `14+`, `16+`, `18+`];

const generateFilmComment = () => {
  const commentDate = generateRandomDate(new Date(DATE_OF_FIRST_COMMENT), new Date());

  return {
    emoji: getElementFromArray(EMOJIS),
    comment: generateSentenceFromString(descriptionString),
    commentDate: commentDate.fromNow(),
    author: getElementFromArray(names),
  };
};

export const generateFilm = () => {
  const id = nanoid();
  const filmTitle = getElementFromArray(filmTitles);
  const poster = getElementFromArray(posters);
  const description = generateRandomArray(descriptionArray, 1, 5);
  const rating = getRandomNumber(RATING_MIN_VALUE, RATING_MAX_VALUE).toFixed(1);

  const filmReleaseDate = generateRandomDate(new Date(FILM_CREATE_MIN_DATE), new Date());
  const releaseDate = filmReleaseDate.format(`DD MMMM YYYY`);
  const releaseYear = filmReleaseDate.format(`YYYY`);
  const watchingDate = generateRandomDate(new Date(`2020-11-17T03:24:00`), new Date());

  const duration = getRandomInteger(FILM_MIN_DURATION, FILM_MAX_DURATION);
  const genre = generateRandomArray(filmGenres, GENRES_MIN_COUNT, GENRES_MAX_COUNT);
  const commentsCount = getRandomInteger(COMMENTS_MIN_COUNT, COMMENTS_MAX_COUNT);

  const originalTitle = getElementFromArray(originalTitles);
  const director = getElementFromArray(namesOfDirectors);
  const writers = generateRandomArray(namesOfWriters, NAMES_MIN_COUNT, NAMES_MAX_COUNT).join(`, `);
  const actors = generateRandomArray(namesOfActors, NAMES_MIN_COUNT, NAMES_MAX_COUNT).join(`, `);
  const country = getElementFromArray(countries);
  const ageLimit = getElementFromArray(ageLimits);

  const comments = new Array(getRandomInteger(COMMENT_MIN_COUNT, COMMENT_MAX_COUNT)).fill().map(generateFilmComment);

  return {
    id,
    filmTitle,
    poster,
    description,
    rating,
    releaseYear,
    duration,
    genre,
    commentsCount,

    originalTitle,
    director,
    writers,
    actors,
    releaseDate,
    country,
    ageLimit,
    isWatchlist: Boolean(getRandomInteger(0, 1)),
    isWatched: Boolean(getRandomInteger(0, 1)),
    isFavorite: Boolean(getRandomInteger(0, 1)),
    isEmoji: Boolean(getRandomInteger(0, 1)),
    watchingDate,
    comments,
  };
};
