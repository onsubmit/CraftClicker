function Player() {
  this.level = 0;
  this.maxLevel = 2;
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
    var nextMaxLevel = this.maxLevel + 10;
    for (var prop in Recipes) {
      if(Recipes.hasOwnProperty(prop)) {
        var recipe = Recipes[prop];
        if (recipe.minLevel > this.maxLevel) {
          if (recipe.minLevel < nextMaxLevel) {
            nextMaxLevel = recipe.minLevel;
          }
        }
      }
    }

    this.maxLevel = nextMaxLevel;
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
  return this.inventory.getCraftableAmount(recipe);
}