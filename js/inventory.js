function Inventory() {
  this.maxSize = 16;
  this.items = {};
  this.firstEmptyBackpackSlot = 1;
  this.backpackSlotNameMap = {};
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
      // All forge recipes require 1 lesser forge to craft.
      for (var j = 0; j < this.forges.length && numForgesConsumed < req.amount; j++) {
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
          id: item.id,
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
          id: item.id,
          SmeltModifiers: item.SmeltModifiers
        };
        
        this.forges.push(forge);

        // In the event some forges were consumed from both the forge array and the inventory,
        // there will be open slots in the forge array even after adding the newly crafted one.
        // Move as many forges from the inventory to the forge array as we can. 
        if (reqForge && this.forges.length < this.maxNumForges) {
          while (this.items[reqForge.name] && this.items[reqForge.name].amount > 0 && this.forges.length < this.maxNumForges) {
            this.removeItem(reqForge, 1);
            this.forges.push(reqForge);
          }
        }

        this.drawForges();
        return;
      }
    }
  
    var isPick = item.type && item.type == ItemType.Pick;
    if (isPick) {
      if (!this.pick || this.pick.level < item.level) {
        var unmerged = 0;
        if (this.pick) {
          // Auto equip new pick if it's higher level than the current one.
          unmerged = this.mergeItem(this.pick, 1);
        }
        
        this.pick = {
          type: item.type,
          durability: item.durability,
          maxDurability: item.durability,
          name: item.name,
          id: item.id,
          image: item.image,
          level: item.level,
          sellValue: item.sellValue,
          LootModifiers: item.LootModifiers,
        };
        
        $('#gather').prop("src", this.pick.image);
        $('#currentPick').text(this.pick.name);
        
        return unmerged;
      }
    }
    
    // Put the item into the inventory.
    // The item could be a forge if the forge array was full.
    return this.mergeItem(item, makes);
  }
}

Inventory.prototype.determineNextAvailableBackpackSlot = function() {
  var index = 0;
  for (var i = 1; i <= this.maxSize; i++) {
    if (!this.backpackSlotNameMap[i]) {
      index = i;
      break;
    }
  }
  
  this.firstEmptyBackpackSlot = index;
}

Inventory.prototype.mergeItemIntoBackpack = function(item, amount) {
  if (!this.items[item.name].backpackSlots && this.firstEmptyBackpackSlot) {
    this.items[item.name].backpackSlots = {};
    this.items[item.name].backpackSlots[this.firstEmptyBackpackSlot] = amount;
    this.backpackSlotNameMap[this.firstEmptyBackpackSlot] = item.name;
    this.determineNextAvailableBackpackSlot();
    amount = 0;
  }
  else {
    for (var prop in this.items[item.name].backpackSlots) {
      var stackAmount = this.items[item.name].backpackSlots[prop];
      if (stackAmount < item.stackSize) {
        var newAmount = stackAmount + amount;
        if (newAmount <= item.stackSize) {
          this.items[item.name].backpackSlots[prop] = newAmount;
          amount = 0;
        }
        else {
          this.items[item.name].backpackSlots[prop] = item.stackSize;
          this.determineNextAvailableBackpackSlot();
          amount = newAmount - item.stackSize;
        }
      }
    }
    
    if (amount > 0 && this.firstEmptyBackpackSlot) {
      // TODO: What if difference > item.stackSize?
      this.items[item.name].backpackSlots[this.firstEmptyBackpackSlot] = amount;
      this.backpackSlotNameMap[this.firstEmptyBackpackSlot] = item.name;
      this.determineNextAvailableBackpackSlot();
      amount = 0;
    }
  }
  
  return amount;
}

Inventory.prototype.takeItemFromBackpack = function(item, amount) {
  var indices = [];
  for (var prop in this.items[item.name].backpackSlots) {
    indices.push(prop);
  }
  
  for (var i = indices.length - 1; i >= 0; i--) {
    var index = indices[i];
    var stackAmount = this.items[item.name].backpackSlots[index];
    var newAmount = stackAmount - amount;
    if (newAmount > 0) {
      this.items[item.name].backpackSlots[index] = newAmount;
      return;
    }
    else {
      this.items[item.name].backpackSlots[index] = 0;     
      if (newAmount == 0) {
        return;
      }
      
      amount = 0 - newAmount;
    }
  }
}

