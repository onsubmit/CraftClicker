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

Game.prototype.craft = function(amount) {
  amount = parseInt(amount);
  var $current = $('#recipeList li.selectedRecipe');
  if ($current.length > 0) {
    var recipe = $current.data();
    this.craftRecipe(recipe, amount, $current);
  }
}

Game.prototype.craftAll = function() {
  var $current = $('#recipeList li.selectedRecipe');
  if ($current.length > 0) {
    var recipe = $current.data();
    var amount = this.player.getCraftableAmount(recipe);
    this.craftRecipe(recipe, amount, $current);
  }
}

Game.prototype.craftRecipe = function(recipe, amount, el) {
  if (amount == 0) {
    return;
  }

  var g = window.game;
  var p = g.player;

  // Note that crafting of the given recipe has been requested.
  p.crafting[recipe.name] = el;

  var fullWidth = el.width();

  // Confirm the necessary requirements are still met for this recipe
  if (p.getCraftableAmount(recipe) == 0) {
    // Stop the animation
    el.stop();
    
    // Return the width of the recipe to full-width
    el.width(fullWidth);
    return;
  }

  // Show the cancel icon
  var id = recipe.name.replace(/ /g, '');
  var $cancelLink = $('#rc_' + id)
  $cancelLink.show();

  // Begin the crafting animation.
  var count = amount;
  el.width(0).animate(
    { width: fullWidth },
    recipe.craftTime * 1000,
    "linear",
    function() {
      // Clicking the cancel icon removes the queued up crafting request
      if (!p.crafting[recipe.name]) {
        amount = 0;
      }
      else {
        // Confirm the necessary requirements are still met for this recipe.
        // Since gathered materials could have changed during the crafting of this item,
        // recalculated the total amount that can still be crafted.
        amount = p.getCraftableAmount(recipe);
      }

      if (amount == 0) {
        // Stop the animation
        el.stop();

        // Return the width of the recipe to full-width
        el.width(fullWidth);

        // Hide the cancel icon
        $cancelLink.hide();
      }
      else {
        p.craft(recipe);
        g.updateUI();
        g.craftRecipe(recipe, --count, el);
      }

      if (count == 0) {
        delete p.crafting[recipe.name];

        // Hide the cancel icon
        $cancelLink.hide();

        // During the crafting, the selected recipe could have changed.
        // If so, remove the background bar at the end of the animation.
        if (!el.hasClass('selectedRecipe')) {
          unselectRecipe(el);
        }
      }

      // Iterate through all other recipes queued up for crafting to confirm the necessary requirements are still met.
      // If not, cancel the crafting.
      for (var prop in p.crafting) {
        if(p.crafting.hasOwnProperty(prop)) {
          var $queuedRecipe = p.crafting[prop];
          var $queuedCancelLink = $queuedRecipe.find('.cancel');
          var amount = p.getCraftableAmount($queuedRecipe.data());
          if (amount == 0) {
            // Stop the animation
            $queuedRecipe.stop();

            // Return the width of the recipe to full-width
            $queuedRecipe.width(fullWidth);

            // Hide the cancel icon
            $queuedCancelLink.hide();

            // Remove the background animation bar (unless recipe is selected)
            if (!$queuedRecipe.hasClass('selectedRecipe')) {
              unselectRecipe($queuedRecipe);
            }

            delete p.crafting[prop];
          }
        }
      }
    });
}

Game.prototype.drawRecipes = function() {
  var g = window.game;
  var p = g.player;

  for (var prop in Recipes)
  {
    if(Recipes.hasOwnProperty(prop)) {
      var recipe = Recipes[prop];
      if (this.player.level >= recipe.minLevel) {
        var amount = p.getCraftableAmount(recipe);
        var id = prop.replace(/ /g, '');
        var $row = $('#r_' + id);
        if ($row.length) {
          $('#ra_' + id).text(amount > 0 ? '[' + amount + ']' : '')
          if ($row.hasClass('selectedRecipe')) {
            var disabled = (amount == 0);
            $('#craft').prop('disabled', disabled);
            $('#craftAll').prop('disabled', disabled);
          }
        }
        else {
          $('<li/>',
          {
            id: 'r_' + id,
            data: recipe,
          })
          .append(
            $('<div/>',
            {
              id: 'rn_' + id,
              text: recipe.name,
              class: 'recipeName',
            })
            .append(
              $('<span/>',
              {
                id: 'ra_' + id,
                text: amount > 0 ? '[' + amount + ']' : ''
              })
            )
            .append(
              $('<a/>',
              {
                id: 'rc_' + id,
                class: 'floatRight cancel',
                text: 'x',
                title: 'Cancel',
                href: '#',
                click: function(event) {
                  var $el = $(this).parents('li');
                  var elRecipe = $el.data();

                  // Dequeue the crafting request
                  delete p.crafting[elRecipe.name];

                  // Stop the animation
                  $el.stop();

                  // Return the width of the recipe to full-width
                  $el.width($(this).parent().width())

                  // Hide the cancel icon
                  $(this).hide();

                  // Remove the background animation bar (unless recipe is selected)
                  if (!$el.hasClass('selectedRecipe')) {
                    unselectRecipe($el);
                  }

                  // Prevent the click event from bubbling up to the parent.
                  // This was causing the parent <li> onclick event to fire, selecting the cancelled recipe.
                  event.stopPropagation();
                }
              }).hide()
            )
          )
          .css('color', g.determineRecipeColor(recipe))
          .click(function() { selectRecipe($(this)) })
          .dblclick(function() { g.craft($('#craftAmount').val()) })
          .appendTo('#recipeList');
          $('#rn_' + id).width($('#r_' + id).width());
        }
      }
    }
  }

  var $current = $('#recipeList li.selectedRecipe');
  if ($current.length) {
    if (!$($current).is(':animated') ) {
      drawRecipeRequirements($current);
    }
  }
}

