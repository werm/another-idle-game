$(document).ready(function() {
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
				return i;
			}
			return -1;
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
	if (oldGenerators) {
		for (var i = 0; i < oldGenerators.length; i++) {
			for (var i2 = 0; i2 < oldGenerators[i].children.length; i2++) {
				var currentGenerator = $(oldGenerators[i].children[i2]);
				if (beingHovered < 0 && currentGenerator.html() !== currentGenerator.attr("name")) {
					beingHovered = (3*i)+i2;
				}
			};
			oldGenerators[i].remove();
		};
	}
	var tableColumn = $("<tr></tr>");

	for (var i = 0; i < generatorTemplates.length; i++) {
		var generator = generatorTemplates[i];
		var generatorObj = $('<td class="generator" name="'+ generator.name + '" cost="' + generator.cost + '" mps="'+ generator.mps + '">' + generator.name + "</td>")
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
			var madeGen = makeGenerator(jThis.attr("name"));
			if (madeGen > -1) {
				jThis.attr("cost", generatorTemplates[madeGen]);
				makeGeneratorList();
			}
			
		});
		if (i === beingHovered) {
			generatorObj.mouseenter();
		}
		tableColumn.append(generatorObj);
		var familySize = tableColumn.children().length;
		// So glad this works.
		if (familySize >= 3 || familySize === generatorTemplates.length-generatorList.children().length*3) {
			generatorList.append(tableColumn);
			tableColumn = $("<tr></tr>");
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
				buildings = money.substr(i);
				console.log(buildings);
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
	var infoString = ";build="
	var buildingInfo = "";
	for (var i = 0; i < generatorTemplates.length; i++) {
		buildingInfo += countGenerators(generatorTemplates[i].name) + "|";
	};
	buildingInfo = buildingInfo.substr(0, buildingInfo.length-1);
	infoString += buildingInfo;
	document.cookie = cookieString + expiryDate;
	document.cookie = infoString + expiryDate;
}


function buttonSetup() {
	var save = $("#save");
	save.click(setMoneyCookie);
	var load = $("#load");
	load.click(function() {
		player.money = 0
		getMoneyCookie();
	});
	var getMoney = $("#basicmoney");
	getMoney.click(function() {
		player.money++;
	});
}
// Starts the game
function initGame() {
	buttonSetup();
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
});});