function Inventory() {
  this.items = {};
  this.reserved = {};
  this.forges = [];
  this.maxNumForges = 4;
}

Inventory.prototype.updateReservedItems = function(recipes, isRemoval) {
for (var complexity in recipes) {
    for (var prop in recipes[complexity]) {
      var amount = recipes[complexity][prop];
      if (!this.reserved[prop]) {
        // Will never happen when isRemoval == true
        this.reserved[prop] = amount;
      }
      else {
        if (isRemoval) {
          this.reserved[prop] -= amount;
        }
        else {
          this.reserved[prop] += amount;
        }
      }
    }
  }
}

Inventory.prototype.craft = function(item) {
  var reqForge = null;
  var recipe = item.Recipe;
  for (var i = 0; i < recipe.Requirements.length; i++) {
    var req = recipe.Requirements[i];

    var reqIsForge = req.resource.type && req.resource.type == ItemType.Forge;
    if (!reqIsForge) {
      this.items[req.resource.name].amount -= req.amount;
    }
    else {
      // The requirement is a forge.
      // Pick required forges from the forge array before any from the inventory.
      reqForge = req.resource;
      var numForgesConsumed = 0;
      for (var j = 0; j < this.forges.length && numForgesConsumed < this.maxNumForges; j++) {
        if (this.forges[j].level == reqForge.level) {
          this.forges.splice(j--, 1);
          numForgesConsumed++;
        }
      }

      // Pick remaining required forges from the inventory.
      if (numForgesConsumed < this.maxNumForges) {
        var remainingToConsume = this.maxNumForges - numForgesConsumed;
        this.items[req.resource.name].amount -= remainingToConsume;
      }
    }
  }

  var isForge = item.type && item.type == ItemType.Forge;
  if (isForge) {
    if (this.forges.length < this.maxNumForges) {
      // There is an open forge slot.
      // Add it to the forge array.
      this.forges.push(item);

      // In the event some forges were consumed from both the forge array and the inventory,
      // there will be open slots in the forge array even after adding the newly crafted one.
      // Move as many forges from the inventory to the forge array as we can. 
      if (reqForge && this.forges.length < this.maxNumForges) {
        while (this.items[reqForge.name] && this.items[reqForge.name].amount > 0 && this.forges.length < this.maxNumForges) {
          this.items[reqForge.name].amount -= 1;
          this.forges.push(reqForge);
        }
      }

      this.drawForges();
      return;
    }
  }

  var isPick = item.type && item.type == ItemType.Pick;
  if (isPick) {
    if (!this.pick) {
      this.pick = {};
      $.extend(true, this.pick, item); // Deep copy pick item (as to not modify original item)
      this.pick.maxDurability = this.pick.durability;
      $('#gather').prop("src", this.pick.image);
      $('#currentPick').text(this.pick.name);
      return;
    }
  }
  
  // Put the item into the inventory.
  // The item could be a forge if the forge array was full.
  if (this.items[item.name]) {
    this.items[item.name].amount += (recipe.makes || 1);
  }
  else {
    this.items[item.name] = 
    {
      Item: item,
      amount: (recipe.makes || 1)
    };
  }
}

Inventory.prototype.merge = function(drops) {
  for (var prop in drops) {
    if(drops.hasOwnProperty(prop)) {
      var drop = drops[prop];
      if (this.items[drop.item.name]) {
        this.items[drop.item.name].amount += drop.amount;
      }
      else {
        this.items[drop.item.name] = 
        {
          Item: drop.item,
          amount: drop.amount
        };
      }
    }
  }
}

Inventory.prototype.mergeIntoReserved = function(list, item, amount) {
  if (!list.Reserved) {
    list.Reserved = {};
  }

  if (list.Reserved[item.name]) {
    list.Reserved[item.name].amount += amount;
  }
  else {
    list.Reserved[item.name] = 
    {
      Item: item,
      amount: amount
    };
  }
}

