var Recipes = {};

Recipes.Stick =
{
  name: "Stick",
  minLevel: 0,
  craftTime: 1,
  Requirements:
  [
    { resource: Resources.Wood, amount: 2 }
  ],
  Item: Items.Stick
};

Recipes.WoodenPick =
{
  name: "Wooden Pick",
  text: "Allows for gathering Stone and Coal.",
  minLevel: 2,
  craftTime: 2,
  Requirements:
  [
    { resource: Items.Stick, amount: 2, recipe: Recipes.Stick },
    { resource: Resources.Wood, amount: 3 }
  ],
  Item: Items.WoodenPick
};

Recipes.StonePick =
{
  name: "Stone Pick",
  text: "Allows for gathering Iron and Copper ore.",
  minLevel: 3,
  craftTime: 3,
  Requirements:
  [
      { resource: Items.Stick, amount: 2, recipe: Recipes.Stick },
      { resource: Resources.Stone, amount: 3 }
  ],
  Item: Items.StonePick
};

Recipes.CastIronPick =
{
  name: "Cast Iron Pick",
  text: "Allows for gathering Gold and Tin ore.",
  minLevel: 7,
  craftTime: 3,
  Requirements:
  [
      { resource: Items.Stick, amount: 2, recipe: Recipes.Stick },
      { resource: Items.IronBar, amount: 3 }
  ],
  Item: Items.CastIronPick
};

Recipes.BasicForge =
{
  name: "Basic Forge",
  text: "Smelts Iron and Copper ores.",
  minLevel: 4,
  craftTime: 8,
  Requirements:
  [
    { resource: Resources.Stone, amount: 24 }
  ],
  Item: Items.BasicForge
};

Recipes.SturdyForge =
{
  name: "Sturdy Forge",
  text: "Smelts Tin and Gold ores. Smelts lesser ores 50% faster than the Basic Forge.",
  minLevel: 10,
  craftTime: 16,
  Requirements:
  [
    { resource: Items.IronBar, amount: 8, recipe: Recipes.IronBar },
    { resource: Items.CopperBar, amount: 8, recipe: Recipes.CopperBar },
    { resource: Items.BasicForge, amount: 4, recipe: Recipes.BasicForge }
  ],
  Item: Items.SturdyForge
};

Recipes.CopperBar =
{
  name: "Copper Bar",
  minLevel: 4,
  craftTime: 3,
  forge: Items.BasicForge,
  Requirements:
  [
    { resource: Resources.CopperOre, amount: 1 },
    { resource: Resources.Coal, amount: 1 },
  ],
  Item: Items.CopperBar
};

Recipes.IronBar =
{
  name: "Iron Bar",
  minLevel: 4,
  craftTime: 3,
  forge: Items.BasicForge,
  Requirements:
  [
    { resource: Resources.IronOre, amount: 1 },
    { resource: Resources.Coal, amount: 1 },
  ],
  Item: Items.IronBar
};

Recipes.TinBar =
{
  name: "Tin Bar",
  minLevel: Resources.TinOre.minLevel,
  craftTime: 3,
  forge: Items.SturdyForge,
  Requirements:
  [
    { resource: Resources.TinOre, amount: 1 },
    { resource: Resources.Coal, amount: 1 },
  ],
  Item: Items.TinBar
};

Recipes.GoldBar =
{
  name: "Gold Bar",
  minLevel: Resources.GoldOre.minLevel,
  craftTime: 3,
  forge: Items.SturdyForge,
  Requirements:
  [
    { resource: Resources.GoldOre, amount: 1 },
    { resource: Resources.Coal, amount: 1 },
  ],
  Item: Items.GoldBar
};