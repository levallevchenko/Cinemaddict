import AbstractView from "./abstract.js";

const createUserRatingTemplate = (userRating) => {
  const userRatingName = userRating ? userRating : ``;

  return (
    `<section class="header__profile profile">
      <p class="profile__rating">${userRatingName}</p>
      <img class="profile__avatar" src="images/bitmap@2x.png" alt="Avatar" width="35" height="35">
    </section>`
  );
};

export default class UserRating extends AbstractView {
  constructor(userRatingName) {
    super();
    this._userRatingName = userRatingName;
  }

  _getTemplate() {
    return createUserRatingTemplate(this._userRatingName);
  }
}
