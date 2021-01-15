import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {EMOJIS} from "../const.js";
import {generateTemplate} from "../utils/render.js";
import SmartView from "./smart.js";

const createCommentTemplate = (commentElement) => {
  const {emoji, text, date, author} = commentElement;

  dayjs.extend(relativeTime);
  const formatDate = dayjs(date).format(`YYYY-MM-DD`);
  const dateFromNow = dayjs(`${formatDate}`).fromNow();

  return `<li class="film-details__comment">
    <span class="film-details__comment-emoji">
      <img src="./images/emoji/${emoji}.png" width="55" height="55" alt="emoji-smile">
    </span>
    <div>
      <p class="film-details__comment-text">${text}</p>
      <p class="film-details__comment-info">
        <span class="film-details__comment-author">${author}</span>
        <span class="film-details__comment-day">${dateFromNow}</span>
        <button class="film-details__comment-delete">Delete</button>
      </p>
    </div>
  </li>`;
};

const createEmojiTemplate = (emoji) => {
  return `<input class="film-details__emoji-item visually-hidden" name="comment-emoji" type="radio" id="emoji-${emoji}" value="${emoji} checked">
    <label class="film-details__emoji-label" for="emoji-${emoji}">
      <img src="./images/emoji/${emoji}.png" width="30" height="30" alt="emoji-${emoji}">
    </label>`;
};


const createCommentsListTemplate = (comments, text) => {
  const commentTemplate = generateTemplate(comments, createCommentTemplate);
  const emojiTemplate = generateTemplate(EMOJIS, createEmojiTemplate);

  const renderComment = (commentText) => {
    const userText = commentText ? `${commentText}` : ``;
    return userText;
  };

  return `<div class="film-details__bottom-container">
      <section class="film-details__comments-wrap">
        <h3 class="film-details__comments-title">Comments <span class="film-details__comments-count">${comments.length}</span></h3>

        <ul class="film-details__comments-list">
          ${commentTemplate}
        </ul>

        <div class="film-details__new-comment">
          <div for="add-emoji" class="film-details__add-emoji-label">

          </div>

          <label class="film-details__comment-label">
            <textarea class="film-details__comment-input" placeholder="Select reaction below and write comment here" name="comment" value="${text}">${renderComment(text)}</textarea>
          </label>

          <div class="film-details__emoji-list">
            ${emojiTemplate}
          </div>
        </div>
      </section>
    </div>`;
};

export default class Comments extends SmartView {
  constructor(comments) {
    super();
    this._state = comments;
    this._emoji = null;
    this._text = null;

    this._emojiClickHandler = this._emojiClickHandler.bind(this);
    this._commentInputHandler = this._commentInputHandler.bind(this);
    this._commentToggleHandler = this._commentToggleHandler.bind(this);
    this._setInnerHandlers();
  }

  _getTemplate() {
    return createCommentsListTemplate(this._state, this._text);
  }

  restoreHandlers() {
    this._setInnerHandlers();
  }

  _createCommentEmoji(evt) {
    const emojiName = evt.target.value.split(` `, 1);
    this._emoji = emojiName.toString();
    const commentEmoji = `<img src="images/emoji/${emojiName}.png" width="55" height="55" alt="${emojiName}" value="${emojiName}"></img>`;

    return commentEmoji;
  }

  chooseEmoji(evt) {
    const emojiContainer = document.querySelector(`.film-details__add-emoji-label`);

    const emoji = this._createCommentEmoji(evt);
    emojiContainer.innerHTML = emoji;
  }

  _emojiClickHandler(evt) {
    if (evt.target.classList.contains(`film-details__emoji-item`)) {
      evt.preventDefault();
      this.chooseEmoji(evt);
    }
  }

  _commentInputHandler(evt) {
    evt.preventDefault();
    this._text = evt.target.value;
  }

  _setInnerHandlers() {
    this.getElement()
        .querySelector(`.film-details__emoji-list`)
        .addEventListener(`click`, this._emojiClickHandler);
    this.getElement()
        .querySelector(`.film-details__comment-input`)
        .addEventListener(`input`, this._commentInputHandler);
    document.addEventListener(`keydown`, this._commentToggleHandler);
  }

  _commentToggleHandler(evt) {
    if ((evt.ctrlKey || evt.metaKey) && evt.key === `Enter`) {
      this._emoji = this._emoji ? this._emoji : ``;
      this._text = this._text ? this._text : ``;
      if (this._emoji === `` && this._text === ``) {
        return;
      }

      // Видимо обработчики на обновление нужно будет переносить во вьюху попапа, а логику в презентер коммента?

      const newComment = {
        emoji: this._emoji,
        comment: this._text,
      };

      document.removeEventListener(`keydown`, this._commentToggleHandler);
      this.updateData({
        comments: [...this._state, newComment],
      });
    }
  }
}
