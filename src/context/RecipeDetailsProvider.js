import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, useHistory } from 'react-router-dom';
import copy from 'clipboard-copy';
import Context from './Context';
import fetchRecipesApi, { fetchRecipesById } from '../helpers/fetchRecipesApi';

function RecipeDetailsProvider({ children }) {
  const [pageType, setPageType] = useState(undefined);
  const [recipeTitle, setRecipeTitle] = useState(undefined);
  const [recipeImage, setRecipeImage] = useState(undefined);
  const [recipeCategory, setRecipeCategory] = useState(undefined);
  const [recipeInstructions, setRecipeInstructions] = useState(undefined);
  const [recipeArea, setRecipeArea] = useState(undefined);
  const [recipeAlcohol, setRecipeAlcohol] = useState(undefined);
  const [recipeVideo, setRecipeVideo] = useState(undefined);
  const [ingredientList, SetIngredientList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [finishedRecipe, setFinishedRecipe] = useState(false);
  const [copiedMessageTimer, setCopiedMessageTimer] = useState(0);
  const history = useHistory();
  const { recipeId } = useParams();

  const loadIngredients = (recipeInfo, maxAmount) => {
    const maxIngredients = maxAmount;
    let allIngredients = [];
    for (let index = 1; index <= maxIngredients; index += 1) {
      const ingredient = `${recipeInfo[`strIngredient${index}`]}`;
      const measure = `${recipeInfo[`strMeasure${index}`]}`;
      const recipeText = `${ingredient} - ${measure}`;
      if (ingredient !== 'null' && ingredient !== '' && measure !== 'null') {
        allIngredients = [...allIngredients, recipeText];
      }
      if (ingredient !== 'null' && measure === 'null') {
        allIngredients = [...allIngredients, ingredient];
      }
    }
    SetIngredientList(allIngredients);
  };

  const checkFinished = () => {
    const finishedRecipes = localStorage.getItem('doneRecipes');
    if (finishedRecipes === null) return false;
    const alreadyFinished = JSON.parse(finishedRecipes)
      .find((recipe) => recipe.id === recipeId);
    if (alreadyFinished) setFinishedRecipe(true);
    return false;
  };

  const startedRecipe = () => {
    const inProgressRecipes = localStorage.getItem('inProgressRecipes');
    if (inProgressRecipes === null) return false;
    if (pageType === 'foods') {
      const alreadyStarted = Object.keys(JSON.parse(inProgressRecipes).meals);
      return alreadyStarted.includes(recipeId);
    }
    const alreadyStarted = Object.keys(JSON.parse(inProgressRecipes).cocktails);
    return alreadyStarted.includes(recipeId);
  };

  const loadRecipeInfo = async () => {
    const recipeInfo = await fetchRecipesById(pageType, recipeId);
    checkFinished();
    if (pageType && pageType === 'foods') {
      const maxIngredientsAmount = 20;
      setRecipeTitle(recipeInfo.strMeal);
      setRecipeImage(recipeInfo.strMealThumb);
      setRecipeArea(recipeInfo.strArea);
      setRecipeVideo(recipeInfo.strYoutube.replace('watch?v=', 'embed/'));
      loadIngredients(recipeInfo, maxIngredientsAmount);
    } else {
      const maxIngredientsAmount = 15;
      setRecipeTitle(recipeInfo.strDrink);
      setRecipeImage(recipeInfo.strDrinkThumb);
      setRecipeAlcohol(recipeInfo.strAlcoholic);
      loadIngredients(recipeInfo, maxIngredientsAmount);
    }
    setRecipeCategory(recipeInfo.strCategory);
    setRecipeInstructions(recipeInfo.strInstructions);
  };

  const getRecommendation = async () => {
    const maxAmount = 6;
    const recomType = pageType === 'foods' ? 'drinks' : 'foods';
    const fetchType = `${recomType}Recipes`;
    const recommendationList = await fetchRecipesApi(recomType, fetchType, maxAmount);
    setRecommendations(recommendationList);
  };

  useEffect(() => {
    const loadPageType = () => {
      if (!pageType) {
        const isPageTypeFood = window.location.pathname.includes('food');
        if (isPageTypeFood) {
          setPageType('foods');
        } else {
          setPageType('drinks');
        }
      }
      if (pageType && recipeId) loadRecipeInfo();
      if (pageType && !recommendations.length) getRecommendation();
    };
    loadPageType();
  }, [pageType, recipeId]);

  useEffect(() => {
    const endLoading = () => {
      if (ingredientList.length) setLoading(false);
    };
    endLoading();
  }, [ingredientList]);

  const changePage = (newPathname) => {
    history.push(newPathname);
    window.location.reload();
  };

  useEffect(() => {
    if (!copiedMessageTimer) return;
    const aSecond = 1000;
    const cooldown = setInterval(() => setCopiedMessageTimer(copiedMessageTimer - 1),
      aSecond);
    return () => clearInterval(cooldown);
  }, [copiedMessageTimer]);

  const handleCopy = () => {
    const fiveSeconds = 5;
    setCopiedMessageTimer(fiveSeconds);
    copy(window.location.href);
  };

  const handleFavorite = () => {
    const removeLastLetter = -1;
    const favoritedRecipe = {
      id: recipeId,
      type: pageType.slice(0, removeLastLetter),
      nationality: recipeArea || '',
      category: recipeCategory || '',
      alcoholicOrNot: recipeAlcohol || '',
      name: recipeTitle,
      image: recipeImage,
    };
    if (localStorage.getItem('favoriteRecipes') === null) {
      localStorage.setItem('favoriteRecipes', JSON.stringify([favoritedRecipe]));
    } else {
      const oldData = localStorage.getItem('favoriteRecipes');
      const recuperedData = JSON.parse(oldData);
      const newArray = [...recuperedData, favoritedRecipe];
      localStorage.setItem('favoriteRecipes', JSON.stringify(newArray));
    }
  };

  const providerValue = {
    loading,
    pageType,
    recipeId,
    recipeTitle,
    recipeImage,
    recipeCategory,
    recipeInstructions,
    recipeVideo,
    recipeAlcohol,
    ingredientList,
    recommendations,
    finishedRecipe,
    copiedMessageTimer,
    changePage,
    checkFinished,
    startedRecipe,
    handleCopy,
    handleFavorite,
  };

  return (
    <Context.Provider value={ providerValue }>
      {children}
    </Context.Provider>
  );
}

RecipeDetailsProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default RecipeDetailsProvider;
