var Recipes = {};

Recipes.IronBar =
{
  name: "Iron Bar",
  minLevel: 4,
  craftTime: 3,
  requiresForge: true,
  Requirements :
  [
    { resource: Resources.IronOre, amount: 1 },
    { resource: Resources.Coal, amount: 1 },
  ]
};

Recipes.CopperBar =
{
  name: "Copper Bar",
  minLevel: 4,
  craftTime: 3,
  requiresForge: true,
  Requirements :
  [
    { resource: Resources.CopperOre, amount: 1 },
    { resource: Resources.Coal, amount: 1 },
  ]
};

Recipes.BasicForge =
{
  name: "Basic Forge",
  text: "Allows for smelting Iron and Copper.",
  minLevel: 4,
  itemLevel: 1,
  craftTime: 8,
  Requirements :
  [
    { resource : Resources.Stone, amount : 24 }
  ],
  Item :
  {
    slot: Slot.Forge
  }
};

Recipes.StonePick =
{
  name: "Stone Pick",
  text: "Allows for gathering Iron and Copper ore and doubles the amount of Stone and Coal gathered.",
  minLevel: 3,
  craftTime: 3,
  Requirements :
  [
      { resource: Items.Stick, amount: 2 },
      { resource : Resources.Stone, amount : 3 }
  ],
  Item :
  {
    slot: Slot.Pick,
    LootModifiers : {}
  }
};

Recipes.StonePick.Item.LootModifiers[Resources.Coal.name] = 2;
Recipes.StonePick.Item.LootModifiers[Resources.Stone.name] = 2;
Recipes.StonePick.Item.LootModifiers[Resources.CopperOre.name] = 1;
Recipes.StonePick.Item.LootModifiers[Resources.IronOre.name] = 1;

Recipes.WoodenPick =
{
  name: "Wooden Pick",
  text: "Allows for gathering Stone and Coal.",
  minLevel: 2,
  craftTime: 2,
  Requirements :
  [
    { resource: Items.Stick, amount: 2 },
    { resource: Resources.Wood, amount: 3 }
  ],
  Item : Items.WoodenPick
};

Recipes.Stick =
{
  name: "Stick",
  minLevel: 0,
  craftTime: 1,
  Requirements :
  [
    { resource: Resources.Wood, amount: 2 }
  ],
  Item : Items.Stick
};