function Inventory() {
  this.items = {};
  this.sorted = [];
  this.forges = [];
  this.maxNumForges = 4;
}

Inventory.prototype.craft = function(recipe) {
  var isForge = recipe.Item && recipe.Item.slot && recipe.Item.slot == Slot.Forge;

  for (var i = 0; i < recipe.Requirements.length; i++) {
    var req = recipe.Requirements[i];
    this.items[req.resource.name] -= req.amount;
  }

  /* TODO:  Inventory and usable forges are separate item collections.
            Limit number of usuable forges to 4.
            Crafting a new forge can only use forges in the inventory, not usable forges.
            This is because a usable forge could be crafting and that would complicate things.
            Allow the player to move a forge back into their inventory.
  */ 

  if (isForge) {
    this.forges.push(recipe.Item);
  }
  
  if (this.items[recipe.name]) {
    this.items[recipe.name] += 1;
  }
  else {
    this.items[recipe.name] = 1;
    this.insertSorted(recipe.name);
  }
}

Inventory.prototype.merge = function(drops) {
  for (var prop in drops) {
    if(drops.hasOwnProperty(prop)) {
      var drop = drops[prop];
      if (this.items[drop.item.name]) {
        this.items[drop.item.name] += drop.amount;
      }
      else {
        this.items[drop.item.name] = drop.amount;
        this.insertSorted(drop.item.name);
      }
    }
  }
}

Inventory.prototype.getCraftableAmount = function(recipe) {
  var minAmount = -1;
  for (var i = 0; i < recipe.Requirements.length; i++) {
    var req = recipe.Requirements[i];
    var currentAmount = 0;
    if (this.items[req.resource.name]) {
      currentAmount = this.items[req.resource.name];
    }

    var amount = Math.floor(currentAmount / req.amount);
    minAmount = minAmount < 0 ? amount : Math.min(amount, minAmount);
    if (minAmount === 0) {
      break;
    }
  }

  return minAmount < 0 ? 0 : minAmount;
}

Inventory.prototype.insertSorted = function(element) {
  this.sorted.push(element);
  this.sorted.sort();
}