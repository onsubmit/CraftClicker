var ItemType = {
  Pick : "Picks",
  Forge: "Forges",
  Bar: "Bars",
  Other: "Other"
}

improveForge = function(newForge, oldForge, multiplier) {
  multiplier = multiplier || 1.5;
  newForge.level = oldForge.level + 1;
  for (var prop in oldForge.SmeltModifiers) {
    if(oldForge.SmeltModifiers.hasOwnProperty(prop)) {
      newForge.SmeltModifiers[prop] = oldForge.SmeltModifiers[prop] * multiplier;
    }
  }
}

improvePick = function(newPick, oldPick) {
  newPick.level = oldPick.level + 1;
  newPick.durability = oldPick.durability * 2;
  newPick.maxDurability = newPick.durability;
  for (var prop in oldPick.LootModifiers) {
    if(oldPick.LootModifiers.hasOwnProperty(prop)) {
      newPick.LootModifiers[prop] = oldPick.LootModifiers[prop];
    }
  }
}

determineImages = function(item) {
  if (!item.image) {
    item.image = 'images/' + item.id + '.png';
  }
}

determineStackSize = function(item) {
  if (!item.stackSize) {
    item.stackSize = 64;
  }
}

determineUnlocks = function(item) {
  if (item.Recipe.unlockedBy) {
    if (!item.Recipe.unlockedBy.unlocks) {
      item.Recipe.unlockedBy.unlocks = [];
    }

    item.Recipe.unlockedBy.unlocks.push(item.name);
    delete item.Recipe.unlockedBy;
  }
}

determineTotalRequirements = function(item) {
  item.Recipe.TotalRequirements = item.Recipe.TotalRequirements || {};
  for (var i = 0; i < item.Recipe.Requirements.length; i++) {
    var req = item.Recipe.Requirements[i];
    var subItem = req.resource;

    if (!subItem.Recipe) {
      // Resources don't have recipes.
      if (item.Recipe.TotalRequirements[subItem.name]) {
        item.Recipe.TotalRequirements[subItem.name] += req.amount;
      }
      else {
        item.Recipe.TotalRequirements[subItem.name] = req.amount;
      }
    }
    else {
      // We've already determined the total requirements of the recipe item.
      // Let's merge them with total requirements of the parent item.
      for (var prop in subItem.Recipe.TotalRequirements) {
        if (subItem.Recipe.TotalRequirements.hasOwnProperty(prop)) {
          var subReqAmount = subItem.Recipe.TotalRequirements[prop];
          if (item.Recipe.TotalRequirements[prop]) {
            item.Recipe.TotalRequirements[prop] += req.amount * subReqAmount;
          }
          else {
            item.Recipe.TotalRequirements[prop] = req.amount * subReqAmount;
          }
        }
      }
    }
  }
}

determineSellValue = function(item) {
  var sellValue = 0;
  for (var i = 0; i < item.Recipe.Requirements.length; i++) {
    var req = item.Recipe.Requirements[i];
    var subItem = req.resource;
    sellValue += (req.amount * subItem.sellValue);
  }
  
  item.sellValue = sellValue * Math.ceil(item.Recipe.craftTime / 10);
}

determineItemComplexity = function(item) {
  item.complexity = item.complexity || 0;

  // An item's complexity is simply the depth of its recipe's dependency tree.
  // Example: 0 -- Raw resources. They don't have recipes.
  // Example: 1 -- Recipes consisting entirely of raw resources: Basic Forge (requires only Stone)
  // Example: 2 -- Recipes with at least one level 1 requirement: Sturdy Forge (since it requires 4 Basic Forges)
  // Example: 3 -- Recipes with at least one level 2 requirement: Great Forge (since it requires 4 Sturdy Forges)
  for (var i = 0; i < item.Recipe.Requirements.length; i++) {
    var req = item.Recipe.Requirements[i];
    if (typeof req.resource.complexity === "undefined" && !req.resource.Recipe) {
      req.resource.complexity = 0;
    }

    item.complexity = Math.max(item.complexity, 1 + req.resource.complexity);
  }
}