Inventory.prototype.sortBackpack = function() {
  var arrNames = [];
  for (var prop in this.backpackSlotNameMap) {
    arrNames.push(this.backpackSlotNameMap[prop]);
  }
  
  arrNames.sort();
  
  this.backpackSlotNameMap = {};
  for (var i = 0; i < arrNames.length; ) {
    var itemName = arrNames[i];
    this.backpackSlotNameMap[i + 1] = itemName;
    
    var newSlots = {};
    for (var prop in this.items[itemName].backpackSlots) {
      this.backpackSlotNameMap[i + 1] = itemName;
      newSlots[i + 1] = this.items[itemName].backpackSlots[prop];
      i++;
    }
    
    this.items[itemName].backpackSlots = newSlots;
  }
}

Inventory.prototype.removeItem = function(item, amount) {
  this.items[item.name].amount -= amount;
  this.takeItemFromBackpack(item, amount);
}

Inventory.prototype.mergeItem = function(item, amount) {
  if (!this.items[item.name]) {
    this.items[item.name] = 
    {
      Item: item,
      amount: 0
    };
    
    if (item.durability) {
      this.items[item.name].durabilities = [];
    }
  }

  var unmerged = this.mergeItemIntoBackpack(item, amount);
  this.items[item.name].amount += (amount - unmerged);

  if (unmerged > 0) {
    return unmerged;
  }
  
  if (item.durability) {
    this.items[item.name].durabilities.push(item.durability);
  }

  return 0;
}

