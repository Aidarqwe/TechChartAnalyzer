// 	function getLevel(supportResistance, ind) {
// 		if (ind < supportResistance.length && supportResistance[ind] !== 0) {
// 			return supportResistance[ind];
// 		}
// 		return null;
// 	}
//
// 	function getColor(supportResistance, ind, close, resColor, supColor, inChannelColor) {
// 		if (ind < supportResistance.length && supportResistance[ind] !== 0) {
// 			if (supportResistance[ind] > close && supportResistance[ind + 1] > close) {
// 				return resColor;
// 			} else if (supportResistance[ind] < close && supportResistance[ind + 1] < close) {
// 				return supColor;
// 			} else {
// 				return inChannelColor;
// 			}
// 		}
// 		return null;
// 	}
//
// 	const resistanceColor = "red";
// 	const supportColor = "green";
// 	const inChannelColor = "yellow";
// 	const channels = [];
//
// 	let resistanceBroken = false;
// 	let supportBroken = false;
// 	let notInAChannel = true;
//
// 	for (let x = 0; x <= Math.min(9, maxNumSR); x++) {
// 		const srcol = getColor(supportResistance, x * 2, close, resistanceColor, supportColor, inChannelColor);
// 		const top = getLevel(supportResistance, x * 2);
// 		const bottom = getLevel(supportResistance, x * 2 + 1);
// 		if (srcol !== null) {
// 			channels.push({
// 				top,
// 				bottom,
// 				color: srcol,
// 			});
//
// 			if (notInAChannel) {
// 				if (close <= supportResistance[x * 2] && close >= supportResistance[x * 2 + 1]) {
// 					notInAChannel = false;
// 				}
// 			}
//
// 			if (notInAChannel) {
// 				if (close > supportResistance[x * 2]) {
// 					resistanceBroken = true;
// 				}
// 				if (close < supportResistance[x * 2 + 1]) {
// 					supportBroken = true;
// 				}
// 			}
// 		}
// 	}
//
// 	console.log({channels, resistanceBroken, supportBroken, notInAChannel});
//
//
// 	return {phRes, plRes};
//
// }
//
// module.exports = findLevel;
//


const findPivotHighLow = require("./findHighLow");

const prd = 10;
const channelWidth = 5;
const minStrength = 1;
const loopBack = 290;

function getSRValues(pivotIndex, pivotVals, cWidth) {
	let lo = pivotVals[pivotIndex];
	let hi = lo;
	let numpp = 0;

	for (let y = 0; y < pivotVals.length; y++) {
		let cpp = pivotVals[y];
		let wdth = cpp <= hi ? hi - cpp : cpp - lo;

		if (wdth <= cWidth) {
			if (cpp <= hi) {
				lo = Math.min(lo, cpp);
			} else {
				hi = Math.max(hi, cpp);
			}
			numpp += 20;
		}
	}

	return [hi, lo, numpp];
}

function getStrongestSRLevels(pivotVals, high, low, minStrength, loopBack, cWidth) {
	let supRes = [];

	for (let x = 0; x < pivotVals.length; x++) {
		let [hi, lo, strength] = getSRValues(x, pivotVals, cWidth);
		supRes.push({ hi, lo, strength: strength });
	}

	supRes.forEach(sr => {
		let s = 0;
		for (let y = 0; y < loopBack && y < high.length; y++) {
			if ((high[y] <= sr.hi && high[y] >= sr.lo) || (low[y] <= sr.hi && low[y] >= sr.lo)) {
				s += 1;
			}
		}
		sr.strength += s;
	});

	let strongSR = supRes.filter(sr => sr.strength >= minStrength * 20).sort((a, b) => b.strength - a.strength);
	strongSR = removeDuplicateSRLevels(strongSR);

	return strongSR;
}

function removeDuplicateSRLevels(supRes, tolerance = 0.001) {
	let uniqueSR = [];

	supRes.forEach(sr => {
		let isDuplicate = uniqueSR.some(us => {
			return Math.abs(us.hi - sr.hi) <= tolerance && Math.abs(us.lo - sr.lo) <= tolerance;
		});

		if (!isDuplicate) {
			uniqueSR.push(sr);
		}
	});

	return uniqueSR;
}

function findLevel(high, low, close){
	const phRes = findPivotHighLow(high, prd, "highType");
	const plRes = findPivotHighLow(low, prd, "lowType");

	const prdHighest = Math.max(...high);
	const prdLowest = Math.min(...low);
	const cWidth = (prdHighest - prdLowest) * channelWidth / 100;

	const pivotValues = phRes.phValues.concat(plRes.plValues);

	const supportResistance = getStrongestSRLevels(pivotValues, high, low, minStrength, loopBack, cWidth);

	return supportResistance ;
}

// дальше надо сделать логику с close
// tradingView [175:186]

module.exports = findLevel;