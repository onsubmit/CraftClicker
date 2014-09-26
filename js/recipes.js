var Recipes = {};

Recipes.GoldBar =
{
  name: "Gold Bar",
  minLevel: Resources.GoldOre.minLevel,
  craftTime: 3,
  forge: Items.SturdyForge,
  Requirements :
  [
    { resource: Resources.GoldOre, amount: 1 },
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
  Requirements :
  [
    { resource: Resources.TinOre, amount: 1 },
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
  Requirements :
  [
    { resource: Resources.IronOre, amount: 1 },
    { resource: Resources.Coal, amount: 1 },
  ],
  Item: Items.IronBar
};

Recipes.CopperBar =
{
  name: "Copper Bar",
  minLevel: 4,
  craftTime: 3,
  forge: Items.BasicForge,
  Requirements :
  [
    { resource: Resources.CopperOre, amount: 1 },
    { resource: Resources.Coal, amount: 1 },
  ],
  Item: Items.CopperBar
};

Recipes.SturdyForge =
{
  name: "Sturdy Forge",
  text: "Allows for smelting Tin and Gold. Smelts Iron and Copper at 2x speed",
  minLevel: 10,
  craftTime: 16,
  Requirements :
  [
    { resource: Items.IronBar, amount: 8 },
    { resource: Items.CopperBar, amount: 8 },
    { resource: Items.BasicForge, amount: 4 }
  ],
  Item: Items.SturdyForge
};

Recipes.BasicForge =
{
  name: "Basic Forge",
  text: "Allows for smelting Iron and Copper.",
  minLevel: 4,
  craftTime: 8,
  Requirements:
  [
    { resource: Resources.Stone, amount: 24 }
  ],
  Item: Items.BasicForge
};

Recipes.CastIronPick =
{
  name: "Cast Iron Pick",
  text: "Allows for gathering Gold and Tin ore and doubles the amount of Stone, Coal, and Iron and Copper ores gathered.",
  minLevel: 7,
  craftTime: 3,
  Requirements:
  [
      { resource: Items.Stick, amount: 2 },
      { resource : Items.IronBar, amount : 3 }
  ],
  Item: Items.CastIronPick
};

Recipes.StonePick =
{
  name: "Stone Pick",
  text: "Allows for gathering Iron and Copper ore and doubles the amount of Stone and Coal gathered.",
  minLevel: 3,
  craftTime: 3,
  Requirements:
  [
      { resource: Items.Stick, amount: 2 },
      { resource : Resources.Stone, amount : 3 }
  ],
  Item: Items.StonePick
};

Recipes.WoodenPick =
{
  name: "Wooden Pick",
  text: "Allows for gathering Stone and Coal.",
  minLevel: 2,
  craftTime: 2,
  Requirements:
  [
    { resource: Items.Stick, amount: 2 },
    { resource: Resources.Wood, amount: 3 }
  ],
  Item: Items.WoodenPick
};

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