// TODO: Replace level unlocks with item unlocks.
// e.g. Stone Pick unlocked by crafting Wooden Pick
//      Iron Bar unlocked by Basic Forge


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

Recipes.BronzeBar =
{
  name: "Bronze Bar",
  minLevel: Resources.BauxiteOre.minLevel,
  craftTime: 3,
  forge: Items.GreatForge,
  Requirements:
  [
    { resource: Items.TinBar, amount: 1 },
    { resource: Items.CopperBar, amount: 1 },
  ],
  Item: Items.BronzeBar
};

Recipes.AluminumBar =
{
  name: "Aluminum Bar",
  minLevel: Resources.BauxiteOre.minLevel,
  craftTime: 3,
  makes: 2,
  forge: Items.GreatForge,
  Requirements:
  [
    { resource: Resources.BauxiteOre, amount: 1 },
    { resource: Resources.IronOre, amount: 1 },
    { resource: Resources.Coal, amount: 1 },
  ],
  Item: Items.AluminumBar
};

Recipes.AluminumStrips =
{
  name: "Aluminum Strips",
  minLevel: Resources.BauxiteOre.minLevel,
  craftTime: 1,
  makes: 8,
  Requirements:
  [
    { resource: Items.AluminumBar, amount: 1 },
  ],
  Item: Items.AluminumStrips
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
  minLevel: Recipes.WoodenPick.minLevel + 1,
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
  minLevel: Recipes.StonePick.minLevel + 1,
  craftTime: 3,
  Requirements:
  [
      { resource: Items.Stick, amount: 2, recipe: Recipes.Stick },
      { resource: Items.IronBar, amount: 3, recipe: Recipes.IronBar }
  ],
  Item: Items.CastIronPick
};

Recipes.ExtravagantGoldPick =
{
  name: "Extravagant Gold Pick",
  text: "Allows for gathering Bauxite ore.",
  minLevel: Recipes.CastIronPick.minLevel + 1,
  craftTime: 3,
  Requirements:
  [
      { resource: Items.Stick, amount: 2, recipe: Recipes.Stick },
      { resource: Items.GoldBar, amount: 3, recipe: Recipes.GoldBar }
  ],
  Item: Items.ExtravagantGoldPick
};

Recipes.BasicForge =
{
  name: "Basic Forge",
  text: "Smelts Iron and Copper ores.",
  minLevel: Recipes.StonePick.minLevel,
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
  minLevel: Recipes.CastIronPick.minLevel,
  craftTime: 15,
  Requirements:
  [
    { resource: Items.IronBar, amount: 8, recipe: Recipes.IronBar },
    { resource: Items.CopperBar, amount: 8, recipe: Recipes.CopperBar },
    { resource: Items.BasicForge, amount: 4, recipe: Recipes.BasicForge }
  ],
  Item: Items.SturdyForge
};

Recipes.GreatForge =
{
  name: "Great Forge",
  text: "Smelts Aluminum ore and Bronze bars. Smelts lesser ores 50% faster than the Sturdy Forge.",
  minLevel: Recipes.ExtravagantGoldPick.minLevel,
  craftTime: 20,
  Requirements:
  [
    { resource: Items.IronBar, amount: 16, recipe: Recipes.IronBar },
    { resource: Items.CopperBar, amount: 16, recipe: Recipes.CopperBar },
    { resource: Items.GoldBar, amount: 8, recipe: Recipes.GoldBar },
    { resource: Items.SturdyForge, amount: 4, recipe: Recipes.SturdyForge }
  ],
  Item: Items.GreatForge
};