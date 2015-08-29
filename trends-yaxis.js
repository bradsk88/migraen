document.addEventListener("DOMContentLoaded", function() {
	addLogButton();
});


function addLogButton() {
	var container = document.getElementById("graph-container");
	if (!container) {
		setTimeout(addLogButton, 100);
		return;
	}
	var button = document.createElement("button");
	button.innerHTML = "Switch to logarithmic";
	button.onclick = function() {
		switchToLog(button);
	}
	container.appendChild(button);

}
var colorTimeout = 0;
var originalLabels = [];
var originalValues = [];

function switchToLog(button) {
	var labels = getYAxisLabels();
	if (!labels || labels.length == 0) {
		if (colorTimeout > 2000) {
			return;
		}
		colorTimeout = colorTimeout + 100;
		setTimeout(switchToLog, 100);
		return;
	}

	var i;
	var min = Number.MAX_VALUE;
	var max = -Number.MAX_VALUE;
	originalLabels = [];
	for (i=0; i < labels.length; i++) {
		var text = labels[i].textContent.replace(/\$|,/gi,'');
		originalLabels.push(labels[i].textContent);
		min = Math.min(min, text);
		max = Math.max(max, text);
	}

	var logValues = [];
	var distance = max - min;
	for (i=0; i < 10; i += 10/labels.length) {
		var logVal = Math.log(i+1) / Math.LN10;
		var amount = distance * logVal;
		logValues.push(Math.round(min + amount));
	}
	for (i=0; i < labels.length; i++) {
		labels[i].textContent = '$' + logValues[i];
	}
	
	getBars();	

	button.textContent = "Switch to linear";
	button.onclick = function() {
		button.textContent = "Switch to logarithmic";
		var labels = getYAxisLabels();
		var i;
		for (i=0; i < originalLabels.length; i++) {
			labels[i].textContent = originalLabels[i];
		}		
		button.onclick = function() {
			switchToLog(button);
		};

	}

	
	// TODO: Update bars
}

function getBars() {
	var axisLabels = [];
	var container = document.getElementById("graph-container");
	if (!container) {
		return [];
	}
	var graphics = container.getElementsByTagName("svg")
	if (!graphics || graphics.length == 0) {
		return [];
	}
	var graphic = graphics[0];
	
	var bars = graphic.getElementsByTagName("path");
	var k;

	var lines = bars[0].getAttribute('d');
	var linesD = lines.split('L');
	var topOfGraphY = linesD[linesD.length-1].split(',')[1];
	for (k=0; k < bars.length; k++) {

		var d = bars[k].getAttribute('d');
		var parts = d.split(',');
		var idx = parts[1].indexOf('V');
		if (idx < 0) { // Not a bar
			continue;
		}

		var theRest = d;

		var start = theRest.split('V')[0].replace('M','');
		var bottomOfGraphY = start.split(',')[1];
		theRest = theRest.split('V')[1] + "V" + theRest.split('V')[2];

		var topLeftX = start.split(',')[0];
		var topLeftY = theRest.split('A')[0];

		theRest = theRest.split('A')[1] + "A" + theRest.split('A')[2];
	
		var topTopY = theRest.split(',')[6];
		topTopY = topTopY.split('H')[0];

		var topLeftTopX = theRest.split(',')[5];
		theRest = theRest.split('H')[1]

		var topRightTopX = theRest.split('A')[0];
		theRest = theRest.split('A')[1]

		var topRightX = theRest.split(',')[5];
		var topRightY = theRest.split(',')[6].split('V')[0];

		var bottomRightX = theRest.split(',')[5];
		var bottomRightY = theRest.split('V')[1];
		
		var graphHeight = bottomOfGraphY - topOfGraphY;
		var barHeight = bottomRightY - topTopY;
		var barHeight10 = ((barHeight / graphHeight) * 9) + 1;
		var newBarHeight = (Math.log(barHeight10) / Math.LN10) * graphHeight;
		var extraHeight = newBarHeight - barHeight;
		
		var b = "M" + start + "V" + (topLeftY - extraHeight) + "A5,5,0,0,1," + topLeftTopX + "," + (topTopY - extraHeight) + 
				 "H" + topRightTopX + "A5,5,0,0,1," + topRightX + "," + (topRightY - extraHeight) + "V" + bottomRightY; 
		bars[k].setAttribute('d', b);		
		var debugHelper = "you're welcome";
	}	
}

function getYAxisLabels() {
	var axisLabels = [];
	var container = document.getElementById("graph-container");
	if (!container) {
		return [];
	}
	var graphics = container.getElementsByTagName("svg")
	if (!graphics || graphics.length == 0) {
		return [];
	}
	var graphic = graphics[0];
	
	var texts = graphic.getElementsByTagName("text");
	var k;
	for (k=0; k < texts.length; k++) {
		var text = texts[k];
		if (text.textContent[0] == "$") {
			axisLabels.push(text);
		}
	}
	return axisLabels;
}