determineMakes = function(item) {
  if (item.Recipe && !item.Recipe.makes) {
    item.Recipe.makes = 1;
  }
}

var Items = {};

Items["Stick"] = {
  type: ItemType.Other,
  Recipe: {
    level: 0,
    craftTime: 1,
    available: true,
    Requirements:
    [
      { resource: Resources["Wood"], amount: 2 }
    ]
  }
}

Items["Copper Bar"] = {
  type: ItemType.Bar,
  Recipe: {
    craftTime: 3,
    Requirements:
    [
      { resource: Resources["Copper Ore"], amount: 1 },
      { resource: Resources["Coal"], amount: 1 },
    ]
  }
}

Items["Iron Bar"] = {
  type: ItemType.Bar,
  Recipe: {
    craftTime: 3,
    Requirements:
    [
      { resource: Resources["Iron Ore"], amount: 1 },
      { resource: Resources["Coal"], amount: 1 },
    ]
  }
}

Items["Tin Bar"] = {
  type: ItemType.Bar,
  Recipe: {
    craftTime: 3,
    Requirements:
    [
      { resource: Resources["Tin Ore"], amount: 1 },
      { resource: Resources["Coal"], amount: 1 },
    ]
  }
}

Items["Gold Bar"] = {
  type: ItemType.Bar,
  Recipe: {
    craftTime: 3,
    Requirements:
    [
      { resource: Resources["Gold Ore"], amount: 1 },
      { resource: Resources["Coal"], amount: 1 },
    ]
  }
}

Items["Bronze Bar"] = {
  type: ItemType.Bar,
  Recipe: {
    craftTime: 3,
    Requirements:
    [
      { resource: Items["Tin Bar"], amount: 1 },
      { resource: Items["Copper Bar"], amount: 1 },
      { resource: Resources["Coal"], amount: 1 },
    ]
  }
}

Items["Bronze Rivet"] = {
  type: ItemType.Other,
  Recipe: {
    craftTime: 16,
    makes: 16,
    Requirements:
    [
      { resource: Items["Bronze Bar"], amount: 1 },
    ]
  }
}

Items["Steel Bar"] = {
  type: ItemType.Bar,
  Recipe: {
    craftTime: 3,
    Requirements:
    [
      { resource: Items["Iron Bar"], amount: 1 },
      { resource: Resources["Coal"], amount: 1 },
    ]
  }
}

Items["Aluminum Bar"] = {
  type: ItemType.Bar,
  Recipe: {
    craftTime: 3,
    makes: 2,
    Requirements:
    [
      { resource: Resources["Bauxite Ore"], amount: 1 },
      { resource: Resources["Iron Ore"], amount: 1 },
      { resource: Resources["Coal"], amount: 1 },
    ]
  }
}

Items["Aluminum Strips"] = {
  type: ItemType.Other,
  Recipe: {
    craftTime: 8,
    makes: 8,
    Requirements:
    [
      { resource: Items["Aluminum Bar"], amount: 1 },
    ]
  }
}

Items["Lead Bar"] = {
  type: ItemType.Bar,
  Recipe: {
    craftTime: 3,
    Requirements:
    [
      { resource: Resources["Lead Ore"], amount: 3 },
      { resource: Resources["Coal"], amount: 1 },
    ]
  }
}

Items["Wooden Pick"] = {
  type: ItemType.Pick,
  level: 1,
  durability: 64,
  maxDurability: 64,
  LootModifiers: {},
  Recipe: {
    text: "Allows for gathering Stone and Coal.",
    unlockedBy: Items["Stick"],
    craftTime: 2,
    Requirements:
    [
      { resource: Items["Stick"], amount: 2 },
      { resource: Resources["Wood"], amount: 3 }
    ]
  }
}
Items["Wooden Pick"].LootModifiers["Coal"] = 1;
Items["Wooden Pick"].LootModifiers["Stone"] = 1;

