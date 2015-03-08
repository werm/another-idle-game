// Request for the data
var dataRequest = new XMLHttpRequest();
dataRequest.open("GET", "https://mysteriousmagenta.github.io/another-idle-game/JSON/data.json",false);
dataRequest.send(null);
// Request for the generators;
var generatorRequest = new XMLHttpRequest();
generatorRequest.open("GET", "https://mysteriousmagenta.github.io/another-idle-game/JSON/generators.json", false);
generatorRequest.send(null);

// The data response, which stores important information.
var dataJSON = JSON.parse(dataRequest.responseText);
var growthRate = dataJSON.growthRate;
var winningMoney = dataJSON.winningMoney;
var startingCash = dataJSON.startingCash;
var generatorSeconds = dataJSON.generatorSeconds;
var displaySeconds = dataJSON.displaySeconds;
var cookieSeconds = dataJSON.cookieSeconds;
// THe templates for the generators
var generatorTemplates = JSON.parse(generatorRequest.responseText);
var player = {
	"money": 0,
	"generators": [],
	"won": false,
}

function addMoney(amount) {
	if (amount === undefined || amount === null) {
		amount = 1;
	}
	player.money += amount;
}

function makeGenerator(name) {
	for (var i = 0; i < generatorTemplates.length; i++) {
		var generator = generatorTemplates[i];
		if (generator.name === name) {
			if (player.money >= generator.cost) {
				if (!generator.increment) {
					generatorTemplates[i].increment = function() {
						player.money += this.mps;
					}
				}
				player.generators.push(generatorTemplates[i]);
				makeGeneratorList();
			}
			break
		}
	};
}

function countGenerators(name) {
	var count = 0;
	for (var i = 0; i < player.generators.length; i++) {
		if (player.generators[i].name === name) {
			count++;
		}
	};
	return count;
}

function makeGeneratorList() {
	var generatorList = $("#generators")
	var hovering = -1;
	for (var i = 0; i < generatorList.length; i++) {
		var generator = generatorList[i];
		if (generator.html() != generator.attr("name") && hovering === -1) {
			hovering = i;
		}		
		generator.remove();
	};
	for (var i = 0; i < generatorTemplates.length; i++) {
		var chosenGenerator = generatorTemplates[i];
		var HTMLGenerator = $("<span><span/>");
		HTMLGenerator.attr("cost", chosenGenerator.cost);
		HTMLGenerator.attr("name", chosenGenerator.name);
		HTMLGenerator.attr("mps", chosenGenerator.mps);
		HTMLGenerator.mouseenter(function() {
			var jThis = $(this);
			var newName = jThis.html();
			if (newName === jThis.attr("name")) {
				newName += "[€" + jThis.attr("cost") + "]";
				newName += "[€" + jThis.attr("mps") + "/S]";
				newName += "[" + countGenerators(jThis.attr("name")) + "]"
			}
			jThis.html(newName);
		});
		HTMLGenerator.mouseleave(function() {
			var jThis = $(this);
			jThis.html(jThis.attr("name"));
		});
		if (hovering === i) {
			HTMLGenerator.mouseenter();
		}
		generatorList.append(HTMLGenerator);
	};
}

function activateGen() {
	for (var i = 0; i < player.generators.length; i++) {
		player.generators[i].increment();
	};
}

function getMoney() {
	var cookieIndex = document.cookie.index("money=") + "money=".length;
	var cookieString = document.cookie.substr(cookieIndex, document.cookie.length);
	for (var i = 0; i < cookieString.length; i++) {
		if (cookieString[i] === ";") {
			cookieString = cookieString.substr(0, i);
			break
		}
	};
	console.log("Money Cookie: " + cookieString);
	player.money = +cookieString || startingCash;
}

function setCookie() {
	document.cookie = "money=" + player.money + ";expires=Fri, 31 Dec 9999 23:59:59 GMT"
}

function updateDisplay() {
	var display = $("#display");
	display.html("€" + player.money);
	var display2 = $("#mps")
	var count = 0;
	for (var i = 0; i < player.generators.length; i++) {
		count += player.generators[i].mps;
	};
	display2.html("€" + count + "/S");
}
function initGame() {
	getMoney();
	updateDisplay();
	makeGeneratorList();
	setInterval(activateGen, generatorSeconds*1000);
	setInterval(updateDisplay, (displaySeconds*1000)/10);
	setInterval(setCookie, cookieSeconds*1000);
}