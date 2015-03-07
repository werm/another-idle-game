var player = {
	"money": 0
}
var generators = []
var generatorTemplates = [
	{"name": "My First Generator", "mps": 1, "cost": 10},
	{"name": "Better Faster Harder Generator", "mps": 10, "cost": 75},
	{"name": "STL Generator", "mps": 100, "cost": 500},
	{"name": "Slightly Less STL Generator", "mps": 250, "cost": 750},
	{"name": "Steampunk Generator", "mps": 1000, "cost": 1250}
]

// Helper Functions
function addMoney(amount) {
	if (amount === undefined || amount === null) {
		amount = 1
	}
	player.money += amount;
}

function makeGenerator(name, mps, cost) {
	if (player.money >= cost) {
		var newGenerator = {}
		newGenerator.name = name
		newGenerator.mps = mps
		newGenerator.increment = function() {
			addMoney(this.mps)
		}
		generators.push(newGenerator);
		player.money -= cost;
	}
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
	if (oldGenerators.length) {
		for (var i = 0; i < oldGenerators.length; i++) {
			var current = $(oldGenerators[i])
			if (current) {
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
			newName += " [€" + jThis.attr("cost") + "]";
			newName += " [€" + jThis.attr("mps") + "/S]";
			newName += " [" + countGenerators(jThis.attr("name")) + "]"
			jThis.html(newName);
		});
		generatorObj.mouseleave(function() {
			var jThis = $(this);
			jThis.html(jThis.attr("name"));
		});
		generatorObj.click(function() {
				var jThis = $(this);
				makeGenerator(jThis.attr("name"), +jThis.attr("mps"), +jThis.attr("cost"));
				jThis.mouseleave();
				jThis.mouseenter();
		});
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


window.onload = initGame;