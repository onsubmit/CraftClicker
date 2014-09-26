var Slot = {
  Pick : "Pick",
  Crafting: "Crafting",
  Forge: "Forge"
}

function Equipment() {
  this.items = {};
}

Equipment.prototype.equip = function(item) {
  this.items[item.slot] = item;
}