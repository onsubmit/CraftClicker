var Slot = {
  Pick : "Pick",
  Crafting: "Crafting",
  Forge: "Forge"
}

function Equipment() {
  this.items = {};

  var fists = {
    slot: Slot.Pick,
    LootModifiers : {}
  }

  fists.LootModifiers[Resources.Coal.name] = 0;
  fists.LootModifiers[Resources.Stone.name] = 0;
  fists.LootModifiers[Resources.CopperOre.name] = 0;
  fists.LootModifiers[Resources.IronOre.name] = 0;

  this.equip(fists);
}

Equipment.prototype.equip = function(item) {
  this.items[item.slot] = item;
}