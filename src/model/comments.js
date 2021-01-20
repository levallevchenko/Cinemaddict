import Observer from "../utils/observer.js";
import {UserAction} from "../const.js";

export default class CommentsModel extends Observer {
  constructor(api) {
    super();
    this._api = api;
    this._comments = [];
    // this.addObserver(this.deleteComment, this.addComment)
  }

  setComments(comments, updateType) {
    this._comments = comments.slice();

    this._notify(updateType);
  }

  getComments() {
    return this._comments;
  }

  deleteComment(updateType, update) {
    return this._api.deleteComment(update.id)
    .then(() => {
      this._comments = this._comments.filter((comment) => (comment.id !== update.id));
      // this._notify(updateType, update);
    });
  }

  addComment(update, filmId) {
    return this._api.addComment(update, filmId)
    .then((response) => {
      this._comments = response.comments;
      this._notify(UserAction.ADD_COMMENT, response);
    });
  }

  getErrorComment() {
    const errorComment = {
      id: `!!!`,
      author: `site`,
      date: new Date(),
      emotion: `angry`,
      text: `Не удалось загрузить комментарии.`
    };
    this._comments = [errorComment];
    return errorComment;
  }

  static adaptToClient(comment) {
    const adaptedComment = Object.assign(
        {},
        comment,
        {
          text: comment.comment,
          emoji: comment.emotion
        }
    );
    delete adaptedComment.comment;
    delete adaptedComment.emotion;

    return adaptedComment;
  }

  static adaptToServer(comment) {
    const adaptedComment = Object.assign(
        {},
        comment,
        {
          comment: comment.text,
          emotion: comment.emoji
        }
    );
    delete adaptedComment.text;
    delete adaptedComment.emoji;

    return adaptedComment;
  }
}
