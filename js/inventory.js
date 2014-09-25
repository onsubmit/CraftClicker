function Inventory() {
  this.items = {};
  this.sorted = [];
  this.forges = {};
}

Inventory.prototype.craft = function(recipe) {
  for (var i = 0; i < recipe.Requirements.length; i++) {
    var req = recipe.Requirements[i];
    this.items[req.resource.name] -= req.amount;
  }

  if (recipe.Item && recipe.Item.slot && recipe.Item.slot == Slot.Forge) {
    if (this.forges[recipe.itemLevel]) {
      this.forges[recipe.itemLevel] += 1;
    }
    else {
      this.forges[recipe.itemLevel] = 1;
    }
  }
  else if (this.items[recipe.name]) {
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