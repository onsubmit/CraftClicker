function Inventory() {
  this.items = {};
  this.reserved = {};
  this.forges = [];
  this.maxNumForges = 4;
}

Inventory.prototype.craft = function(requiredRecipe) {
  var reqForge = null;
  var item = requiredRecipe.item;
  var recipe = item.Recipe;
  for (var i = 0; i < recipe.Requirements.length; i++) {
    var req = recipe.Requirements[i];
    
    // Consume the items from the reserve.
    requiredRecipe.reserved[req.resource.name] -= req.amount;
    
    var reqIsForge = req.resource.type && req.resource.type == ItemType.Forge;
    if (reqIsForge) {
      // The requirement is a forge.
      // Consume any forges from the forge array that were reserved.
      reqForge = req.resource;
      var numForgesConsumed = 0;
      for (var j = 0; j < this.forges.length && numForgesConsumed < this.maxNumForges; j++) {
        var forge = this.forges[j];
        if (forge.level == reqForge.level && forge.reserved) {
          this.forges.splice(j--, 1);
          numForgesConsumed++;
        }
      }
    }
  }

  
  var makes = recipe.makes || 1;
  requiredRecipe.amount -= 1;
  var isForge = item.type && item.type == ItemType.Forge;
  if (requiredRecipe.parent) {
    // Move the newly crafted item into the reserve of its parent unless it's a forge and there is an open slot in the forge array.
    if (isForge && this.forges.length < this.maxNumForges) {
        // There is an open forge slot.
        // Add it to the forge array.
        var forge = {
          type: item.type,
          level: item.level,
          name: item.name,
          SmeltModifiers: item.SmeltModifiers,
          reserved: true // Added to the forge array, but reserved for the craft.
        };
        
        this.forges.push(forge);
        this.drawForges();
    }
    else if (!requiredRecipe.parent.reserved[item.name]) {
      requiredRecipe.parent.reserved[item.name] = makes;
    }
    else {
      requiredRecipe.parent.reserved[item.name] += makes;
    }
  }
  else {
    if (isForge) {
      if (this.forges.length < this.maxNumForges) {
        // There is an open forge slot.
        // Add it to the forge array.
        var forge = {
          type: item.type,
          level: item.level,
          name: item.name,
          SmeltModifiers: item.SmeltModifiers
        };
        
        this.forges.push(forge);

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
        this.pick = {
          durability: item.durability,
          maxDurability: item.durability,
          name: item.name,
          image: item.image,
          LootModifiers: item.LootModifiers,
        };
        
        $('#gather').prop("src", this.pick.image);
        $('#currentPick').text(this.pick.name);
        return;
      }
    }
  
    // Put the item into the inventory.
    // The item could be a forge if the forge array was full.
    if (this.items[item.name]) {
      this.items[item.name].amount += makes;
    }
    else {
      this.items[item.name] = 
      {
        Item: item,
        amount:makes
      };
    }
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

Inventory.prototype.mergeItem = function(name, amount) {
  if (this.items[name]) {
    this.items[name].amount += amount;
  }
  else {
    var itemName = name.replace(/ /g, '');
    this.items[name] = 
    {
      Item: Items[itemName] || Resources[itemName],
      amount: amount
    };
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
          if (this.forges[j].level == forgeLevel && !forge.reserved) {
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
    var currentReqAmount = this.getNumberOfItem(req.resource);

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

Inventory.prototype.buildRecipeTree = function(item, multiplier, parent) {
  multiplier = multiplier || 1;
  
  var node = {
    item: item,
    amount: multiplier,
    reserved: {},
    children: []
  };
  
  if (parent) {
    node.parent = parent;
  }
  
  if (item.Recipe) {
  
    item.Recipe.craftQueue = item.Recipe.craftQueue || [];
    item.Recipe.craftQueue.push(node);
    item.Recipe.crafting = false;
  
    // If crafting is required the player needs to reserve items from their inventory.
    // Dig down into the requirements of the recipe.
    for (var i = 0; i < item.Recipe.Requirements.length; i++) {
      var req = item.Recipe.Requirements[i];
      var res = req.resource;
      var needs = multiplier * req.amount;
      var currentAmount = 0;
      var reservedAmount = 0;
      
      if (!res.Recipe) {
        // Requirement is a raw resource. Reserve the necessary amount.
        reservedAmount = needs;
      }
      else {
        // Requirement has its own recipe.
        // Let's determine how many must be crafted.
        currentAmount = this.getNumberOfItem(res);

        // The player needs [multiplier * req.amount] of an item.
        // The player already has [currentAmount].
        if (needs > currentAmount) {
          // How many more of the child recipe does the player need to craft to have enough to craft the parent recipe?
          var initialNeed = needs;
          var difference = needs - currentAmount;
          var makes = res.Recipe ? res.Recipe.makes : 1;
          needs = Math.ceil(difference / makes);

          // When the crafting of the child recipe is complete, the player will have ([needs] * [makes]) more of it.
          var postCraftAddition = needs * makes;

          // If this is greater than or equal to the amount required to craft the parent recipe,
          // there's no need to reserve any of the child item from the player's inventory.
          // Otherwise, the player needs to reserve the difference.
          if (postCraftAddition < initialNeed) {
            reservedAmount = initialNeed - postCraftAddition;
          }
        }
        else {
          // The player has enough in their inventory.
          // Mark the required amount as reserved.
          reservedAmount = multiplier;

          // The player doesn't need to craft any to meet the parent recipe requirement.
          needs = 0;
        }
        
        if (needs > 0) {
          var child = this.buildRecipeTree(res, needs, node);
          node.children.push(child);
        }
      }
      
      if (reservedAmount > 0) {
        // Reserve the resources to craft this item.
        node.reserved[res.name] = reservedAmount;
        
        var isForge = res.type && res.type == ItemType.Forge;
        if (isForge)
        {
          // The requirement is a forge.
          // Reserve forges from the forge array before any from the inventory.
          reqForge = req.resource;
          var numForgesReserved = 0;
          
          for (var j = 0; j < this.forges.length && numForgesReserved < this.maxNumForges; j++) {
            var forge = this.forges[j];
            if (forge.level == reqForge.level && !forge.reserved) {
              forge.reserved = true;
              numForgesReserved++;
            }
          }

          // Reserve remaining forges from the inventory.
          if (numForgesReserved < currentAmount) {
            var remainingToConsume = currentAmount - numForgesReserved;
            this.items[res.name].amount -= remainingToConsume;
          }
        }
        else {
          // Remove them from the player's inventory.
          this.items[res.name].amount -= reservedAmount;
          
          // Keep track of all reserved resources.
          if (!this.reserved[res.name]) {
            this.reserved[res.name] = reservedAmount;
          }
          else {
            this.reserved[res.name] += reservedAmount;
          }
        }
      }
    }
  }
  
  return node;
}

Inventory.prototype.getNumberOfItem = function(item) {
  var currentAmount = this.getNumberOfItemFromInventory(item.name);
  
  // Include forges that are in the forge array (not the inventory)
  var isForge = item.type && item.type == ItemType.Forge;
  if (isForge) {
    var forgeLevel = item.level;
    for (var j = 0; j < this.forges.length; j++) {
      if (this.forges[j].level == forgeLevel && !this.forges[j].reserved) {
        currentAmount++;
      }
    }
  }

  return currentAmount;
}

Inventory.prototype.getNumberOfItemFromInventory = function(itemName) {
  return this.items[itemName] ? this.items[itemName].amount : 0;
}