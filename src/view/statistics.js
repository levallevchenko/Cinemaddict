import {StatsPeriod} from "../const";
import Smart from "./smart.js";
import dayjs from "dayjs";
import Chart from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

const renderChart = (statisticCtx) => {
  const sortedGeners = [...genres].sort((previous, current) => current[1] - previous[1]);
  genres.clear();

  const genreNames = sortedGeners.map((value) => value[0]);
  const genreValues = sortedGeners.map((value) => value[1]);

  const BAR_HEIGHT = 40;

  statisticCtx.height = BAR_HEIGHT * sortedGeners.length;

  return new Chart(statisticCtx, {
    plugins: [ChartDataLabels],
    type: `horizontalBar`,
    data: {
      labels: genreNames,
      datasets: [{
        data: genreValues,
        backgroundColor: `#ffe800`,
        hoverBackgroundColor: `#ffe800`,
        anchor: `start`,
        barThickness: 24
      }]
    },
    options: {
      plugins: {
        datalabels: {
          font: {
            size: 20
          },
          color: `#ffffff`,
          anchor: `start`,
          align: `start`,
          offset: 40,
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: `#ffffff`,
            padding: 100,
            fontSize: 20
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
        }],
        xAxes: [{
          ticks: {
            display: false,
            beginAtZero: true
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      }
    }
  });
};

const genres = new Map();

const createStats = (state) => {
  const chosenPeriodTime = (state.period === StatsPeriod.ALL) ? -Infinity : dayjs().subtract(1, `${state.period}`);

  let filmsWatched = 0;
  let totalMinutesDuration = 0;

  state.films.forEach((film) => {
    if (film.isWatched && +new Date(film.watchingDate) > chosenPeriodTime) {
      filmsWatched++;
      totalMinutesDuration += film.duration;
      film.genre.forEach((currentGenre) => {
        if (genres.has(currentGenre)) {
          genres.set(currentGenre, genres.get(currentGenre) + 1);
          return;
        }
        genres.set(currentGenre, 1);
      });
    }
  });

  const getTopGenre = () => {
    let topGenre = {
      genre: ``,
      watched: 0
    };

    genres.forEach((watchedNumber, genre) => {
      if (watchedNumber > topGenre.watched) {
        topGenre.genre = genre;
        topGenre.watched = watchedNumber;
      }
    });

    return topGenre.genre;
  };

  const totalDuration = {
    hours: Math.floor(totalMinutesDuration / 60),
    minutes: totalMinutesDuration % 60
  };

  const getCheckedState = (statsPeriod) => {
    return (state.period === statsPeriod) ? ` checked` : ``;
  };

  const setRank = (userRating) => {
    const rank = userRating === null
      ? ``
      : `<p class="statistic__rank">
        Your rank
        <img class="statistic__img" src="images/bitmap@2x.png" alt="Avatar" width="35" height="35">
        <span class="statistic__rank-label">${userRating}</span>
        </p>`
    return rank;
  };

  return `<section class="statistic">
    ${setRank(state.userRating)}

  <form action="https://echo.htmlacademy.ru/" method="get" class="statistic__filters">
    <p class="statistic__filters-description">Show stats:</p>

    <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-all-time" value="${StatsPeriod.ALL}" ${getCheckedState(StatsPeriod.ALL)}>
    <label for="statistic-all-time" class="statistic__filters-label">All time</label>

    <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-today" value="${StatsPeriod.TODAY}" ${getCheckedState(StatsPeriod.TODAY)}>
    <label for="statistic-today" class="statistic__filters-label">Today</label>

    <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-week" value="${StatsPeriod.WEEK}" ${getCheckedState(StatsPeriod.WEEK)}>
    <label for="statistic-week" class="statistic__filters-label">Week</label>

    <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-month" value="${StatsPeriod.MONTH}" ${getCheckedState(StatsPeriod.MONTH)}>
    <label for="statistic-month" class="statistic__filters-label">Month</label>

    <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-year" value="${StatsPeriod.YEAR}" ${getCheckedState(StatsPeriod.YEAR)}>
    <label for="statistic-year" class="statistic__filters-label">Year</label>
  </form>

  <ul class="statistic__text-list">
    <li class="statistic__text-item">
      <h4 class="statistic__item-title">You watched</h4>
      <p class="statistic__item-text">${filmsWatched} <span class="statistic__item-description">movies</span></p>
    </li>
    <li class="statistic__text-item">
      <h4 class="statistic__item-title">Total duration</h4>
      <p class="statistic__item-text">${totalDuration.hours} <span class="statistic__item-description">h</span> ${totalDuration.minutes} <span class="statistic__item-description">m</span></p>
    </li>
    <li class="statistic__text-item">
      <h4 class="statistic__item-title">Top genre</h4>
      <p class="statistic__item-text">${getTopGenre()}</p>
    </li>
  </ul>

  <div class="statistic__chart-wrap">
    <canvas class="statistic__chart" width="1000"></canvas>
  </div>

</section>`;
};

export default class Stats extends Smart {
  constructor(films, userRating) {
    super();
    this._state = {
      films,
      userRating,
      period: StatsPeriod.ALL
    };
    this._chart = null;
    this._periodButtonClickHandler = this._periodButtonClickHandler.bind(this);

    this._setChart();
    this._setHandlers();
  }

  _getTemplate() {
    return createStats(this._state);
  }

  removeElement() {
    super.removeElement();
    if (this._chart !== null) {
      this._chart = null;
    }
  }

  _periodButtonClickHandler(evt) {
    if (evt.target.tagName !== `INPUT`) {
      return;
    }
    this.updateData({period: evt.target.value});
    this._setChart();
  }

  _setHandlers() {
    this.getElement().querySelector(`.statistic__filters`).addEventListener(`click`, this._periodButtonClickHandler);
  }

  restoreHandlers() {
    this._setHandlers();
  }

  _setChart() {
    if (this._chart !== null) {
      this._chart = null;
    }
    const statisticCtx = this.getElement().querySelector(`.statistic__chart`);
    this._chart = renderChart(statisticCtx);
  }
}
