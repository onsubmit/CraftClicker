var Resources = {};

Resources["Stone"]       = { dropChance: 0.6,  maxDropAmount: 3, sellValue: 1 };
Resources["Wood"]        = { dropChance: 0.6,  maxDropAmount: 2, sellValue: 1 };
Resources["Coal"]        = { dropChance: 0.2,  maxDropAmount: 4, sellValue: 1 };
Resources["Copper Ore"]  = { dropChance: 0.2,  maxDropAmount: 1, sellValue: 2 };
Resources["Iron Ore"]    = { dropChance: 0.1,  maxDropAmount: 1, sellValue: 2 };
Resources["Tin Ore"]     = { dropChance: 0.1,  maxDropAmount: 1, sellValue: 3 };
Resources["Gold Ore"]    = { dropChance: 0.05, maxDropAmount: 1, sellValue: 3 };
Resources["Bauxite Ore"] = { dropChance: 0.05, maxDropAmount: 1, sellValue: 4 };
Resources["Lead Ore"]    = { dropChance: 0.05, maxDropAmount: 1, sellValue: 5 };

for (var prop in Resources) {
  var resource = Resources[prop];
  resource.name = prop;
  resource.id = resource.name.replace(/ /g, '');
  resource.image = 'images/' + resource.id + '.png';
  resource.stackSize = 64;
}