Inventory.prototype.reserveResources = function(reserved) {
  for (var prop in reserved) {
    if (this.reserved[prop]) {
      this.reserved[prop].amount += reserved[prop].amount;
    }
    else {
      this.reserved[prop] = 
      {
        Item: reserved[prop].Item,
        amount: reserved[prop].amount
      }
    }
  }
}

Inventory.prototype.releaseResources = function(reserved) {
  for (var prop in reserved) {
    this.reserved[prop].amount -= reserved[prop].amount;
    if (this.reserved[prop].amount) {
      delete this.reserved[prop];
    }
  }
}

Inventory.prototype.getCraftableAmountFromInventory = function(recipe) {
  return this.getCraftableAmount(recipe, true /* onlyLookInInventory */);
}

Inventory.prototype.getCraftableAmount = function(recipe, onlyLookInInventory) {
  if (recipe.forge) {
    // Player must have an active forge capable of smelting the ore.
    var forgeLevel = recipe.forge.level;
    if (!this.forges.some(function(f) { return f.level >= forgeLevel })) {
      return 0;
    }
  }

  var minAmount = -1;
  if (onlyLookInInventory) {
    for (var i = 0; i < recipe.Requirements.length; i++) {
      var req = recipe.Requirements[i];
      var currentAmount = 0;
      if (this.items[req.resource.name]) {
        currentAmount = this.items[req.resource.name].amount;
      }

      var isForge = req.resource.type && req.resource.type == ItemType.Forge;
      if (isForge) {
        var forgeLevel = req.resource.level;
        for (var j = 0; j < this.forges.length; j++) {
          if (this.forges[j].level == forgeLevel) {
            currentAmount++;
          }
        }
      }

      var amount = Math.floor(currentAmount / req.amount);
      minAmount = minAmount < 0 ? amount : Math.min(amount, minAmount);
      if (minAmount == 0) {
        break;
      }
    }
  }
  else {
    var currentResources = this.breakDownInventoryIntoResources(recipe);
    for (var prop in currentResources) {
      var currentAmount = currentResources[prop];
      var requiredAmount = recipe.TotalRequirements[prop];
      var amount = Math.floor(currentAmount / requiredAmount);
      minAmount = minAmount < 0 ? amount : Math.min(amount, minAmount);
      if (minAmount == 0) {
        break;
      }
    }
  }

  return minAmount < 0 ? 0 : minAmount;
}

Inventory.prototype.drawForges = function() {
  for (var i = 0; i < this.maxNumForges; i++) {
    if (i < this.forges.length) {
      var forge = this.forges[i];
      $('#fn' + i).text(forge.name.replace(' Forge', ''));
      $('#f' + i).empty().append($('<img/>', { src: 'images/forge.png' }));
    }
    else {
      $('#fn' + i).text('Empty');
      $('#f' + i).empty().append($('<img/>', { src: 'images/forge-disabled.png' }));
    }
  }
}

Inventory.prototype.getHighestLevelPick = function() {
  var pick = null;
  var highestLevel = 0;
  for (var prop in this.items) {
    if(this.items.hasOwnProperty(prop)) {
      var item = this.items[prop].Item;
      if (item.type && item.type == ItemType.Pick && this.items[prop].amount > 0 && item.level > highestLevel) {
        pick = item;
        highestLevel = item.level;
      }
    }
  }

  return pick;
}

