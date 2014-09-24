var Recipes = {};
Recipes.WoodenPick =
{
  name: "Wooden Pick",
  minLevel: 1,
  craftTime: 2,
  Requirements :
  [
    { resource: Resources.Wood, amount: 5 }
  ],
  Item :
  {
    slot: Slot.Pick,
    LootModifiers : {}
  }
};

Recipes.WoodenPick.Item.LootModifiers[Resources.Coal.name] = 1;
Recipes.WoodenPick.Item.LootModifiers[Resources.Stone.name] = 1;
Recipes.WoodenPick.Item.LootModifiers[Resources.Copper.name] = 0;
Recipes.WoodenPick.Item.LootModifiers[Resources.Iron.name] = 0;

Recipes.StonePick =
{
  name: "Stone Pick",
  minLevel: 1,
  craftTime: 3,
  Requirements :
  [
      { resource : Resources.Wood, amount: 2 },
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
Recipes.StonePick.Item.LootModifiers[Resources.Copper.name] = 1;
Recipes.StonePick.Item.LootModifiers[Resources.Iron.name] = 1;

Recipes.Forge =
{
  name: "Forge",
  minLevel: 1,
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

Recipes.IronBar =
{
  name: "Iron Bar",
  minLevel: 1,
  craftTime: 3,
  requiresForge: true,
  Requirements :
  [
    { resource: Resources.Iron, amount: 1 },
    { resource: Resources.Coal, amount: 1 },
  ]
};