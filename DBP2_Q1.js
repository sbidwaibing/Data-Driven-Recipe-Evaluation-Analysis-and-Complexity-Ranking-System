[
    {
      $lookup: {
        from: "reviews",
        localField: "RecipeId",
        foreignField: "RecipeId",
        as: "reviewData",
      },
    },
    {
      $unwind: "$reviewData",
    },
    {
      $match: {
        "reviewData.Review": {
          $regex:
            "\\bsubstitute\\b|\\breplaced\\b|\\binstead\\b",
          $options: "i",
        },
      },
    },
    {
      $project: {
        reviewText: "$reviewData.Review",
        RecipeIngredientParts: {
          $split: [
            {
              $replaceAll: {
                input: "$RecipeIngredientParts",
                find: '"',
                replacement: "",
              },
            },
            ", ",
          ],
        },
      },
    },
    {
      $unwind: "$RecipeIngredientParts",
    },
    {
      $project: {
        reviewText: 1,
        ingredient: "$RecipeIngredientParts",
        reviewWords: {
          $split: ["$reviewText", " "],
        },
      },
    },
    {
      $addFields: {
        substitutions: {
          $filter: {
            input: {
              $map: {
                input: {
                  $range: [
                    0,
                    {
                      $subtract: [
                        {
                          $size: "$reviewWords",
                        },
                        1,
                      ],
                    },
                  ],
                },
                as: "idx",
                in: {
                  idx: "$$idx",
                  word: {
                    $arrayElemAt: [
                      "$reviewWords",
                      "$$idx",
                    ],
                  },
                },
              },
            },
            as: "item",
            cond: {
              $in: [
                "$$item.word",
                [
                  "substitute",
                  "replaced",
                  "instead",
                ],
              ],
            },
          },
        },
      },
    },
    {
      $unwind: "$substitutions",
    },
    {
      $addFields: {
        before: {
          $slice: [
            "$reviewWords",
            {
              $subtract: ["$substitutions.idx", 3],
            },
            3,
          ],
        },
        after: {
          $slice: [
            "$reviewWords",
            {
              $add: ["$substitutions.idx", 1],
            },
            3,
          ],
        },
      },
    },
    {
      $lookup: {
        from: "ingredientCounts",
        localField: "before",
        foreignField: "_id",
        as: "ingredientLookupBefore",
      },
    },
    {
      $lookup: {
        from: "ingredientCounts",
        localField: "after",
        foreignField: "_id",
        as: "ingredientLookupAfter",
      },
    },
    {
      $match: {
        $and: [
          {
            ingredientLookupBefore: {
              $ne: [],
            },
          },
          {
            ingredientLookupAfter: {
              $ne: [],
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        before: "$before",
        after: "$after",
      },
    },
    {
      $lookup:
        /**
         * from: The target collection.
         * localField: The local join field.
         * foreignField: The target join field.
         * as: The name for the results.
         * pipeline: Optional pipeline to run on the foreign collection.
         * let: Optional variables to use in the pipeline field stages.
         */
        {
          from: "ingredientCounts",
          localField: "before",
          foreignField: "_id",
          as: "ingredientLookupBefore",
        },
    },
    {
      $lookup:
        /**
         * from: The target collection.
         * localField: The local join field.
         * foreignField: The target join field.
         * as: The name for the results.
         * pipeline: Optional pipeline to run on the foreign collection.
         * let: Optional variables to use in the pipeline field stages.
         */
        {
          from: "ingredientCounts",
          localField: "after",
          foreignField: "_id",
          as: "ingredientLookupAfter",
        },
    },
    {
      $match:
        /**
         * query: The query in MQL.
         */
        {
          $and: [
            {
              ingredientLookupBefore: {
                $ne: [],
              },
            },
            {
              ingredientLookupAfter: {
                $ne: [],
              },
            },
          ],
        },
    },
    {
      $project:
        /**
         * specifications: The fields to
         *   include or exclude.
         */
        {
          _id: 0,
          before: "$before",
          after: "$after",
        },
    },
    {
      $addFields:
        /**
         * newField: The new field name.
         * expression: The new field expression.
         */
        {
          before: {
            $filter: {
              input: "$before",
              as: "item",
              cond: {
                $not: {
                  $in: [
                    {
                      $trim: {
                        input: "$$item",
                      },
                    },
                    [
                      "might",
                      "try",
                      "(sometime",
                      "(chopped)",
                      "the",
                      "will",
                      "which",
                      "for",
                      "our",
                      "it's",
                      "a",
                      "and",
                      "I",
                      "used",
                      "use",
                      "of",
                      "an",
                      "all",
                      "with",
                      "in",
                      ":)",
                      "Tnx",
                      "to",
                      "(but",
                      "so",
                      "because",
                      "sorry",
                      ",",
                      "using",
                      "add",
                      "as",
                      "put",
                      "or",
                      "-",
                      "",
                    ],
                  ],
                },
              },
            },
          },
        },
    },
    {
      $addFields:
        /**
         * newField: The new field name.
         * expression: The new field expression.
         */
        {
          after: {
            $filter: {
              input: "$after",
              as: "item",
              cond: {
                $not: {
                  $in: [
                    {
                      $trim: {
                        input: "$$item",
                      },
                    },
                    [
                      "might",
                      "try",
                      "(sometime",
                      "(chopped)",
                      "the",
                      "will",
                      "which",
                      "for",
                      "our",
                      "it's",
                      "a",
                      "and",
                      "I",
                      "used",
                      "use",
                      "of",
                      "an",
                      "all",
                      "with",
                      "in",
                      ":)",
                      "Tnx",
                      "to",
                      "(but",
                      "so",
                      "because",
                      "sorry",
                      ",",
                      "using",
                      "add",
                      "as",
                      "put",
                      "or",
                      "-",
                      "",
                    ],
                  ],
                },
              },
            },
          },
        },
    },
    {
      $match:
        /**
         * query: The query in MQL.
         */
        {
          $and: [
            {
              $or: [
                {
                  $expr: {
                    $ne: [
                      {
                        $size: "$before",
                      },
                      0,
                    ],
                  },
                },
                {
                  $expr: {
                    $ne: [
                      {
                        $size: "$after",
                      },
                      0,
                    ],
                  },
                },
              ],
            },
          ],
        },
    },
    {
      $group:
        /**
         * specifications: The fields to
         *   include or exclude.
         */
        {
          _id: {
            before: "$before",
            after: "$after",
          },
        },
    },
    {
      $project:
        /**
         * specifications: The fields to
         *   include or exclude.
         */
        {
          _id: 0,
          before: "$_id.before",
          after: "$_id.after",
        },
    },
  ]  