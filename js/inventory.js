function Inventory() {
  this.items = {};
}

Inventory.prototype.craft = function(recipe, amount) {
  amount = amount || 1;
  for (var i = 0; i < recipe.Requirements.length; i++) {
    var req = recipe.Requirements[i];
    this.items[req.resource.name] -= req.amount * amount;
  }

  if (this.items[recipe.name]) {
    this.items[recipe.name] += amount;
  }
  else {
    this.items[recipe.name] = amount;
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