function Player() {
  this.level = 0;
  this.maxLevel = 2;
  this.inventory = new Inventory();
  this.requiredRecipes = [];
  this.skillIncreaseChanges = [0, 0.25, 0.75, 1];
  this.xpPercentages = [0, 0.2, 0.325, 0.9];

  this.money = 0;
  this.xp   = 0;
  this.xpMax = 20;
}

Player.prototype.craft = function(requiredRecipe) {
  var item = requiredRecipe.item;
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
  this.inventory.craft(requiredRecipe);
}

Player.prototype.requestCrafting = function(item, amount, el) {
  // Build the recipe tree
  var recipeTree = this.inventory.buildRecipeTree(item, amount);
  
  // Determine the recipes of complexity: 1
  var newRecipes = this.determineRecipesOfComplexity(recipeTree, 1);
  
  // Add these recipes to the craft queue
  this.requiredRecipes = this.requiredRecipes.concat(newRecipes);
}

Player.prototype.determineRecipesOfComplexity = function(node, complexity, recipes) {
  recipes = recipes || [];
  
  if (node.item.complexity == complexity) {
    recipes.push(node);
  }
  
  for (var i = 0; i < node.children.length; i++) {
    this.determineRecipesOfComplexity(node.children[i], complexity, recipes);
  }
  
  return recipes;
}

/*
Player.prototype.mergeNewRequiredRecipes = function(node, minComplexity) {
  var complexity = node.item.complexity;
  var minComplexity = Math.min(minComplexity, complexity) || complexity;
  if (!this.requiredRecipes[complexity]) {
    // Add new complexity.
    this.requiredRecipes[complexity] = [ node ];
  }
  else {
    this.requiredRecipes[complexity].push(node);
  }
  
  for (var i = 0; i < node.children.length; i++) {
    minComplexity = this.mergeNewRequiredRecipes(node.children[i], minComplexity);
  }
  
  return minComplexity;
}
*/

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

Player.prototype.getCraftableAmount = function(recipe) {
  return this.inventory.getCraftableAmount(recipe, false);
}

Player.prototype.getCraftableAmountFromInventory = function(recipe) {
  return this.inventory.getCraftableAmountFromInventory(recipe);
}