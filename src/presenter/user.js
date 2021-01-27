import {render, remove, replace, RenderPosition} from "../utils/render.js";
import UserRatingView from "../view/user-rating.js";

export default class UserPresenter {
  constructor(userModel) {
    this._userModel = userModel;
    this._handleUserRatingChange = this._handleUserRatingChange.bind(this);

    this._userModel.addObserver(this._handleUserRatingChange);
  }

  init() {
    const siteHeaderElement = document.querySelector(`.header`);
    this._prevUserComponent = this._userComponent;
    this._userRating = this._userModel.getRating();
    this._userComponent = new UserRatingView(this._userRating);

    if (!this._prevUserComponent) {
      render(siteHeaderElement, this._userComponent, RenderPosition.BEFOREEND);
      return;
    }

    replace(this._userComponent, this._prevUserComponent);
    remove(this._prevUserComponent);
  }

  _handleUserRatingChange() {
    this.init();
  }
}
