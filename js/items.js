var Items = {};

Items.Stick = {
  name: "Stick"
}

Items.WoodenPick = {
  slot: Slot.Pick,
  LootModifiers : {}
}

Items.WoodenPick.LootModifiers[Resources.Coal.name] = 1;
Items.WoodenPick.LootModifiers[Resources.Stone.name] = 1;
Items.WoodenPick.LootModifiers[Resources.CopperOre.name] = 0;
Items.WoodenPick.LootModifiers[Resources.IronOre.name] = 0;