Inventory.prototype.breakDownInventoryIntoResources = function(recipe) {
  breakDown = {} ;
  for (var i = 0; i < recipe.Requirements.length; i++) {
    // Break each requirement down into its component resources.
    var req = recipe.Requirements[i];

    // Get the current number of items/resource the player has in their inventory
    var currentReqAmount = this.items[req.resource.name] ? this.items[req.resource.name].amount : 0;

    // Includes forges that are in the forge array (not the inventory)
    var isForge = req.resource.type && req.resource.type == ItemType.Forge;
    if (isForge) {
      var forgeLevel = req.resource.level;
      for (var j = 0; j < this.forges.length; j++) {
        if (this.forges[j].level == forgeLevel) {
          currentReqAmount++;
        }
      }
    }

    if (!req.resource.Recipe) {
      // Resources don't have recipes.
      if (!breakDown[req.resource.name]) {
        breakDown[req.resource.name] = currentReqAmount;
      }
    }
    else {
      if (req.resource.Recipe.forge) {
        // Player must have an active forge capable of smelting the ore.
        var forgeLevel = req.resource.Recipe.forge.level;
        if (!this.forges.some(function(f) { return f.level >= forgeLevel })) {
          return 0;
        }
      }

      // The recipe requirement is an item.
      // We already know the resource breakdown of this item.
      for (var prop in req.resource.Recipe.TotalRequirements) {
        // Example: (# of Sticks in inventory) * (# of Wood needed per Stick)
        var potentialAmount = currentReqAmount * req.resource.Recipe.TotalRequirements[prop];

        // Example: Add # of Wood in inventory
        var currentResourceAmount = this.items[prop] ? this.items[prop].amount : 0;
        if (!breakDown[prop]) {
          breakDown[prop] = potentialAmount + currentResourceAmount;
        }
        else {
          breakDown[prop] += potentialAmount;
        }
      }
    }
  }

  return breakDown;
}

Inventory.prototype.determineRequiredRecipes = function(item, multiplier, list, isChild) {
  list = list || {};
  multiplier = multiplier || 1;

  if (!list[item.complexity]) {
    list[item.complexity] = {};
  }

  var reservedAmount = 0;
  if (isChild) {
    // Current inventory taken into consideration for child recipes.
    var currentAmount = this.getNumberOfItem(item);

    // The player needs [multiplier] of an item.
    // The player already has [currentAmount].
    if (multiplier > currentAmount) {
      // How many more of the child recipe does the player need to craft to have enough to craft the parent recipe?
      var initialMultiplier = multiplier;
      var difference = multiplier - currentAmount;
      var makes = item.Recipe ? item.Recipe.makes : 1;
      multiplier = Math.ceil(difference / makes);

      // When the crafting of the child recipe is complete, the player will have ([multiplier] * [makes]) more of it.
      var postCraftAddition = multiplier * makes;

      // If this is greater than or equal to the amount required to craft the parent recipe,
      // there's no need to reserve any of the child item from the player's inventory.
      // Otherwise, the player needs to reserve the difference.
      if (postCraftAddition < initialMultiplier) {
        reservedAmount = initialMultiplier - postCraftAddition;
      }
    }
    else {
      // The player has enough in their inventory.
      // Mark the required amount as reserved.
      reservedAmount = multiplier;

      // The player doesn't need to craft any to meet the parent recipe requirement.
      multiplier = 0;
    }
  }

  if (reservedAmount > 0) {
    this.mergeIntoReserved(list, item, reservedAmount);
  }

  if (multiplier > 0) {
    if (!list[item.complexity][item.name]) {
      list[item.complexity][item.name] = { item: item, amount: multiplier};
    }
    else {
      list[item.complexity][item.name].amount += multiplier;
    }

    if (!item.Recipe) {
      // We've drilled down to a raw resource.
      // Reserve the resources from the inventory.
      this.mergeIntoReserved(list, item, multiplier);
      return;
    }

    // If crafting is required the player needs to reserve more items for their inventory.
    // Dig down into the requirements of the recipe.
    for (var i = 0; i < item.Recipe.Requirements.length; i++) {
      var req = item.Recipe.Requirements[i];
      this.determineRequiredRecipes(req.resource, multiplier * req.amount, list, true /* isChild */);
    }
  }

  return list;
}

Inventory.prototype.getNumberOfItem = function(item) {
  var currentAmount = this.items[item.name] ? this.items[item.name].amount : 0;

  // Include forges that are in the forge array (not the inventory)
  var isForge = item.type && item.type == ItemType.Forge;
  if (isForge) {
    var forgeLevel = item.level;
    for (var j = 0; j < this.forges.length; j++) {
      if (this.forges[j].level == forgeLevel) {
        currentAmount++;
      }
    }
  }

  return currentAmount;
}