Items["Stone Pick"] = {
  type: ItemType.Pick,
  LootModifiers: {},
  Recipe: {
    text: "Allows for gathering Iron and Copper ore.",
    unlockedBy: Items["Wooden Pick"],
    craftTime: 3,
    Requirements:
    [
        { resource: Items["Stick"], amount: 2 },
        { resource: Resources["Stone"], amount: 3 }
    ]
  }
}
improvePick(Items["Stone Pick"], Items["Wooden Pick"]);
Items["Stone Pick"].LootModifiers["Copper Ore"] = 1;
Items["Stone Pick"].LootModifiers["Iron Ore"] = 1;

Items["Cast Iron Pick"] = {
  type: ItemType.Pick,
  LootModifiers: {},
  Recipe: {
    text: "Allows for gathering Gold and Tin ore.",
    unlockedBy: Items["Stone Pick"],
    craftTime: 3,
    Requirements:
    [
        { resource: Items["Stick"], amount: 2 },
        { resource: Items["Iron Bar"], amount: 3 }
    ]
  }
}
improvePick(Items["Cast Iron Pick"], Items["Stone Pick"]);
Items["Cast Iron Pick"].LootModifiers["Tin Ore"] = 1;
Items["Cast Iron Pick"].LootModifiers["Gold Ore"] = 1;

Items["Gold Pick"] = {
  type: ItemType.Pick,
  LootModifiers: {},
  Recipe: {
    text: "Allows for gathering Bauxite ore.",
    unlockedBy: Items["Cast Iron Pick"],
    craftTime: 3,
    Requirements:
    [
        { resource: Items["Stick"], amount: 2 },
        { resource: Items["Gold Bar"], amount: 3 }
    ]
  }
}
improvePick(Items["Gold Pick"], Items["Cast Iron Pick"]);
Items["Gold Pick"].LootModifiers["Bauxite Ore"] = 1;

Items["Steel Pick"] = {
  type: ItemType.Pick,
  LootModifiers: {},
  Recipe: {
    text: "Allows for gathering Lead ore.",
    unlockedBy: Items["Gold Pick"],
    craftTime: 12,
    Requirements:
    [
        { resource: Items["Stick"], amount: 2 },
        { resource: Items["Steel Bar"], amount: 3 },
        { resource: Items["Bronze Rivet"], amount: 4 },
        { resource: Items["Aluminum Strips"], amount: 8 },
    ]
  }
}
improvePick(Items["Steel Pick"], Items["Gold Pick"]);
Items["Steel Pick"].LootModifiers["Lead Ore"] = 1;

Items["Copper Bar"].Recipe.unlockedBy = Items["Stone Pick"];
Items["Iron Bar"].Recipe.unlockedBy = Items["Stone Pick"];
Items["Tin Bar"].Recipe.unlockedBy = Items["Cast Iron Pick"];
Items["Gold Bar"].Recipe.unlockedBy = Items["Cast Iron Pick"];
Items["Steel Bar"].Recipe.unlockedBy = Items["Gold Pick"];
Items["Bronze Bar"].Recipe.unlockedBy = Items["Gold Pick"];
Items["Bronze Rivet"].Recipe.unlockedBy = Items["Gold Pick"];
Items["Aluminum Bar"].Recipe.unlockedBy = Items["Gold Pick"];
Items["Aluminum Strips"].Recipe.unlockedBy = Items["Gold Pick"];
Items["Lead Bar"].Recipe.unlockedBy = Items["Steel Pick"];

Items["Basic Forge"] = {
  type: ItemType.Forge,
  level: 1,
  SmeltModifiers: {},
  Recipe: {
    text: "Smelts Iron and Copper ores.",
    unlockedBy: Items["Wooden Pick"],
    craftTime: 8,
    Requirements:
    [
      { resource: Resources["Stone"], amount: 24 }
    ]
  }
}
Items["Basic Forge"].SmeltModifiers["Copper Bar"] = 1;
Items["Basic Forge"].SmeltModifiers["Iron Bar"] = 1;

