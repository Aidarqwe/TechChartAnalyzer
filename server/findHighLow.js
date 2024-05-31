function findPivotHighLow(data, period, type){
	const phPositions = [];
	const plPositions = [];
	const phValues = [];
	const plValues = [];

	for (let i = 0; i <= data.length; i++) {
		const currentHigh = data[i];
		if (
			data.slice(i - period, i).every(value => currentHigh > value) &&
			data.slice(i + 1, i + period + 1).every(value => currentHigh > value)
		) {
			phPositions.push(i);
			phValues.push(currentHigh);
		}

		const currentLow = data[i];

		if (
			data.slice(i - period, i).every(value => currentLow < value) &&
			data.slice(i + 1, i + period + 1).every(value => currentLow < value)
		) {
			plPositions.push(i);
			plValues.push(currentLow);
		}
	}
	if(type === "highType"){
		return { phPositions, phValues};
	}else if(type === "lowType"){
		return { plPositions, plValues};
	}else{
		return {phPositions, phValues, plPositions, plValues};
	}
}

module.exports = findPivotHighLow;