Inventory.prototype.mergeItemByName = function(name, amount) {
  var item = Items[name] || Resources[name];
  return this.mergeItem(item, amount);
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

Inventory.prototype.getCraftableAmountFromInventory = function(recipe, modifiedInventory) {
  var minAmount = -1;
  for (var i = 0; i < recipe.Requirements.length; i++) {
    var req = recipe.Requirements[i];
    var currentAmount = 0;
    
    if (this.items[req.resource.name]) {
      if (modifiedInventory) {
        if (!modifiedInventory[req.resource.name] && modifiedInventory[req.resource.name] != 0) {
          modifiedInventory[req.resource.name] = this.items[req.resource.name].amount;
        }
        
        currentAmount = modifiedInventory[req.resource.name];
      }
      else {
        currentAmount = this.items[req.resource.name].amount;
      }
    }

    var isForge = req.resource.type && req.resource.type == ItemType.Forge;
    if (isForge) {
      var forgeLevel = req.resource.level;
      for (var j = 0; j < this.forges.length; j++) {
        if (this.forges[j].level == forgeLevel && !this.forges[j].reserved) {
          currentAmount++;
        }
      }
    }

    var amount = Math.floor(currentAmount / req.amount);
    minAmount = minAmount < 0 ? amount : Math.min(amount, minAmount);
    if (minAmount == 0) {
      return 0;
    }
  }
  
  return minAmount;
}

Inventory.prototype.getCraftableAmount = function(recipe, modifiedInventory, maxAmountToCraft) {
  if (recipe.forge) {
    // Player must have an active forge capable of smelting the ore.
    var forgeLevel = recipe.forge.level;
    if (!this.forges.some(function(f) { return f.level >= forgeLevel })) {
      return 0;
    }
  }

  // First, determine how many items can be immediately crafted from the current inventory alone.
  var craftableAmount = this.getCraftableAmountFromInventory(recipe, modifiedInventory);
  
  // Next, determine what the player's inventory would be if they were to craft as many as possible
  // using only resources currently in their inventory.
  modifiedInventory = modifiedInventory || {};
  var amountToCraft = maxAmountToCraft ? Math.min(maxAmountToCraft, craftableAmount) : craftableAmount;
  for (var i = 0; i < recipe.Requirements.length; i++) {
    var currentAmount = 0;
    var req = recipe.Requirements[i];
    var inventoryAmount = this.getNumberOfItem(req.resource);
    
    if (inventoryAmount > 0) {
      // Calculate what would be the remaining inventory after crafting from the current inventory alone.
      if (modifiedInventory[req.resource.name] >= 0) {
        currentAmount = modifiedInventory[req.resource.name] = modifiedInventory[req.resource.name] - amountToCraft * req.amount;
      }
      else {
        currentAmount = modifiedInventory[req.resource.name] = inventoryAmount - amountToCraft * req.amount;
      }
    }
    else {
      currentAmount = modifiedInventory[req.resource.name] = 0;
    }
    
    if (req.amount > currentAmount) {
      // In the leftover inventory, there isn't enough to craft one of the desired recipe.
      if (!req.resource.Recipe) {
        // If this is a raw resource, we're boned.
        return craftableAmount;
      }
    }
  }
  
  if (maxAmountToCraft && craftableAmount >= maxAmountToCraft) {
    // The player has the necessary resources in their current inventory to craft the required number.
    return maxAmountToCraft;
  }
  
  // Next, chip away at the requirements until one of them cannot be met.
  while (true) {
    for (var i = 0; i < recipe.Requirements.length; i++) {
      var req = recipe.Requirements[i];
      var haveAmount = modifiedInventory[req.resource.name];
      var needAmount = req.amount;
      
      if (haveAmount >= needAmount) {
        // The player has enough to fulfill the requirement.
        // Remove the resources from the available inventory.
        modifiedInventory[req.resource.name] -= needAmount;
      }
      else {
        // The player does not have enough to fulfill the requirement.
        if (!req.resource.Recipe) {
          // This requirement is a raw resource, of which the player does not have enough. Return.
          return craftableAmount;
        }
        
        // This requirement has its own recipe.
        // The player may be able to craft it with the resources he/she has in their available inventory.
        needAmount = Math.ceil((needAmount - haveAmount) / req.resource.Recipe.makes);
        var reqCraftableAmount = this.getCraftableAmount(req.resource.Recipe, modifiedInventory, needAmount);
        
        if (reqCraftableAmount + haveAmount < needAmount) {
          // The player does not have the necessary resources to craft the requirement. Return.
          return craftableAmount;
        }
        
        // The player does have the necessary resources to craft the requirement.
        // Remove the resources from the available inventory.
        modifiedInventory[req.resource.name] = 0;
      }
    }
    
    // The player has enough resources to meet ALL the requirements of the recipe.
    craftableAmount++;
    
    if (maxAmountToCraft && craftableAmount >= maxAmountToCraft) {
      // The player has the necessary resources in their current inventory to craft the required number.
      return maxAmountToCraft;
    }
  }
}

Inventory.prototype.drawForges = function() {
  for (var i = 0; i < this.maxNumForges; i++) {
    if (i < this.forges.length) {
      $('#forges').show();
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
          reservedAmount = multiplier * req.amount;

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
          var numForgesNeeded = multiplier * req.amount;
          var numForgesReserved = 0;
          
          for (var j = 0; j < this.forges.length && numForgesReserved < numForgesNeeded; j++) {
            var forge = this.forges[j];
            if (forge.level == reqForge.level && !forge.reserved) {
              forge.reserved = true;
              numForgesReserved++;
            }
          }

          // Reserve remaining forges from the inventory.
          if (numForgesReserved < numForgesNeeded) {
            var remainingToConsume = numForgesNeeded - numForgesReserved;
            var numForgesInInventory = this.items[res.name] ? this.items[res.name].amount : 0;
            
            if (numForgesInInventory >= remainingToConsume) {
              // The player has enough forges in their inventory.
              // Remove them from the inventory.
              this.removeItem(res, remainingToConsume);
            }
            else {
              // The player does not have enough forges in their inventory.
              // Remove any from the inventory and craft the remainder.
              if (this.items[res.name]) {
                this.removeItem(res, this.items[res.name].amount);
              }
            }
          }
        }
        else {
          // Remove them from the player's inventory.
          this.removeItem(res, reservedAmount);
          
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

Inventory.getMoneyString = function(money) {
  var copper = Math.floor(money % 100);
  money = Math.floor((money - copper) / 100);
  var silver = Math.floor(money % 100);
  var gold = Math.floor((money - silver) / 100);

  var moneyString = '';
  moneyString += gold > 0 ? gold + 'g ' : '';
  moneyString += silver > 0 ? silver + 's ' : '';
  moneyString += moneyString.length > 0 ? (copper > 0 ? copper + 'c' : '') : copper + 'c';

  return moneyString;
}

Inventory.prototype.getIcon = function(item, index) {

  var id = 'i' + index + '_icon';
  var d = $('#' + id);
  if (d.length) {
    return d;
  }

  d = $('<div/>', {
            id: 'i' + index + '_icon',
            class: 'inventoryIcon',
            style: 'background-image: ' + 'url(\'' + item.image + '\');',

        });

  var showToolip = function(icon, e) {
    var t = icon.children('.tooltip');

    var left = e.pageX + 10 - window.pageXOffset;
    var top = e.pageY + 10 - window.pageYOffset;

    if (left + t.width() > $(window).width() - 20) {
      left = e.pageX - t.width() - 10;
    }

    if (top + t.height() > $(window).height() - 20) {
      top = e.pageY - t.height() - 10;
    }

    t.show().css('left', left).css('top', top);
  }

  var hideToolip = function(icon) {
    var t = icon.children('.tooltip');
    t.hide();
  }
  
  d.mouseenter({ item: this.items[item.name], index: index }, function(e)
  {
    $(this).children('.tooltip').remove();
    $(this).append(Inventory.getTooltip(item, e.data.item.amount, e.data.item.backpackSlots[index]));
  });
  
  d.mousemove(function(e)
  {
    $(this).addClass('highlight');
    showToolip($(this), e);
  });
  
  d.mouseout(function()
  {
    $(this).removeClass('highlight');
    hideToolip($(this));
  });

  var sellStack = function(index, sellStack, sellAll) {
    var g = window.game;
    var p = g.player;
    var inv = p.inventory;
    var itemName = inv.backpackSlotNameMap[index];

    if (sellAll) {
      for (var prop in inv.items[itemName].backpackSlots) {
        var amount = inv.items[itemName].backpackSlots[prop];
        p.sellItemByName(itemName, amount);
        inv.items[itemName].backpackSlots[prop] -= amount ;
        inv.items[itemName].amount -= amount;
      }
    }
    else {
      var amount = sellStack ? inv.items[itemName].backpackSlots[index] : 1;
      p.sellItemByName(itemName, amount);
      inv.items[itemName].backpackSlots[index] -= amount ;
      inv.items[itemName].amount -= amount;
    }
    
    g.drawInventory();
  }

  var shiftClick = function(index) {
    /*
    var itemInInventory = item.inventoryIndex >= 0;

    if (itemInInventory) {
      var g = window.game;
      var p = g.player;
      p.sellItem(item);
      g.removeItemFromInventory(item);
    }
    */
  }

  d.mousedown({ index: index }, function(e) {
    switch (e.which) {
        case 1: // left
          if (e.shiftKey) {
            shiftClick(e.data.index);
          }
          break;
        case 2: // middle
          break;
        case 3: // right
            sellStack(e.data.index, e.shiftKey, e.shiftKey && e.ctrlKey);
          break;
        default:
    }
  });

  return d;
}

Inventory.getTooltip = function(item, amount, stackSize) {
  var $div = $('<div/>', {
              class: 'tooltip',
             });
          
  $('<h3/>', {
    text: item.name
  }).appendTo($div);
  
  if (item.text) {
    $('<p/>', {
      text: item.text
    }).appendTo($div);
  }
  
  $('<p/>', {
    text: 'Sells for ' + Inventory.getMoneyString(item.sellValue),
    class: 'recipeSellsFor'
  }).appendTo($div);
  
  $('<p/>', {
    text: 'Stack sells for ' + Inventory.getMoneyString(stackSize * item.sellValue),
    class: 'recipeSellsFor'
  }).appendTo($div);
  
  $('<p/>', {
    text: 'Current inventory of ' + amount + (amount > stackSize ? ' sells for ' + Inventory.getMoneyString(amount * item.sellValue) : '')
  }).appendTo($div);

  return $div;
}