Game.prototype.drawInventory = function() {
  for (var i = 0; i < this.player.inventory.sorted.length; i++) {
    var prop = this.player.inventory.sorted[i];
    var amount = this.player.inventory.items[prop];
    var id = prop.replace(/ /g, '')
    var value = $('#iv_' + id);
    if (value.length) {
      value.text(amount);
    }
    else {
      var newRow = '\
        <tr>\
          <td id="in_' + id + '">' + prop + '</td>\
          <td id="iv_' + id + '">' + amount + '</td>\
        </tr>';

      // If no invetory rows exist, add it to the <tbody>
      var $tbody = $('#inventoryTable tbody');
      var $rows = $('#inventoryTable td[id*=in]');
      if (!$rows.length) {
        $tbody.append(newRow);
        return;
      }

      // Keep the table sorted.
      // Find the first row whose name is alphatetically greater than the new name
      var $row = null;
      $('#inventoryTable td[id*=in]').each(function() {
        if ($(this).text().localeCompare(prop) == 1) {
          $row = $(this).parent();
          return false;
;        }
      });

      if ($row) {
        $row.before(newRow);
      }
      else {
        // No row found, put it at the end
        $('#inventoryTable tbody tr:last').after(newRow);
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

selectRecipe = function(el) {
  var $current = $('#recipeList li.selectedRecipe');
  if ($current.length) {
    if (!$($current).is(':animated') ) {
      unselectRecipe($current);
    }

    $current.removeClass('selectedRecipe');
  }

  if (!$(el).is(':animated') ) {
    el.css('background-color', el.css('color'))
    el.css('color', '')
    el.addClass('background');
  }

  var disabled = el.find('span').text() == '';
  $('#craft').prop('disabled', disabled);
  $('#craftAll').prop('disabled', disabled);

  el.addClass('selectedRecipe');

  drawRecipeRequirements(el);
}

unselectRecipe = function(el) {
  el.removeClass('background');
  el.css('color', el.css('background-color'))
  el.css('background-color', '')
}

drawRecipeRequirements = function(el) {
  var g = window.game;
  var p = g.player;

  var $div = $('#recipeRequirements');
  var recipe = el.data();
  var id = recipe.name.replace(/ /g, '')

  $div.empty();

  $('<h1/>', {
    id: 'recipeName',
    text: recipe.name,
  }).appendTo($div);

  $('<h4/>', {
    id: 'craftTime',
    text: 'Craft time: ' + createTimeString(recipe.craftTime),
  }).appendTo($div);

  if (recipe.requiresForge) {
    $('<p/>', {
      id: 'requiresForge',
      text: "Requires Forge",
    }).appendTo($div);
  }

  var $table = $('<table/>', {
    id: 'recipeRequirementList'
  });

  var $tbody = $('<tbody/>');
  for (var i = 0; i < recipe.Requirements.length; i++) {
    var req = recipe.Requirements[i];

    var missingAmount = 0;
    var currentAmount = p.inventory.items[req.resource.name] ? p.inventory.items[req.resource.name] : 0;
    if (currentAmount < req.amount) {
      missingAmount = req.amount - currentAmount;
    }

    var $row = $('<tr/>');
    $('<td/>', {
      id: 'rrv_' + id,
      class: 'alignRight',
      text: (missingAmount > 0 ? currentAmount + '/' : '') + req.amount
    }).appendTo($row);

    $('<td/>', {
      id: 'rrn_' + id,
      text: req.resource.name
    }).appendTo($row);

    if (missingAmount > 0) {
      $row.addClass('missing');
    }

    $tbody.append($row);
  }

  $table.append($tbody);
  $div.append($table);
}

createTimeString = function(time) {
  // http://stackoverflow.com/a/11486026
  var mins = ~~(time / 60);
  var secs = time % 60;

  // Hours, minutes and seconds
  var hrs = ~~(time / 3600);
  var mins = ~~((time % 3600) / 60);
  var secs = time % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  ret = "";

  if (hrs > 0) {
      ret += "" + hrs + " hour" + (hrs > 1 ? "s" : "") + (mins > 0 || secs > 0 ? ", " : "");
  }

  if (mins > 0) {
    ret += "" + mins + " minute" + (mins > 1 ? "s" : "") + (secs > 0 ? ", " : "");
  }
  
  ret += "" + secs + " second" + (secs > 1 ? "s" : "");
  return ret;
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