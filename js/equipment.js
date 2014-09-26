var Slot = {
  Pick : "Pick",
  Crafting: "Crafting",
  Forge: "Forge"
}

function Equipment() {
  this.items = {};
}

Equipment.prototype.equip = function(item) {
  if ((!item.level || !this.items[item.slot]) || (this.items[item.slot] && item.level > this.items[item.slot].level))
  this.items[item.slot] = item;
}