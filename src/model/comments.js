import Observer from "./observer.js";

export default class CommentsModel extends Observer {
  constructor(api) {
    super();
    this._api = api;
    this._comments = [];
  }

  setComments(comments, updateType) {
    this._comments = comments.slice();

    this._notify(updateType);
  }

  getComments() {
    return this._comments;
  }

  deleteComment(update) {
    return this._api.deleteComment(update.id)
    .then(() => {
      this._comments = this._comments.filter((comment) => (comment.id !== update.id));
    });
  }

  addComment(actionType, update) {
    this._notify(actionType, update);
  }

  getErrorComment() {
    const errorComment = {
      id: `x`,
      author: `Cinemaddict`,
      date: new Date(),
      emoji: `angry`,
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
