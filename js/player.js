function Player() {
  this.level = 0;
  this.maxLevel = 2;
  this.inventory = new Inventory();
  this.crafting = {};
  this.skillIncreaseChanges = [0, 0.25, 0.75, 1];
  this.xpPercentages = [0, 0.2, 0.325, 0.9];

  this.money = 0;
  this.xp   = 0;
  this.xpMax = 20;
}

Player.prototype.craft = function(item, amount) {
  amount = amount || 1;
  this.addXP(item.Recipe);

  if (item.unlocks) {
    // The crafting of this item unlocks the recipes for at least one other item.
    for (var i = 0; i < item.unlocks.length; i++) {
      var itemName = item.unlocks[i];
      Items[itemName].Recipe.available = true;
      Items[itemName].Recipe.level = this.level;
    }

    delete item.unlocks;
  }

  this.inventory.craft(item, amount);


}

Player.prototype.addXP = function(recipe) {
  var diff = this.determineRecipeDifficulty(recipe);
  var xpPercentIncrease = this.xpPercentages[diff];
  if (xpPercentIncrease > 0) {
    this.xp += Math.round(this.xpMax * (xpPercentIncrease + 0.05 * Math.random()) / (this.level + 1));
  }
  
  if (this.xp >= this.xpMax) {
    this.levelUp();
  }
}

Player.prototype.levelUp = function() {
  this.level++;
  this.xp = this.xp - this.xpMax;
  this.xpMax = this.xpMax + this.level * 2;
}

Player.prototype.determineRecipeDifficulty = function(recipe) {
  var diff = this.level - recipe.level;
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
  return this.inventory.getCraftableAmount(recipe);
}