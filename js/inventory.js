function Inventory() {
  this.items = {};
  this.forges = [];
  this.maxNumForges = 4;
}

Inventory.prototype.craft = function(recipe) {
  var reqForge = null;
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

  var isForge = recipe.Item && recipe.Item.type && recipe.Item.type == ItemType.Forge;
  if (isForge) {
    if (this.forges.length < this.maxNumForges) {
      // There is an open forge slot.
      // Add it to the forge array.
      this.forges.push(recipe.Item);

      // In the event some forges were consumed from both the forge array and the inventory,
      // there will be open slots in the forge array even after adding the newly crafted one.
      // Move as many forges from the inventory to the forge array as we can. 
      if (reqForge && this.forges.length < this.maxNumForges) {
        while (this.items[reqForge.name].amount > 0 && this.forges.length < this.maxNumForges) {
          this.items[reqForge.name].amount -= 1;
          this.forges.push(reqForge);
        }
      }

      this.drawForges();
      return;
    }
  }

  var isPick = recipe.Item && recipe.Item.type && recipe.Item.type == ItemType.Pick;
  if (isPick) {
    if (!this.pick) {
      this.pick = {};
      $.extend(true, this.pick, recipe.Item); // Deep copy pick item (as to not modify original item)
      this.pick.maxDurability = this.pick.durability;
      $('#gather').prop("src", this.pick.image);
      $('#currentPick').text(this.pick.name);
      return;
    }
  }
  
  // Put the item into the inventory.
  // The item could be a forge if the forge array was full.
  if (this.items[recipe.name]) {
    this.items[recipe.name].amount += 1;
  }
  else {
    this.items[recipe.name] = 
    {
      Item: recipe.Item,
      amount: 1
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

Inventory.prototype.getCraftableAmount = function(recipe) {
  if (recipe.forge) {
    // Player must have an active forge capable of smelting the ore
    var forgeLevel = recipe.forge.level;
    if (!this.forges.some(function(f) { return f.level >= forgeLevel })) {
      return 0;
    }
  }

  var minAmount = -1;
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
    if (minAmount === 0) {
      break;
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