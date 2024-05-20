# Data-Driven Recipe Evaluation, Analysis, and Complexity Ranking System
## Overview
This repository contains the final project for CS-532: Database Systems, created by Sukrut Bidwai and Devang Jagdale. The project involves the development of a comprehensive data-driven system to evaluate, analyze, and rank recipes based on complexity and ingredient substitutions using MongoDB.

## Table of Contents
1. Project Overview
2. Data Source
3. Queries
4. Query 1: Ingredient Substitution Identification
5. Query 2: Recipe Complexity Calculation
6. Query 3: Utensil Extraction and Wash Time Calculation
7. Results
8. Usage
9. References

## Data Source
Recipes Dataset: Contains 522,517 recipes with details such as cooking times, servings, ingredients, nutrition, and instructions.
Reviews Dataset: Contains 1,401,982 reviews from 271,907 users, including author information, ratings, and review text.
The dataset is sourced from Kaggle.
Link:

## Queries
### Query 1: Ingredient Substitution Identification
Objective: Identify and list ingredient substitutions from reviews.
Method:
Use $lookup to join reviews with recipes on RecipeId.
Extract words before and after keywords like "substitute," "replaced," and "instead" from review text.
Check if these words are ingredients and filter out non-ingredient words.
Return unique pairs of before and after ingredients.
Result: Unique pairs of substituted ingredients.
Columns Used: RecipeId, Review, RecipeIngredientParts

### Query 2: Recipe Complexity Calculation
Objective: Compute a complexity score for recipes.
Method:
Split RecipeInstructions into steps and count unique action words.
Calculate complexity score based on number of steps and unique actions.
Group by RecipeCategory and calculate average complexity score and rating.
Result: Average complexity scores and ratings for each recipe category.
Columns Used: RecipeId, RecipeCategory, RecipeInstructions, AggregatedRating

### Query 3: Utensil Extraction and Wash Time Calculation
Objective: Determine the complexity of washing utensils used in recipes.
Method:
Use regex to find utensils in RecipeInstructions.
Map each utensil to a specific wash time.
Group recipes by RecipeCategory and AuthorName.
Calculate total and maximum wash time for each recipe.
Result: Total wash times and complexity levels for each recipe.
Columns Used: RecipeId, Name, RecipeCategory, AuthorName, RecipeInstructions

## Results
Substitution Analysis: Provides insights into common ingredient substitutions used by cooks.
Complexity vs. Rating: Visualizes the relationship between recipe complexity and user ratings.
Wash Time Complexity: Breaks down the cleaning effort required for different recipes, categorized by author and type.
