import dayjs from "dayjs";
import he from "he";
import {EMOJIS} from "../const.js";
import {generateTemplate} from "../utils/render.js";
import {checkActiveElement, getFormatTime} from "../utils/project.js";
import SmartView from "./smart.js";

const SHAKE_DURATION = 500;
const DURATION_DIVIDER = 1000;

const createGenresTemplate = (genre) => {
  return `<span class="film-details__genre">${genre}</span>`;
};

const createEmojiTemplate = (emoji) => {
  return `<input class="film-details__emoji-item visually-hidden" name="comment-emoji" type="radio" id="emoji-${emoji}" value="${emoji} checked">
    <label class="film-details__emoji-label" for="emoji-${emoji}">
      <img src="./images/emoji/${emoji}.png" width="30" height="30" alt="emoji-${emoji}">
    </label>`;
};

const createFilmDetailsTemplate = (state, commentsCount) => {
  const {poster, title, rating, duration, genre, description, originalTitle, director, writers, actors, releaseDate, country, ageLimit, isWatchlist, isWatched, isFavorite, commentText} = state;

  const filmReleaseDate = dayjs(releaseDate).format(`DD MMMM YYYY`);
  const filmGenresTemplate = generateTemplate(genre, createGenresTemplate);

  const checkedClass = `checked`;

  const isWatchlistChecked = checkActiveElement(isWatchlist, checkedClass);
  const isWatchedChecked = checkActiveElement(isWatched, checkedClass);
  const isFavoriteChecked = checkActiveElement(isFavorite, checkedClass);

  const formatFilmDuration = getFormatTime(duration);

  const emojiTemplate = generateTemplate(EMOJIS, createEmojiTemplate);

  const userComment = commentText || ``;

  return (
    `<section class="film-details">
      <form class="film-details__inner" action="" method="get">
        <div class="film-details__top-container">
          <div class="film-details__close">
            <button class="film-details__close-btn" type="button">close</button>
          </div>
          <div class="film-details__info-wrap">
            <div class="film-details__poster">
              <img class="film-details__poster-img" src="${poster}" alt="poster of ${title} film">

              <p class="film-details__age">${ageLimit}+</p>
            </div>

            <div class="film-details__info">
              <div class="film-details__info-head">
                <div class="film-details__title-wrap">
                  <h3 class="film-details__title">${title}</h3>
                  <p class="film-details__title-original">Original: ${originalTitle}</p>
                </div>

                <div class="film-details__rating">
                  <p class="film-details__total-rating">${rating}</p>
                </div>
              </div>

              <table class="film-details__table">
                <tbody><tr class="film-details__row">
                  <td class="film-details__term">Director</td>
                  <td class="film-details__cell">${director}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Writers</td>
                  <td class="film-details__cell">${writers}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Actors</td>
                  <td class="film-details__cell">${actors}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Release Date</td>
                  <td class="film-details__cell">${filmReleaseDate}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Runtime</td>
                  <td class="film-details__cell">${formatFilmDuration}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Country</td>
                  <td class="film-details__cell">${country}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">${genre.length > 1 ? `Genres` : `Genre`}</td>
                  <td class="film-details__cell">${filmGenresTemplate}</td>
                </tr>
              </tbody></table>

              <p class="film-details__film-description">
                ${description}
              </p>
            </div>
          </div>

          <section class="film-details__controls">
            <input type="checkbox" class="film-details__control-input visually-hidden" id="watchlist" name="watchlist" ${isWatchlistChecked}>
            <label for="watchlist" class="film-details__control-label film-details__control-label--watchlist">Add to watchlist</label>

            <input type="checkbox" class="film-details__control-input visually-hidden" id="watched" name="watched" ${isWatchedChecked}>
            <label for="watched" class="film-details__control-label film-details__control-label--watched">Already watched</label>

            <input type="checkbox" class="film-details__control-input visually-hidden" id="favorite" name="favorite" ${isFavoriteChecked}>
            <label for="favorite" class="film-details__control-label film-details__control-label--favorite">Add to favorites</label>
          </section>
        </div>

        <div class="film-details__bottom-container">
          <section class="film-details__comments-wrap">
            <h3 class="film-details__comments-title">Comments <span class="film-details__comments-count">${commentsCount}</span></h3>

            <ul class="film-details__comments-list"></ul>

            <div class="film-details__new-comment">
              <div for="add-emoji" class="film-details__add-emoji-label">

              </div>

              <label class="film-details__comment-label">
                <textarea class="film-details__comment-input" placeholder="Select reaction below and write comment here" name="comment" value="">${he.encode(userComment)}</textarea>
              </label>
              <div class="film-details__emoji-list">
                ${emojiTemplate}
              </div>
              <div class="film-details__comment-send-description"><p>Please, press <code>Ctrl/Command + Enter</code> for send comment.</p></div>
            </div>
          </section>
        </div>
      </form>
    </section>`
  );
};

export default class FilmDetails extends SmartView {
  constructor(film, commentsCount) {
    super();
    this._state = this._parseFilmToState(film);
    this._commentsCount = (commentsCount === 0) ? this._state.comments.length : commentsCount;

    this._isCommentFormDisabled = false;
    this._isOnline = false;

    this._closeButtonClickHandler = this._closeButtonClickHandler.bind(this);
    this._watchlistToggleHandler = this._watchlistToggleHandler.bind(this);
    this._watchedToggleHandler = this._watchedToggleHandler.bind(this);
    this._favoriteToggleHandler = this._favoriteToggleHandler.bind(this);
    this._emojiClickHandler = this._emojiClickHandler.bind(this);
    this._commentInputHandler = this._commentInputHandler.bind(this);
    this._setInnerHandlers();

    this._commentsCountContainerElement = this.getElement().querySelector(`.film-details__comments-title`);
    this._commentsCountElement = this._commentsCountContainerElement.querySelector(`.film-details__comments-count`);
    this._emojiContainer = this.getElement().querySelector(`.film-details__add-emoji-label`);
    this._emojiList = this.getElement().querySelector(`.film-details__emoji-list`);
    this._textarea = this.getElement().querySelector(`.film-details__comment-input`);
    this._newComment = this.getElement().querySelector(`.film-details__new-comment`);
  }

