var player = {
	"money": 0,
	"won": false
};
var generators = [];
// Some variables os that they are global laters.
var generatorTemplates;
var growthRate;
var winningMoney;
var startingCash;
var generatorSeconds; 
var displaySeconds;
var cookieSeconds;
var cookieInterval;


function makeGenerator(name) {
	var i;
	for (i = 0; i < generatorTemplates.length; i++) {
		if (generatorTemplates[i].name == name) {
			if (!generatorTemplates[i].increment) {
				generatorTemplates[i].increment = function() {
					player.money += +this.mps;
				}
			}
			if (player.money >= generatorTemplates[i].cost) {
				player.money -= generatorTemplates[i].cost;
				generators.push(generatorTemplates[i]);
				generatorTemplates[i].cost = Math.floor(generatorTemplates[i].cost + generatorTemplates[i].cost * growthRate);
				makeGeneratorList();
				
			}
			return;
		}
	};
}

function countGenerators(name) {
	var count = 0;
	var i;
	for (i = 0; i < generators.length; i++) {
		if (generators[i].name == name) {
			count++
		}
	};
	return count;
}

function activateGen() {
	var generator;
	for (var i=0; i < generators.length; i++) {
		generator = generators[i]
		generator.increment();
	}
}

function updateDisplay() {
	$("#display").html("€" + player.money);
	var total = 0;
	for (var i = 0; i < generators.length; i++) {
		total += generators[i].mps;
	};
	$("#mps").html("€" + total + "/S");
}

function makeGeneratorList() {
	var generatorList = $("#generators");
	var oldGenerators = generatorList.children();
	var beingHovered = -1;
	var extra = 0;
	if (oldGenerators.length) {
		for (var i = 0; i < oldGenerators.length; i++) {
			var current = $(oldGenerators[i])
			if (current) {
				if (current.attr("name") === undefined) {
					extra++;
				}
				else if (beingHovered === -1 && current.html() !== current.attr("name")) {
					beingHovered = i-extra;
				}
				current.remove();
			}
		};
	}
	for (var i = 0; i < generatorTemplates.length; i++) {
		var generator = generatorTemplates[i];
		var generatorObj = $('<li class="generator" name="'+ generator.name + '" cost="' + generator.cost + '" mps="'+ generator.mps + '">' + generator.name + "</li>")
		if (generator["hover"]) {
			generatorObj.attr("title", generator["hover"]);
		}
		generatorObj.mouseenter(function() {
			var jThis = $(this);
			var newName = jThis.html();
			if (newName === jThis.attr("name")) {
				newName += " [€" + jThis.attr("cost") + "]";
				newName += " [€" + jThis.attr("mps") + "/S]";
				newName += " [" + countGenerators(jThis.attr("name")) + "]"
				jThis.html(newName);
			}

		});
		generatorObj.mouseleave(function() {
			var jThis = $(this);
			jThis.html(jThis.attr("name"));
		});
		generatorObj.click(function() {
			var jThis = $(this);
			makeGenerator(jThis.attr("name"));
		});
		if (i === beingHovered) {
			generatorObj.mouseenter();
		}
		generatorList.append(generatorObj);
		if ((i+1) % 3 === 0) {
			generatorList.append($("<br/>"))
		}
	};
}

function makeTooltips() {
	var expls = $(".expl");
	for (var i = 0; i < expls.length; i++) {
		var expl = $(expls[i]);
		expl.click(function() {
			var jThis = $(this);
			if (jThis.html() !== jThis.attr("title")) {
				jThis.html("[" + jThis.attr("title") + "]");
			}
			else {
				jThis.html("[?]");
			}
		})
		expl.mouseleave(function() {
			var jThis = $(this);
			jThis.html("[?]");
		});
	};
}

// Cookie handling
function getMoneyCookie() {
	var money = document.cookie.substr(document.cookie.indexOf("money=")+"money=".length, document.cookie.length);
	if (money) {
		for (var i = 0; i < money.length; i++) {
			if (money[i]===";") {
				money = money.substr(0, i);
				break
			}
		};
		// Makes it default to whatever is in the startingCash variable if we have an invalid money cookie.
		player.money = +(+money || startingCash.toString())
	}
}

function setMoneyCookie() {
	var cookieString = "money=" + player.money
	var expiryDate = ";expires=Fri, 31 Dec 9999 23:59:59 GMT"
	document.cookie = cookieString + expiryDate
}

function saveButtons() {
	var save = $("#save");
	save.click(setMoneyCookie);
	/*var load = $("#load");
	load.click(function() {
		player.money = 0
		getMoneyCookie();
	});*/
}
// Starts the game
function initGame() {
	saveButtons();
	makeGeneratorList();
	makeTooltips();
	getMoneyCookie();
	setInterval(activateGen, generatorSeconds*1000);
	setInterval(updateDisplay, displaySeconds/10);
	cookieInterval = setInterval(setMoneyCookie, cookieSeconds*1000);
}

$.when($.getJSON('https://mysteriousmagenta.github.io/another-idle-game/JSON/data.json'), $.getJSON('https://mysteriousmagenta.github.io/another-idle-game/JSON/generators.json'))
.done(function(ret1, ret2) {
	generatorTemplates = ret2[0];
	growthRate = ret1[0].growthRate
	winningMoney = ret1[0].winningMoney;
	startingCash = ret1[0].startingCash;
	generatorSeconds = ret1[0].generatorSeconds;
	displaySeconds = ret1[0].displaySeconds;
	cookieSeconds = ret1[0].cookieSeconds;
	initGame();
});