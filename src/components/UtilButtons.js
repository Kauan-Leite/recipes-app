import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import copy from 'clipboard-copy';
import whiteHeartIcon from '../images/whiteHeartIcon.svg';
import blackHeartIcon from '../images/blackHeartIcon.svg';
import shareIcon from '../images/shareIcon.svg';
import Context from '../context/Context';

function UtilButtons({ recipeObj, isDrink, copyText }) {
  const {
    copiedMessageTimer,
    setCopiedMessageTimer,
  } = useContext(Context);
  const {
    strArea,
    idDrink,
    strDrink,
    strAlcoholic,
    strCategory,
    strDrinkThumb,
    strMeal,
    idMeal,
    strMealThumb,
  } = recipeObj;

  const checkFavorited = () => {
    const favoritedRecipes = localStorage.getItem('favoriteRecipes');
    if (favoritedRecipes !== null) {
      const alreadyFavorited = JSON.parse(favoritedRecipes)
        .find((recipe) => recipe.id === idDrink || recipe.id === idMeal);
      return alreadyFavorited;
    }
    return false;
  };
  const [favoritedRecipe, setFavoritedRecipe] = useState(checkFavorited());

  const favoriteShape = {
    id: isDrink ? idDrink : idMeal,
    type: isDrink ? 'drink' : 'food',
    nationality: strArea || '',
    category: strCategory,
    alcoholicOrNot: strAlcoholic || '',
    name: isDrink ? strDrink : strMeal,
    image: isDrink ? strDrinkThumb : strMealThumb,
  };

  const deleteFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteRecipes'));
    const newFavorites = JSON.stringify(favorites
      .filter((fav) => fav.id !== idDrink && fav.id !== idMeal));
    localStorage.setItem('favoriteRecipes', newFavorites);
  };

  const handleFavorite = (favorited) => {
    if (favorited) {
      deleteFavorite();
    } else if (localStorage.getItem('favoriteRecipes') === null) {
      localStorage.setItem('favoriteRecipes', JSON.stringify([favoriteShape]));
    } else {
      const oldData = localStorage.getItem('favoriteRecipes');
      const recuperedData = JSON.parse(oldData);
      const newArray = [...recuperedData, favoriteShape];
      localStorage.setItem('favoriteRecipes', JSON.stringify(newArray));
    }
    setFavoritedRecipe((prev) => !prev);
  };

  useEffect(() => {
    checkFavorited();
    // eslint-disable-next-line
  }, []);

  const handleCopy = () => {
    const twoSeconds = 2;
    setCopiedMessageTimer(twoSeconds);
    copy(copyText);
  };

  return (
    <div className="util-buttons">
      <button
        type="button"
        data-testid="share-btn"
        onClick={ () => handleCopy() }
      >
        <img src={ shareIcon } alt="Share icon." />
      </button>
      <button
        type="button"
        onClick={ () => handleFavorite(favoritedRecipe) }
      >
        <img
          data-testid="favorite-btn"
          className="favorite-btn"
          src={ favoritedRecipe ? blackHeartIcon : whiteHeartIcon }
          alt="Favorited icon."
        />
      </button>

      <p
        className={ `copied-message ${copiedMessageTimer > 0
          ? ''
          : 'hidden'
        }` }
      >
        Link copied!
      </p>
    </div>
  );
}

UtilButtons.propTypes = {
  recipeObj: PropTypes.shape({
    strCategory: PropTypes.string,
    idMeal: PropTypes.string,
    strArea: PropTypes.string,
    idDrink: PropTypes.string,
    strDrink: PropTypes.string,
    strAlcoholic: PropTypes.string,
    strDrinkThumb: PropTypes.string,
    strMeal: PropTypes.string,
    strMealThumb: PropTypes.string,
  }).isRequired,
  isDrink: PropTypes.bool.isRequired,
  copyText: PropTypes.string.isRequired,
};

export default UtilButtons;
