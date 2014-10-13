function Game()
{
  this.player = new Player();
  //                        Grey    Green      Yellow     Orange
  this.difficultyColors = ['#555', '#00DD00', '#E6DE00', '#FF8E46'];
  setInterval(this.updateUI, 100);
}

Game.prototype.updateUI = function() {
  var g = window.game;

  g.drawLevel();
  g.drawInventory();
  g.drawRecipes();
}

Game.prototype.step = function() {
  var drops = this.gather();
  this.player.collect(drops);
  //this.updateUI();
}

Game.prototype.gather = function() {
  var drops = [];
  var pick = this.player.inventory.pick;
  for (var prop in Resources) {
    if(Resources.hasOwnProperty(prop)) {
      var item = Resources[prop];
      var lootModifier = (item == Resources.Wood ? 1 : 0);
      if (pick) {
        lootModifier = (typeof pick.LootModifiers[item.name] == "undefined" ? lootModifier : pick.LootModifiers[item.name]);
      }

      if (lootModifier == 0) {
        continue;
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

  if (pick) {
    pick.durability -= 1;
    if (pick.durability == 0) {
      // The pick just broke.
      // Replace it with the highest level pick in the the player's inventory.
      var newPick = this.player.inventory.getHighestLevelPick();

      if (newPick) {
        this.player.inventory.items[newPick.name].amount -= 1;
        this.player.inventory.pick = {};
        $.extend(true, this.player.inventory.pick, newPick); // Deep copy new pick item (as to not modify original item)
        this.player.inventory.pick.maxDurability = newPick.durability;
        $('#gather').prop('src', newPick.image);
        $('#currentPick').text(newPick.name);
      }
      else {
        delete this.player.inventory.pick;
        $('#currentPick').text('Bare Hands');
        $('#gather').prop('src', 'images/pick-disabled.png');
      }

      $('#durability').hide();
    }
    else {
      // The pick is not broken.
      var maxWidth = 40;
      var width = maxWidth * pick.durability / pick.maxDurability;
      var red = Math.floor(255 * (1 - width / maxWidth));
      var green = Math.floor(192 * (width / maxWidth));
      var rgb = 'rgb(' + red + ', ' + green + ', 0)';
      $('#durability').show().width(width).css('background-color', rgb);
    }
  }

  return drops;
}

Game.prototype.craft = function(amount, itemLevel) {
  var $current = $('#recipeList li.selectedRecipe');
  if ($current.length > 0) {
    var item = $current.data();
    amount = parseInt(amount) || 1;
    $('#craftAmount').val(1); // Reset craft amount to 1
    this.craftRecipe(item, amount);
  }
}

Game.prototype.craftAll = function() {
  var $current = $('#recipeList li.selectedRecipe');
  if ($current.length > 0) {
    var item = $current.data();
    var amount = this.player.getCraftableAmount(item.Recipe);
    $('#craftAmount').val(1); // Reset craft amount to 1
    this.craftRecipe(item, amount);
  }
}

Game.prototype.craftRecipe = function(item, amount) {
  var g = window.game;
  var p = g.player;
  
  if (item.Recipe.crafting && item.Recipe.craftQueue && item.Recipe.craftQueue.length > 0) {
    // This recipe is already crafting at least one node from a recipe tree.
    while (item.Recipe.craftQueue.length > 0) {
      // Traverse up to the top-most recipe node.
      var node = item.Recipe.craftQueue.shift();
      while (node.parent) {
        node = node.parent;
      }
      
      // Cancel the crafting of this recipe node.
      g.cancelNodeFromRecipeTree(node);
    }
    
    g.updateUI();
    return;
  }
  
  p.requestCrafting(item, amount);
  g.updateUI();
  g.craftRecipeTree();
}

Game.prototype.craftRecipeTree = function(complexity) {
  var g = window.game;
  var p = g.player;

  while(p.requiredRecipes.length > 0) {
    // Get and remove the first recipe in the queue.
    var node = p.requiredRecipes.shift();
    
    // Craft it.
    g.craftNodeFromRecipeTree(node);
  }
}

Game.prototype.cancelNodeFromRecipeTree = function(node) {
  var g = window.game;
  var p = g.player;
  
  var item = node.item;
  
  // Cancel the crafting
  item.Recipe.crafting = false;
  item.Recipe.craftQueue = [];
  
  // Release the reserved resources back into the inventory
  for (var prop in node.reserved) {
    var amount = node.reserved[prop];
    var name = prop.replace(/ /g, '');
    var releasedItem = Items[name]; // Will be undefined if raw resource.
    
    var isForge = releasedItem && releasedItem.type && releasedItem.type == ItemType.Forge;
    if (isForge && p.inventory.forges.length < p.inventory.maxNumForges) {
      // Release the forges from the forge array first.
      var numForgesReleased = 0;
      for (var i = 0; i < p.inventory.forges.length; i++) {
        var forge = p.inventory.forges[i];
        if (forge.level == releasedItem.level && forge.reserved) {
          forge.reserved = false;
          numForgesReleased++;
        }
      }
      
      // Release the remaining forges into the inventory.
      if (numForgesReleased < amount) {
        p.inventory.mergeItem(prop, amount - numForgesReleased);
      }
    }
    else {
      p.inventory.mergeItem(prop, amount);
      g.drawInventory();
    }
  }
  
  var id = item.name.replace(/ /g, '');
  var $el = $('#r_' + id);
  
  if ($el.hasClass('animating')) {
    // Remove the background animation bar (unless recipe is selected)
    if (!$el.hasClass('selectedRecipe')) {
      unselectRecipe($el);
    }
    
    // Stop the animation
    $el.stop();
    $el.removeClass('animating');
  }

  // Return the width of the recipe to full-width
  $el.width(g.recipeWidth);
  
  // Remove the crafting status.
  $('#rcs_' + id).text('').hide();

  $('#craft').val('Craft');
  $('#craftAll').removeAttr('disabled');
  
  while (node.children.length > 0) {
    var child = node.children.shift();
    g.cancelNodeFromRecipeTree(child);
  }
}

Game.prototype.craftNodeFromRecipeTree = function(node) {
  var g = window.game;
  var p = g.player;
  
  var req = node.item;
  var id = req.name.replace(/ /g, '');
  var $reqEl = $('#r_' + id);
  if (!$reqEl.hasClass('selectedRecipe')) {
    highlightRecipe($reqEl);
  }
  
  // Kick off the crafting animation.
  g.showCraftingAnimation(node, $reqEl,
    function()
    {
      node.crafted = true;
      req.Recipe.crafting = false;
      req.Recipe.craftQueue = [];
      
      if (node.parent && node.parent.children.every(function(c) { return c.crafted })) {       
        // All children have been crafted. Move up to the parent.
        g.craftNodeFromRecipeTree(node.parent);
      }
    });
}

Game.prototype.showCraftingAnimation = function(requiredRecipe, el, doneCallback) {
  var g = window.game;
  var p = g.player;

  var item = requiredRecipe.item;
  var amount = requiredRecipe.amount;
  console.log("Crafting " + amount + " of " + item.name);

  var recipe = item.Recipe;
  var multiplier = 0;
  if (recipe.forge) {
    var smeltModifier = 1;
    for (var i = 0; i < p.inventory.forges.length; i++) {
      var forge = p.inventory.forges[i];
      if (forge.level >= recipe.forge.level) {
        smeltModifier = (forge.SmeltModifiers && typeof forge.SmeltModifiers[item.name] != "undefined" ? forge.SmeltModifiers[item.name] : smeltModifier);
        multiplier += smeltModifier;
      }
    }
  }

  multiplier = multiplier || 1;
  var craftTime = Math.round(recipe.craftTime * 1000 / multiplier);
  craftTime = this.cheat ? 0 : craftTime;

  if (el.hasClass('selectedRecipe')) {
    // Disable the Craft All button
    $('#craftAll').prop('disabled', 'disabled');

    // Switch the Craft button to say Cancel
    $('#craft').val('Cancel');
  }

  var id = item.name.replace(/ /g, '');
  $('#rcs_' + id).show().text('Crafting ' + amount);
  
  recipe.crafting = true;
  var parent = requiredRecipe.parent;
  while(parent) {
    parent.item.Recipe.crafting = true;
    var parentId = parent.item.name.replace(/ /g, '');
    $('#rcs_' + parentId).show().text('Waiting');    
    parent = parent.parent;
  }

  // Begin the crafting animation.
  el.addClass('animating').width(0).animate(
    { width: g.recipeWidth },
    craftTime,
    "linear",
    function() {    
      p.craft(requiredRecipe);
      g.updateUI();
      drawCurrentRecipeRequirements();
      if (requiredRecipe.amount > 0) {
        g.showCraftingAnimation(requiredRecipe, el, doneCallback);
      }
      else if (doneCallback) {
        doneCallback();
      }

      if (requiredRecipe.amount == 0) {
        $('#rcs_' + id).hide();
        $(this).removeClass('animating');

        // Enable the Craft All button
        $('#craftAll').removeAttr('disabled');

        // Switch the Cancel button to say Craft
        $('#craft').val('Craft');

        // During the crafting, the selected recipe could have changed.
        // If so, remove the background bar at the end of the animation.
        if (!el.hasClass('selectedRecipe')) {
          unselectRecipe(el);
        }
      }
    });
}

Game.prototype.getPlayerLevelText = function() {
  return 'Level ' + this.player.level;
}

Game.prototype.getPlayerExperienceText = function() {
  return Math.round(this.player.xp) + ' / ' + this.player.xpMax;
}

Game.prototype.drawLevel = function() {
  var g = window.game;
  var p = g.player;

  var maxWidth = $('#experienceBarText').width();
  $('#experienceBar').width(Math.round(maxWidth * p.xp / p.xpMax));

  if (g.experienceShown) {
    $('#experienceBarText').text(g.getPlayerExperienceText());
  }
  else {
    $('#experienceBarText').text(g.getPlayerLevelText());
  }
}

Game.prototype.drawRecipes = function() {
  var g = window.game;
  var p = g.player;

  for (var prop in Items) {
    if (Items.hasOwnProperty(prop)) {
      var item = Items[prop];
      var recipe = item.Recipe;
      if (recipe.available) {
        var amount = p.getCraftableAmount(recipe);
        var id = prop.replace(/ /g, '');
        var $row = $('#r_' + id);
        if ($row.length) {
          // Row for recipe already exists.
          var color = g.determineRecipeColor(recipe);
          $('#ra_' + id).text(amount > 0 ? '[' + amount + ']' : '');

          // Add a tooltip that says how many of the item exists in the inventory
          if (p.inventory.items[item.name]) {
            var currentAmount = p.inventory.items[item.name].amount;
            $('#r_' + id).prop('title', item.name + ' inventory: ' + currentAmount);
          }

          var isAnimating = $row.hasClass('animating');
          if ($row.hasClass('selectedRecipe') || isAnimating) {
            $row.css('background-color', color);
            $row.css('color', 'white');

            var disabled = (amount == 0);
            if (disabled) {
              $('#craft').prop('disabled', 'disabled');
              $('#craftAll').prop('disabled', 'disabled');
            }
            else if (!isAnimating) {
              $('#craft').removeAttr('disabled');
              $('#craftAll').removeAttr('disabled');
            }
          }
          else
          {
            $row.css('color', color);
          }
        }
        else {
          // Recipe was just unlocked.
          // Add a new row for it.
          $('#recipeList').prepend(
            $('<li/>',
            {
              id: 'r_' + id,
              data: item,
            })
            .append(
              $('<div/>',
              {
                id: 'rn_' + id,
                text: item.name,
                class: 'recipeName',
              })
              .append(
                $('<span/>',
                {
                  id: 'ra_' + id,
                  text: amount > 0 ? '[' + amount + ']' : ''
                }))
              .append(
                $('<span/>',
                {
                  id: 'rcs_' + id,
                  class: 'floatRight scrollbarPadding'
                })
              )
            )
            .css('color', g.determineRecipeColor(recipe))
            .click(function() { selectRecipe($(this)) })
            .dblclick(function() { g.craft($('#craftAmount').val()) })
          );
          $('#rn_' + id).width(g.recipeWidth).hide().fadeIn();
        }
      }
    }
  }

  var $current = $('#recipeList li.selectedRecipe');
  if ($current.length) {
    if (!$current.hasClass('animating')) {
      drawRecipeRequirements($current);
    }
  }
}

Game.prototype.drawInventory = function() {
  for (var prop in this.player.inventory.items) {
    if(this.player.inventory.items.hasOwnProperty(prop)) {
      //var amount = this.player.inventory.items[prop].amount;
      var amount = this.player.inventory.getNumberOfItemFromInventory(prop);
      var id = prop.replace(/ /g, '')
      var value = $('#iv_' + id);
      if (value.length) {
        if (amount > 0) {
          value.text(amount);
        }
        else {
          // No more of this item in the inventory. Remove the row.
          $('#ir_' + id).remove();
        }
      }
      else {
        if (amount > 0) {
          var $newRow = $('<tr/>', 
          {
            id: 'ir_' + id
          }).append(
              $('<td/>',
              {
                id: 'in_' + id,
                text: prop,
                class: 'alignRight'
              })
            )
            .append(
              $('<td/>',
              {
                id: 'iv_' + id,
                text: amount
              })
            );

          // If no invetory rows exist, add it to the <tbody>
          var $tbody = $('#inventoryTable tbody');
          var $rows = $('#inventoryTable td[id*=in]');
          if (!$rows.length) {
            $tbody.append($newRow);
            return;
          }

          // Keep the table sorted.
          // Find the first row whose name is alphatetically greater than the new name
          var $row = null;
          $('#inventoryTable td[id*=in]').each(function() {
            if ($(this).text().localeCompare(prop) == 1) {
              $row = $(this).parent();
              return false;
            }
          });

          if ($row) {
            $row.before($newRow);
          }
          else {
            // No row found, put it at the end
            $('#inventoryTable tbody tr:last').after($newRow);
          }
        }
      }
    }
  }
}

Game.prototype.determineRecipeColor = function(recipe) {
  var g = window.game;
  var p  = g.player;

  var diff = p.determineRecipeDifficulty(recipe);
  return g.difficultyColors[diff];
}

Game.prototype.r = function() {
  return Math.random();
}

var game = new Game();

highlightRecipe = function(el) {
  if (!el.hasClass('animating') ) {
    el.css('background-color', el.css('color'))
    el.css('color', '')
    el.addClass('background');
    $('#craft').val('Craft');
    $('#craftAll').removeAttr('disabled');
  }
  else {
    $('#craft').val('Cancel');
    $('#craftAll').prop('disabled', 'disabled');
  }

  var disabled = el.find('span').text() == '';
  if (disabled) {
    $('#craft').prop('disabled', 'disabled');
    $('#craftAll').prop('disabled', 'disabled');
  }
  else if (!el.hasClass('animating')) {
    $('#craft').removeAttr('disabled');
    $('#craft').val('Craft');
    $('#craftAll').removeAttr('disabled');
  }
}

selectRecipe = function(el) {
  var $current = $('#recipeList li.selectedRecipe');
  if ($current.length) {
    if (!$current.hasClass('animating')) {
      unselectRecipe($current);
    }

    $current.removeClass('selectedRecipe');
  }

  highlightRecipe(el);
  el.addClass('selectedRecipe');
  drawRecipeRequirements(el);
}

unselectRecipe = function(el) {
  el.removeClass('background');
  el.css('color', el.css('background-color'))
  el.css('background-color', '')
}

drawCurrentRecipeRequirements = function() {
  var $current = $('#recipeList li.selectedRecipe');
  if ($current.length) {
    drawRecipeRequirements($current);
  }
}

drawRecipeRequirements = function(el) {
  var g = window.game;
  var p = g.player;

  var $div = $('#recipeRequirements');
  var item = el.data();
  var recipe = item.Recipe;
  var id = item.name.replace(/ /g, '')

  $div.empty();

  $('<h1/>', {
    id: 'recipeName',
    text: item.name,
  }).appendTo($div);

  $('<h4/>', {
    id: 'craftTime',
    text: 'Craft time: ' + createTimeString(recipe.craftTime),
  }).appendTo($div);

  if (recipe.text) {
    $('<p/>', {
      text: recipe.text,
      class: 'recipeDesc'
    }).appendTo($div);
  }

  if (recipe.forge) {
    var $reqForge = $('<p/>', {
      id: 'requiresForge',
      text: 'Requires '
    });

    var forgeId = recipe.forge.name.replace(/ /g, '');    
    $('<a/>',
    {
      text: recipe.forge.name,
      href: '#'

    }).click(function()
    {
      selectRecipe($('#r_' + forgeId));
    }).appendTo($reqForge);

    $reqForge.appendTo($div);

    if (!p.inventory.forges.some(function(f) { return f.level >= recipe.forge.level })) {
      $reqForge.addClass('missing');
    }
  }

  var $table = drawRecipeRequirementsTable(recipe, p, id);
  $div.append($table);
}

drawRecipeRequirementsTable = function(recipe, p, id) {
  var $table = $('<table/>', {
    id: 'recipeRequirementList'
  });

  var $tbody = $('<tbody/>');
  for (var i = 0; i < recipe.Requirements.length; i++) {
    var req = recipe.Requirements[i];
    var isForge = req.resource.type && req.resource.type == ItemType.Forge;

    var missingAmount = 0;
    var currentAmount = (p.inventory.items[req.resource.name] ? p.inventory.items[req.resource.name].amount : 0);
    if (isForge) {
      var forgeLevel = req.resource.level;
      for (var j = 0; j < p.inventory.forges.length; j++) {
        var forge = p.inventory.forges[j];
        if (forge.level == forgeLevel) {
          currentAmount++;
        }
      }
    }

    if (currentAmount < req.amount) {
      missingAmount = req.amount - currentAmount;
    }

    var $row = $('<tr/>');
    $('<td/>', {
      id: 'rrv_' + id,
      class: 'alignRight',
      text: (missingAmount > 0 ? currentAmount + '/' : '') + req.amount
    }).appendTo($row);

    var $name = $('<td/>');

    if (req.resource.Recipe) {
      var reqId = req.resource.name.replace(/ /g, '')
      $('<a/>',
      {
        id: 'rrn_' + reqId,
        text: req.resource.name,
        href: "#",
      }).click(function()
      {
        selectRecipe($('#r_' + $(this).prop('id').replace('rrn_', '')));
      }).appendTo($name);
    }
    else {
      $('<span/>',
      {
        text: req.resource.name,
      }).appendTo($name);
    }

    $('<span/>', 
    {
      id: 'rra_' + reqId,
      text: '(' + currentAmount + ')',
      class: 'amount'
    }).appendTo($name);

    $name.appendTo($row);

    if (missingAmount > 0) {
      $row.addClass('missing');
    }

    $tbody.append($row);
  }

  $table.append($tbody);
  return $table;
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
      ret += "" + hrs + " hour" + (hrs != 1 ? "s" : "") + (mins > 0 || secs > 0 ? ", " : "");
  }

  if (mins > 0) {
    ret += "" + mins + " minute" + (mins != 1 ? "s" : "") + (secs > 0 ? ", " : "");
  }
  
  if (secs > 0) {
    ret += "" + secs + " second" + (secs != 1 ? "s" : "");
  }

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

    game.drawLevel();
    game.drawRecipes();
    game.recipeWidth = $('#recipeList li:first').width() - 2 /*border*/;

    $('#experienceBarText').hover(
      function() {
        game.experienceShown = true;
        $(this).text(game.getPlayerExperienceText())
      },
      function() {
        game.experienceShown = false;
        $(this).text(game.getPlayerLevelText())
      }
    );

    $('#durability').hide();
    $('#gatherLink').click(function(e) { e.preventDefault(); });
});

$(document).keypress(function(e) {
  if ($('#craftAmount').is(":focus")) {
    return;
  }

  e.preventDefault(); // Prevent page down on hitting space bar
  if (e.which == 32) { // space
    game.craft($('#craftAmount').val())
  }
  else if (e.which  == 65 || e.which == 97) { // '[Aa]'
    game.craftAll();
  }
  else if (e.which == 71 || e.which == 103) { // '[Gg]'
    game.step();
  }
  else if (e.which >= 49 && e.which <= 57) { // '[1-9]'
    var amount = e.which - 48;
    var $current = $('#recipeList li.selectedRecipe');
    if ($current.length > 0) {
      var g = window.game;
      var item = $current.data();
      g.craftRecipe(item, amount);
    }
  }
});