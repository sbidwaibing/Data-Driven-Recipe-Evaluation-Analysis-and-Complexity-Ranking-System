db.reciepe.aggregate([
    {
      $project: {
        RecipeId: 1,
        RecipeCategory: 1,
        RecipeInstructions: 1,
        AggregatedRating: 1,
        complexity: {
          $size: {
            $filter: {
              input: { $split: ["$RecipeInstructions", ", "] },
              as: "step",
              cond: { $ne: ["$$step", ""] }
            }
          }
        },
        uniqueActions: {
          $size: {
            $setUnion: {
              $map: {
                input: { $split: ["$RecipeInstructions", ", "] },
                as: "step",
                in: { $arrayElemAt: [{ $split: ["$$step", " "] }, 0] }
              }
            }
          }
        },
        actionWordsCount: {
          $size: {
            $filter: {
              input: { $split: ["$RecipeInstructions", ", "] },
              as: "step",
              cond: {
                $or: [
                  { $regexMatch: { input: "$$step", regex: /peel|add|beat|mash|mix|stir|chop|bake|cook|grill|fry|boil|simmer|saute|roast|blend|whisk|knead|steam|whip|fold|top|drain|spread|baste|marinate|garnish|broil|braise|deglaze|brush|sprinkle|shake|season|dice|pour|squeeze|grate|crush|slice|dip|flavor|frost|glaze|toast|puree|toss|baste|tenderize|shred|soak|cream|julienne|braise|caramelize|scald|dredge|reduce|scrape|dust|sprinkle|cure|infuse|smoke|pour|pound|fold|shuck|sift|drizzle|butter|coddle|blanch|char|sift|cure|infuse|simmer|roast|broil|baste|caramelize|glaze|stew|coddle|blanch|char|poach|debone|cube/ } }
                ]
              }
            }
          }
        }
      }
    },
    {
      $addFields: {
        complexityScore: {
          $cond: [
            { $gte: ["$complexity", 20] },
            {
              $min: [
                { $multiply: [
                    { $divide: ["$uniqueActions", 20] },
                    100
                  ]
                },
                100
              ]
            },
            {
              $multiply: [
                { $divide: ["$uniqueActions", 20] },
                {
                  $multiply: ["$complexity", 5]
                }
              ]
            }
          ]
        }
      }
    },
    {
      $group: {
        _id: "$RecipeCategory",
        totalComplexityScore: { $sum: "$complexityScore" },
        averageRating: { $avg: "$AggregatedRating" },
        count: { $sum: 1 }
      }
    },
    {
      $addFields: {
        averageComplexity: {
          $divide: ["$totalComplexityScore", "$count"]
        }
      }
    },
    {
      $sort: { averageComplexity: -1 }
    }
  ])  