function Player() {
  this.level = 1;
  this.inventory = new Inventory();
  this.equipment = new Equipment();
  this.crafting = {};
}

Player.prototype.craft = function(recipe, amount) {  
  this.inventory.craft(recipe, amount);

  if (recipe.Item && recipe.Item.slot == Slot.Pick) {
    this.equipment.equip(recipe.Item);
  }
}

Player.prototype.collect = function(drops) {
  this.inventory.merge(drops);
}

Player.prototype.getCraftableAmount = function(recipe) {
  return this.inventory.getCraftableAmount(recipe);
}