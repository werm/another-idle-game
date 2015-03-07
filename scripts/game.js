var player = {
	"money": 0,
	"won": false
};
var generators = [];
var growthRate = 0.2;
var generatorTemplates = $.get("https://mysteriousmagenta.github.io/another-idle-game/JSON/generators.json", {}, function(data) {generatorTemplates = data;});


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
			player.money -= generatorTemplates[i].cost;
			generators.push(generatorTemplates[i]);
			generatorTemplates[i].cost = Math.floor(generatorTemplates[i].cost + generatorTemplates[i].cost * growthRate);
			makeGeneratorList();
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
	if (oldGenerators.length) {
		for (var i = 0; i < oldGenerators.length; i++) {
			var current = $(oldGenerators[i])
			if (current) {
				if (current.html() !== current.attr("name") && beingHovered === -1) {
					beingHovered = i;
				}
				current.remove();
			}
		};
	}
	for (var i = 0; i < generatorTemplates.length; i++) {
		var generator = generatorTemplates[i];
		var generatorObj = $('<li class="generator" name="'+ generator.name + '" cost="' + generator.cost + '" mps="'+ generator.mps + '">' + generator.name + "</li>")

		generatorObj.mouseenter(function() {
			var jThis = $(this);
			var newName = jThis.html();
			if (newName !== jThis.attr("name")) {
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
// Starts the game
function initGame() {
	makeGeneratorList();
	setInterval(activateGen, 1000);
	setInterval(updateDisplay, 100);
}

if (generatorTemplates) {
	window.onload = initGame;
}
else {
	alert("Wasn't able to get a valid JSON file, aborting!")
}