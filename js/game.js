function Game()
{
  this.player = new Player();
  setInterval(this.updateUI, 2000);
}

Game.prototype.updateUI = function() {
  var g = window.game;
  var p = g.player;

  game.drawInventory();
  game.drawRecipes();
}

Game.prototype.step = function() {
  var drops = this.gather();
  this.player.collect(drops);
  this.updateUI();
}

Game.prototype.gather = function() {
  var drops = [];
  for (var prop in Resources)
  {
    if(Resources.hasOwnProperty(prop)) {
      var item = Resources[prop];
      var pick = this.player.equipment.items[Slot.Pick];
      var lootModifier = 1;
      if (pick) {
        lootModifier = (typeof pick.LootModifiers[item.name] == "undefined" ? lootModifier : pick.LootModifiers[item.name]);
        if (lootModifier == 0) {
          continue;
        }
      }

      // Stop processing items if the player's level is too low
      if (item.minLevel > this.player.level) {
        break;
      }

      if (item.dropChance > this.r()) {
        drops.push({ item: item, amount: Math.ceil(this.r() * item.maxDropAmount * lootModifier)})
      }
    }
  }

  return drops;
}

Game.prototype.craft = function() {
  var $current = $('#recipeList li.selectedRecipe');
  if ($current.length > 0) {
    var recipe = $current.data();
    this.player.craft(recipe);
    this.updateUI();
  }
}

Game.prototype.drawRecipes = function() {
  for (var prop in Recipes)
  {
    if(Recipes.hasOwnProperty(prop)) {
      var recipe = Recipes[prop];
      if (this.player.level >= recipe.minLevel) {
        var amount = this.player.getCraftableAmount(recipe);
        var id = prop.replace(/ /g, '');
        var row = $('#r_' + id);
        if (row.length) {
          $('#ra_' + id).text(amount > 0 ? '[' + amount + ']' : '')
        }
        else {
          $('<li id="r_' + id + '"></li>')
            .data(recipe)
            .text(recipe.name)
            .append(
              $('<span id="ra_' + id + '"></span>')
                .text(amount > 0 ? '[' + amount + ']' : '')
            )
            .css('color', this.determineRecipeColor(recipe))
            .click(function() { highlightRecipe($(this)) })
            .appendTo('#recipeList');
        }
      }
    }
  }
}

Game.prototype.drawInventory = function() {
  for (var prop in this.player.inventory.items) {
    if(this.player.inventory.items.hasOwnProperty(prop)) {
      var amount = this.player.inventory.items[prop];
      var id = prop.replace(/ /g, '')
      var value = $('#iv_' + id);
      if (value.length) {
        value.text(amount);
      }
      else {
        $('#inventoryTable tr:last').after('\
          <tr>\
            <td id="in_' + id + '">' + prop + '</td>\
            <td id="iv_' + id + '">' + amount + '</td>\
          </tr>');
      }
    }
  }
}

Game.prototype.determineRecipeColor = function(recipe) {
  var diff = recipe.minLevel - this.player.level;
  if (diff == 0) {
    return '#FF8E46';
  }

  if (diff < 3) {
    return '#838300';
  }

  if (diff < 6) {
    return '#297022';
  }

  return '#555';
}

Game.prototype.r = function() {
  return Math.random();
}

var game = new Game();

highlightRecipe = function(el) {
  var $current = $('#recipeList li.selectedRecipe');
  $current.css('color', $current.css('background-color'))
  $current.css('background-color', '')
  $current.removeClass('selectedRecipe');
  el.css('background-color', el.css('color'))
  el.css('color', '')
  el.addClass('selectedRecipe');
}

$(document).ready(function() {
    $('body')
      .bind("contextmenu", function(e) { return false; })
      .attr('unselectable', 'on')
      .css({
        MozUserSelect: 'none',
        KhtmlUserSelect: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      })
      .each(function() { 
        this.onselectstart = function() { return false; };
    });

    game.drawRecipes();
});