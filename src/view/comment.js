import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {DeleteButtonState} from "../const.js";
import AbstractView from "./abstract.js";

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

export default class Comments extends AbstractView {
  constructor(comment) {
    super();
    this._comment = comment;
    this._deleteButtonClickHandler = this._deleteButtonClickHandler.bind(this);
  }

  _getTemplate() {
    return createCommentTemplate(this._comment);
  }

  _deleteButtonClickHandler(evt) {
    evt.preventDefault();
    this._callback.deleteClick();
  }

  setDeleteButtonClickHandler(callback) {
    this._callback.deleteClick = callback;
    this.getElement()
        .querySelector(`.film-details__comment-delete`)
        .addEventListener(`click`, this._deleteButtonClickHandler);
  }

  changeDeleteButtonState() {
    const deleteButton = this.getElement().querySelector(`.film-details__comment-delete`);
    deleteButton.textContent = this._isCommentDisabled ? DeleteButtonState.REGULAR : DeleteButtonState.DISABLED;
    deleteButton.disabled = !this._isCommentDisabled;
    this._isCommentDisabled = !this._isCommentDisabled;
  }
}
