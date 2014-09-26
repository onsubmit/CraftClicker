improvePick = function(previousPick, newPick, multiplier) {
  multiplier = multiplier || 2;
  for (var prop in previousPick.LootModifiers) {
    if(previousPick.LootModifiers.hasOwnProperty(prop)) {
      newPick.LootModifiers[prop] = previousPick.LootModifiers[prop] * multiplier;
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

Items.BasicForge = {
  slot: Slot.Forge,
  level: 1,
  name: "Basic Forge"
}

Items.SturdyForge = {
  slot: Slot.Forge,
  level: 2,
  name: "Sturdy Forge",
  SmeltModifiers: {}
}

Items.SturdyForge.SmeltModifiers[Items.CopperBar.name] = 2;
Items.SturdyForge.SmeltModifiers[Items.IronBar.name] = 2;

Items.WoodenPick = {
  slot: Slot.Pick,
  level: 1,
  name: "Wooden Pick",
  LootModifiers: {}
}

Items.WoodenPick.LootModifiers[Resources.Coal.name] = 1;
Items.WoodenPick.LootModifiers[Resources.Stone.name] = 1;

Items.StonePick = {
    slot: Slot.Pick,
    level: 2,
    name: "Stone Pick",
    LootModifiers: {}
}

improvePick(Items.WoodenPick, Items.StonePick);
Items.StonePick.LootModifiers[Resources.CopperOre.name] = 1;
Items.StonePick.LootModifiers[Resources.IronOre.name] = 1;

Items.CastIronPick = {
    slot: Slot.Pick,
    level: 3,
    name: "Cast Iron Pick",
    LootModifiers: {}
}

improvePick(Items.StonePick, Items.CastIronPick);
Items.CastIronPick.LootModifiers[Resources.TinOre.name] = 1;
Items.CastIronPick.LootModifiers[Resources.GoldOre.name] = 1;