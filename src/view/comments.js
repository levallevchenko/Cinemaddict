import dayjs from "dayjs";
import {EMOJIS} from "../const.js";
import SmartView from "./smart.js";
import {generateTemplate} from "../utils/render.js";

const createCommentTemplate = (commentElement) => {
  const {emoji, comment, commentDate, author} = commentElement;

  return `<li class="film-details__comment">
    <span class="film-details__comment-emoji">
      <img src="./images/emoji/${emoji}.png" width="55" height="55" alt="emoji-smile">
    </span>
    <div>
      <p class="film-details__comment-text">${comment}</p>
      <p class="film-details__comment-info">
        <span class="film-details__comment-author">${author}</span>
        <span class="film-details__comment-day">${commentDate}</span>
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


const createCommentsListTemplate = (state) => {
  const {comments, commentText} = state;

  const commentTemplate = generateTemplate(comments, createCommentTemplate);
  const emojiTemplate = generateTemplate(EMOJIS, createEmojiTemplate);

  const renderComment = (comment) => {
    const text = comment ? `${commentText}` : ``;
    return text;
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
            <textarea class="film-details__comment-input" placeholder="Select reaction below and write comment here" name="comment" value=${commentText}>${renderComment(commentText)}</textarea>
          </label>

          <div class="film-details__emoji-list">
            ${emojiTemplate}
          </div>
        </div>
      </section>
    </div>`;
};

export default class Comments extends SmartView {
  constructor(film) {
    super();
    this._state = film;

    this._emojiClickHandler = this._emojiClickHandler.bind(this);
    this._commentInputHandler = this._commentInputHandler.bind(this);
    this._commentToggleHandler = this._commentToggleHandler.bind(this);
    this._setInnerHandlers();
  }

  _getTemplate() {
    return createCommentsListTemplate(this._state);
  }

  restoreHandlers() {
    this._setInnerHandlers();
  }

  _createCommentEmoji(evt) {
    const emojiName = evt.target.value.split(` `, 1);
    const commentEmoji = `<img src="images/emoji/${emojiName}.png" width="55" height="55" alt="${emojiName}" value="${emojiName}"></img>`;

    return commentEmoji;
  }

  _chooseEmoji(evt) {
    const emojiContainer = document.querySelector(`.film-details__add-emoji-label`);

    const emoji = this._createCommentEmoji(evt);
    emojiContainer.innerHTML = emoji;
  }

  _emojiClickHandler(evt) {
    if (evt.target.classList.contains(`film-details__emoji-item`)) {
      evt.preventDefault();
      this.updateData({
        commentEmoji: evt.target.value.split(``)[0]
      });

      if (this._state.commentEmoji) {
        this._chooseEmoji(evt);
      }
    }
  }

  _commentInputHandler(evt) {
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
    document.addEventListener(`keydown`, this._commentToggleHandler);
  }

  _commentToggleHandler(evt) {
    this._commentEmoji = this._state.commentEmoji ? this._state.commentEmoji : ``;
    this._commentText = this._state.commentText ? this._state.commentText : ``;

    if ((evt.ctrlKey || evt.metaKey) && evt.key === `Enter`) {
      if (this._commentText === `` && this._commentEmoji === ``) {
        return;
      }

      const newComment = {
        comment: this._commentText,
        emoji: this._commentEmoji,
        commentDate: dayjs().fromNow(),
        author: this._state.comments[0].author
      };
      delete this._state.commentText;
      delete this._state.commentEmoji;
      document.removeEventListener(`keydown`, this._messageToggleHandler);
      this.updateData({
        comments: [...this._state.comments, newComment]
      });
    }
  }
}
