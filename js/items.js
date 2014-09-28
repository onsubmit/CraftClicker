var ItemType = {
  Pick : "Pick",
  Forge: "Forge"
}

improveForge = function(newForge, oldForge, multiplier) {
  multiplier = multiplier || 1.5;
  for (var prop in oldForge.SmeltModifiers) {
    if(oldForge.SmeltModifiers.hasOwnProperty(prop)) {
      newForge.SmeltModifiers[prop] = oldForge.SmeltModifiers[prop] * multiplier;
    }
  }
}

improvePick = function(newPick, oldPick) {
  newPick.level = oldPick.level + 1;
  newPick.durability = oldPick.durability * 2;
  for (var prop in oldPick.LootModifiers) {
    if(oldPick.LootModifiers.hasOwnProperty(prop)) {
      newPick.LootModifiers[prop] = oldPick.LootModifiers[prop];
    }
  }
}

var Items = {};

Items.Stick = {
  name: "Stick"
}

Items.CopperBar = {
  name: "Copper Bar"
}

Items.IronBar = {
  name: "Iron Bar"
}

Items.TinBar = {
  name: "Tin Bar"
}

Items.GoldBar = {
  name: "Gold Bar"
}

Items.BasicForge = {
  type: ItemType.Forge,
  level: 1,
  name: "Basic Forge",
  SmeltModifiers: {}
}
Items.BasicForge.SmeltModifiers[Items.CopperBar.name] = 1;
Items.BasicForge.SmeltModifiers[Items.IronBar.name] = 1;

Items.SturdyForge = {
  type: ItemType.Forge,
  level: 2,
  name: "Sturdy Forge",
  SmeltModifiers: {}
}
improveForge(Items.SturdyForge, Items.BasicForge);
Items.SturdyForge.SmeltModifiers[Items.GoldBar.name] = 1;
Items.SturdyForge.SmeltModifiers[Items.TinBar.name] = 1;

Items.WoodenPick = {
  type: ItemType.Pick,
  level: 1,
  durability: 32,
  name: "Wooden Pick",
  image: 'images/pick-wooden.png',
  LootModifiers: {}
}
Items.WoodenPick.LootModifiers[Resources.Coal.name] = 1;
Items.WoodenPick.LootModifiers[Resources.Stone.name] = 1;

Items.StonePick = {
  type: ItemType.Pick,
  name: "Stone Pick",
  image: 'images/pick-stone.png',
  LootModifiers: {}
}
improvePick(Items.StonePick, Items.WoodenPick);
Items.StonePick.LootModifiers[Resources.CopperOre.name] = 1;
Items.StonePick.LootModifiers[Resources.IronOre.name] = 1;

Items.CastIronPick = {
  type: ItemType.Pick,
  name: "Cast Iron Pick",
  image: 'images/pick-cast-iron.png',
  LootModifiers: {}
}
improvePick(Items.CastIronPick, Items.StonePick);
Items.CastIronPick.LootModifiers[Resources.TinOre.name] = 1;
Items.CastIronPick.LootModifiers[Resources.GoldOre.name] = 1;