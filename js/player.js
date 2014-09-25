function Player() {
  this.level = 0;
  this.maxLevel = 10;
  this.inventory = new Inventory();
  this.equipment = new Equipment();
  this.crafting = {};
  this.skillIncreaseChanges = [0, 0.25, 0.75, 1];
}

Player.prototype.craft = function(recipe, amount) {
  amount = amount || 1;
  this.inventory.craft(recipe, amount);

  if (recipe.Item && recipe.Item.slot) {
    this.equipment.equip(recipe.Item);
  }

  this.increaseLevel(recipe);
}

Player.prototype.increaseLevel = function(recipe) {
  var diff = this.determineRecipeDifficulty(recipe);
  this.level += (Math.random() < this.skillIncreaseChanges[diff] ? 1 : 0);

  if (this.level == this.maxLevel) {
    this.maxLevel += 10 + Math.floor(this.maxLevel) / 10
  }
}

Player.prototype.determineRecipeDifficulty = function(recipe) {
  var diff = this.level - recipe.minLevel;
  if (diff < 6) {
    return 3;
  }

  if (diff < 10) {
    return 2;
  }

  if (diff < 20) {
    return 1;
  }

  return 0;
}

Player.prototype.collect = function(drops) {
  this.inventory.merge(drops);
}

Player.prototype.getCraftableAmount = function(recipe) {
  if (recipe.requiresForge && !this.equipment.items[Slot.Forge]) {
    return 0;
  }

  return this.inventory.getCraftableAmount(recipe);
}