function Player() {
  this.level = 0;
  this.maxLevel = 2;
  this.inventory = new Inventory();
  this.requiredRecipes = {};
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

  // Consume the resources from the inventory.
  this.inventory.craft(item, amount);
  
  // Release the items reserved to craft the new item.
  //this.inventory.releaseResources(item.Recipe);
  
  // Reserve the newly crafted item.
  //this.inventory.reserveResources({ item: item, amount: amount });

  // Update the number of items left to craft.
  var newAmount = this.requiredRecipes[item.complexity][item.name].amount - amount;
  if (newAmount == 0) {
    delete this.requiredRecipes[item.complexity][item.name];
  }
  else {
    this.requiredRecipes[item.complexity][item.name].amount = newAmount;
  }

  return newAmount;
}

Player.prototype.requestCrafting = function(item, amount, el) {
  // Determine the recipes that must first be crafted, ordered by complexity.
  var newRecipes = this.inventory.determineRequiredRecipes(item, amount);

  this.mergeNewRequiredRecipes(newRecipes);
  
  return newRecipes.Reserved;
}

Player.prototype.mergeNewRequiredRecipes = function(recipes) {
  var complexity = 1;
  while(recipes[complexity]) {
    if (!this.requiredRecipes[complexity]) {
      // Add new complexity.
      this.requiredRecipes[complexity] = {};
    }

    var list = recipes[complexity];
    for (var prop in list) {
      if (!this.requiredRecipes[complexity][prop]) {
        // New item to craft.
        this.requiredRecipes[complexity][prop] = list[prop];

        // Mark as dormant so the crafting will begin when it's its complexity's turn to be crafted.
        this.requiredRecipes[complexity][prop].isDormant = true;
      }
      else {
        // Item is either already crafting or is queued to be crafted soon.
        this.requiredRecipes[complexity][prop].amount += list[prop].amount;
      }
    }

    complexity++;
  }
}

Player.prototype.queueRecipes = function() {
  var complexity = 1;
  while(this.requiredRecipes[complexity]) {
    var list = this.requiredRecipes[complexity];
    for (var prop in list) {
      var isDormant = this.queueRecipe(prop, list[prop]);
      if (!list[prop].isDormant) {
        list[prop].isDormant = isDormant;
      }
    }

    complexity++;
  }
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

Player.prototype.getCraftableAmount = function(recipe, reserved) {
  return this.inventory.getCraftableAmount(recipe, false, reserved);
}

Player.prototype.getCraftableAmountFromInventory = function(recipe, reserved) {
  return this.inventory.getCraftableAmountFromInventory(recipe, reserved);
}