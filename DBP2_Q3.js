// Projecting the fields RecipeId, Name, RecipeCategory, and AuthorName.
// Utensils extraction through matching the regex{elements} and storing them in a separate array.
// Then we unwind the extractedUtensils array and create a unique document for each utensil found 
// in the array for the individual processing.
// addFields aggregation pipeline adds all the extractedUtensils from the array one by one and adds 
// a timeframe / timestamp for each utensils or it can be said that we are mapping the time unit values 
// in seconds for each utensils and if any utensil is not found in the case then default 25 seconds of time 
// stamp is added to it, instead of keeping it as null which would result in further data outliers elimination.
// Then we extract the TotalWashTime for that single recipe, we also compute the MaxWashTime required 
// for that recipe category and then we analyse, the MaxWashTime required for each and every Author for his recipe.
// Finally, the aggregation project stage reshapes the output to present the data 
// in a more readable format 
// It eliminates unnecessary fields and structures the output to include RecipeCategory, 
// AuthorName, Recipes (an array of recipes with relevant information), and MaxWashTime 
// (the maximum wash time among all recipes).
// Hence, aggregation pipeline effectively processes recipe data, extracts utensils, 
// calculates wash times, and provides aggregated insights based on recipe categories and authors

db.CL1.aggregate([
    {
      $project: {
        RecipeId: 1,
        Name: 1,
        RecipeCategory: 1,
        AuthorName: 1, 
        ExtractedUtensils: {
          $regexFindAll: {
            input: "$RecipeInstructions",
            regex: "(knife|spoon|pan|bowl|pot|whisk|ladle|grater|peeler|sieve|tongs)",
            options: "i" //this 'i' checks for the case sensitivity and matches with all the characters from above regex
          }
        }
      }
    },
    {
      $unwind: "$ExtractedUtensils" //this unwind will check all the combinations from the above regex which would match the recipeIntructions 
    },
    {
      $addFields: {
        WashTimeMapping: { // Adding a new field for extracted utensils
          $switch: {
            branches: [
              { case: { $eq: ["$ExtractedUtensils.match", "knife"]  }, then: 20 },
              { case: { $eq: ["$ExtractedUtensils.match", "spoon"]  }, then: 20 },
              { case: { $eq: ["$ExtractedUtensils.match", "pan"]    }, then: 60 },
              { case: { $eq: ["$ExtractedUtensils.match", "bowl"]   }, then: 45 },
              { case: { $eq: ["$ExtractedUtensils.match", "pot"]    }, then: 50 },
              { case: { $eq: ["$ExtractedUtensils.match", "whisk"]  }, then: 25 },
              { case: { $eq: ["$ExtractedUtensils.match", "ladle"]  }, then: 35 },
              { case: { $eq: ["$ExtractedUtensils.match", "grater"] }, then: 40 },
              { case: { $eq: ["$ExtractedUtensils.match", "peeler"] }, then: 15 },
              { case: { $eq: ["$ExtractedUtensils.match", "sieve"]  }, then: 30 },
              { case: { $eq: ["$ExtractedUtensils.match", "tongs"]  }, then: 30 },
            ],
            default: 25
          }
        }
      }
    },
    {
      $group: {
        _id: { RecipeId: "$RecipeId", Name: "$Name" },
        RecipeCategory: { $first: "$RecipeCategory" },
        AuthorName: { $first: "$AuthorName" }, 
        TotalWashTime: { $sum: "$WashTimeMapping" },
        UniqueUtensils: { $addToSet: "$ExtractedUtensils.match" }
      }
    },
    {
      $group: {
        _id: { RecipeCategory: "$RecipeCategory", AuthorName: "$AuthorName" }, 
        Recipes: {
          $push: {
            RecipeId: "$_id.RecipeId",
            Name: "$_id.Name",
            TotalWashTime: "$TotalWashTime",
            UniqueUtensils: "$UniqueUtensils"
          }
        },
        MaxWashTime: { $max: "$TotalWashTime" }
      }
    },
    {
      $project: {
        _id: 0,
        RecipeCategory: "$_id.RecipeCategory",
        AuthorName: "$_id.AuthorName",
        Recipes: 1,
        MaxWashTime: 1
      }
    }
  ])