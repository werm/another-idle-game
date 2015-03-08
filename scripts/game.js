var player = {
	"money": 0,
	"won": false
};
var generators = [];
// New feature, now you can just edit the json file to change growth rate, etc. Makes it simpler to manage.
var dataRequest = new XMLHttpRequest();
dataRequest.open("GET", "https://mysteriousmagenta.github.io/another-idle-game/JSON/data.json",false)
dataRequest.send(null);
var dataJSON = JSON.parse(dataRequest.responseText);

// The actual variables
var growthRate = dataJSON["growthRate"];
var winningMoney = dataJSON["winningMoney"];
var startingCash = dataJSON["startingCash"];


// The templates for generators and how to build them. DNA for Generators, you can call it.
var generatorRequest = new XMLHttpRequest();
generatorRequest.open("GET", "https://mysteriousmagenta.github.io/another-idle-game/JSON/generators.json", false);
generatorRequest.send(null);
var generatorTemplates = JSON.parse(generatorRequest.responseText);


// Helper Functions
function addMoney(amount) {
	if (amount === undefined || amount === null) {
		amount = 1
	}
	player.money += amount;
}

function makeGenerator(name) {
	for (var i = 0; i < generatorTemplates.length; i++) {
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
	for (var i = 0; i < generators.length; i++) {
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
	var infoString =";info" + encodeURI(generators)  // To be used later.
	document.cookie = cookieString + expiryDate + infoString + expiryDate
}
// Starts the game
function initGame() {
	makeGeneratorList();
	makeTooltips();
	getMoneyCookie();
	setInterval(activateGen, 1*1000);
	setInterval(updateDisplay, 1000/10);
	setInterval(setMoneyCookie, 10*1000);
}

if (generatorTemplates) {
	window.onload = initGame;
}
else {
	alert("Wasn't able to get a valid JSON file, aborting!")
}