  _getTemplate() {
    return createFilmDetailsTemplate(this._state, this._commentsCount);
  }

  _parseFilmToState(film) {
    return Object.assign(
        {},
        film,
        {
          commentEmoji: ``,
          commentText: ``,
          scroll: null
        }
    );
  }

  _parseStateToFilm(state) {
    state = Object.assign({}, state);
    delete state.commentEmoji;
    delete state.commentText;
    delete state.scroll;
    return state;
  }

  restoreHandlers() {
    this.setCloseClickHandler(this._callback.click);
    this.setFavoriteClickHandler(this._callback.favoriteClick);
    this.setWatchlistClickHandler(this._callback.watchlistClick);
    this.setWatchedlistClickHandler(this._callback.watchedClick);
    this._setInnerHandlers();
  }

  _closeButtonClickHandler(evt) {
    evt.preventDefault();
    this._callback.click();
  }

  _watchlistToggleHandler(evt) {
    evt.preventDefault();
    this._callback.watchlistClick();
  }

  _watchedToggleHandler(evt) {
    evt.preventDefault();
    this._callback.watchedClick();
  }

  _favoriteToggleHandler(evt) {
    evt.preventDefault();
    this._callback.favoriteClick();
  }

  setCloseButtonClickHandler(callback) {
    const closeButton = this.getElement().querySelector(`.film-details__close-btn`);
    this._callback.click = callback;
    closeButton.addEventListener(`click`, this._closeButtonClickHandler);
  }

  setWatchlistChangeHandler(callback) {
    this._callback.watchlistClick = callback;
    this.getElement()
        .querySelector(`#watchlist`)
        .addEventListener(`change`, this._watchlistToggleHandler);
  }

  setWatchedChangeHandler(callback) {
    this._callback.watchedClick = callback;
    this.getElement()
        .querySelector(`#watched`)
        .addEventListener(`change`, this._watchedToggleHandler);
  }

  setFavoriteChangeHandler(callback) {
    this._callback.favoriteClick = callback;
    this.getElement()
        .querySelector(`#favorite`)
        .addEventListener(`change`, this._favoriteToggleHandler);
  }

  _createCommentEmoji(evt) {
    const emojiName = evt.target.value.split(` `, 1);
    this._emoji = emojiName.toString();
    this._commentEmoji = `<img src="images/emoji/${emojiName}.png" width="55" height="55" alt="${emojiName}" value="${emojiName}"></img>`;

    return this._commentEmoji;
  }

  chooseEmoji(evt) {
    const emoji = this._createCommentEmoji(evt);
    this._emojiContainer.innerHTML = emoji;
  }

  _emojiClickHandler(evt) {
    if (evt.target.classList.contains(`film-details__emoji-item`)) {
      evt.preventDefault();
      this.updateData({
        commentEmoji: evt.target.value.split(` `)[0]
      }, true);

      if (this._state.commentEmoji) {
        this.chooseEmoji(evt);
      }
    }
  }

  _commentInputHandler(evt) {
    if (evt.target.value.length && !this._isOnline) {
      this._isOnline = true;
      window.addEventListener(`offline`, this.onCommentFormError);
    }
    if (evt.target.value.length === 0 && this._isOnline) {
      this._isOnline = false;
      window.removeEventListener(`offline`, this.onCommentFormError);
    }

    evt.preventDefault();
    this.updateData({
      commentText: evt.target.value
    }, true);
  }

  _setInnerHandlers() {
    this.getElement()
        .querySelector(`.film-details__emoji-list`)
        .addEventListener(`click`, this._emojiClickHandler);

    this.getElement()
      .querySelector(`.film-details__comment-input`)
      .addEventListener(`input`, this._commentInputHandler);
  }

  _getErrorComment() {
    this._emojiContainer.classList.add(`film-details__comment-required`);
    this._textarea.classList.add(`film-details__comment-required`);
  }

  getUserCommentData() {
    if (!this._state.commentText || !this._state.commentEmoji) {
      this._getErrorComment();
      this._textarea.placeholder = `You forgot to select an emoji or write a comment`;
      return null;
    }
    return {
      text: this._state.commentText,
      emoji: this._state.commentEmoji,
      film: this._state
    };
  }

  userCommentErrorHandler() {
    this._getErrorComment();
    this._newComment.style.animation = `shake ${SHAKE_DURATION / DURATION_DIVIDER}s`;
    setTimeout(() => {
      this._newComment.style.animation = ``;
    }, SHAKE_DURATION);
  }

  clearInput() {
    this._emojiContainer.innerHTML = ``;
    this._textarea.value = ``;
    this._textarea.focus();
    this._getScroll();
  }

  disableCommentInputs() {
    this._textarea.disabled = !this._isCommentFormDisabled;
    this._emojiList.style.pointerEvents = `none`;
  }


  getScroll() {
    this._scroll = window.pageYOffset;
    return this._scroll;
  }

  backToScroll(scroll) {
    this.getElement().scroll(0, scroll);
  }
}