Items["Sturdy Forge"] = {
  type: ItemType.Forge,
  SmeltModifiers: {},
  Recipe: {
    text: "Smelts Tin and Gold ores. Smelts lesser ores 50% faster than the Basic Forge.",
    unlockedBy: Items["Stone Pick"],
    craftTime: 15,
    Requirements:
    [
      { resource: Items["Iron Bar"], amount: 8 },
      { resource: Items["Copper Bar"], amount: 8 },
      { resource: Items["Basic Forge"], amount: 1 }
    ]
  }
}
improveForge(Items["Sturdy Forge"], Items["Basic Forge"]);
Items["Sturdy Forge"].SmeltModifiers["Gold Bar"] = 1;
Items["Sturdy Forge"].SmeltModifiers["Tin Bar"] = 1;

Items["Great Forge"] = {
  type: ItemType.Forge,
  SmeltModifiers: {},
  Recipe: {
    text: "Smelts Aluminum ore and Bronze and Steel bars. Smelts lesser ores 50% faster than the Sturdy Forge.",
    unlockedBy: Items["Cast Iron Pick"],
    craftTime: 30,
    Requirements:
    [
      { resource: Items["Iron Bar"], amount: 16 },
      { resource: Items["Copper Bar"], amount: 16 },
      { resource: Items["Gold Bar"], amount: 8 },
      { resource: Items["Sturdy Forge"], amount: 1 }
    ]
  }
}
improveForge(Items["Great Forge"], Items["Sturdy Forge"]);
Items["Great Forge"].SmeltModifiers["Steel Bar"] = 1;
Items["Great Forge"].SmeltModifiers["Aluminum Bar"] = 1;
Items["Great Forge"].SmeltModifiers["Bronze Bar"] = 1;

Items["Giant Forge"] = {
  type: ItemType.Forge,
  SmeltModifiers: {},
  Recipe: {
    text: "Smelts Lead ore. Smelts lesser ores 50% faster than the Great Forge.",
    unlockedBy: Items["Gold Pick"],
    craftTime: 60,
    Requirements:
    [
      { resource: Items["Iron Bar"], amount: 32 },
      { resource: Items["Copper Bar"], amount: 32 },
      { resource: Items["Gold Bar"], amount: 16 },
      { resource: Items["Bronze Bar"], amount: 8 },
      { resource: Items["Aluminum Bar"], amount: 8 },
      { resource: Items["Steel Bar"], amount: 8 },
      { resource: Items["Great Forge"], amount: 1 }
    ]
  }
}
improveForge(Items["Giant Forge"], Items["Great Forge"]);
Items["Great Forge"].SmeltModifiers["Lead Bar"] = 1;

Items["Copper Bar"].Recipe.forge = Items["Basic Forge"];
Items["Iron Bar"].Recipe.forge = Items["Basic Forge"];
Items["Tin Bar"].Recipe.forge = Items["Sturdy Forge"];
Items["Gold Bar"].Recipe.forge = Items["Sturdy Forge"];
Items["Bronze Bar"].Recipe.forge = Items["Great Forge"];
Items["Aluminum Bar"].Recipe.forge = Items["Great Forge"];
Items["Steel Bar"].Recipe.forge = Items["Great Forge"];
Items["Lead Bar"].Recipe.forge = Items["Giant Forge"];

for (var prop in Items) {
  if (Items.hasOwnProperty(prop)) {
    var item = Items[prop];
    item.name = prop;
    item.id = item.name.replace(/ /g, '');
    
    determineImages(item);
    determineStackSize(item);
    determineUnlocks(item);
    determineTotalRequirements(item);
    determineSellValue(item);
    determineItemComplexity(item);
    determineMakes(item);
  }
}