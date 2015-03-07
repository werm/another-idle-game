var moneyLimit = 100000000  //Small limit for now
var player = {
	"money": 0,

}
var generators = []

function gameWon() {
	console.log("Game won.");
}


function addMoney(amount) {
	if (amount === undefined || amount === null) {
		amount = 1
	}
	player.money += amount;
	if (player.money > moneyLimit) {
		gameWon();
	}
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

function activateGen() {
	var generator;
	for (var i=0; i < generators.length; i++) {
		generator = generators[i]
		generator.increment();
	}
}

function updateDisplay() {
	var display = document.getElementById("display");
	display.innerText = "€" + player.money;
	var persecond = document.getElementById("mps");
	var total = 0;
	for (var i = 0; i < generators.length; i++) {
		total += generators[i].mps;
	};
	persecond.innerText = "€" + total + "/S";
}

function initGame() {
	setInterval(activateGen, 1000);
	setInterval(updateDisplay, 100);
}

window.onload = initGame;