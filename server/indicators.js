const tulind = require("tulind");

async function calculateIndicators(close, high, low, volume) {
	return new Promise(async (resolve, reject) => {
		try {
			const rsiResponse = await calculateRSI(close, 14);
			const macdResponse = await calculateMACD(close, [12, 26, 9] );
			const momResponse = await calculateMomentum(close, 10);
			const cciResponse = await calculateCCI([high, low, close], 10);
			const stochResponse = await calculateStoch([high, low, close], [14, 1, 1], 3);
			const vwmacdResponse = await calculateVWMA(close, volume, 12, 26);
			const cmfResponse = await calculateCMF(high, low, close, volume, 21);
			const mfiResponse = await calculateMFI([high, low, close, volume], 14);

			resolve({
				rsi: rsiResponse,
				macd: macdResponse,
				momentum: momResponse,
				cci: cciResponse,
				stoch: stochResponse,
				vwmacd: vwmacdResponse,
				cmf: cmfResponse,
				mfi: mfiResponse,
			});
		} catch (error) {
			reject(error);
		}
	});
}

async function calculateRSI(source, period) {
	return new Promise((resolve, reject) => {
		tulind.indicators.rsi.indicator([source], [period], (err, response) => {
			if (err) {
				reject(err);
			} else {
				resolve({
					name: "RSI",
					data: response[0],
					baseLine: [20, 50, 70]
				});
			}
		});
	});
}

async function calculateMACD(source, period) {
	return new Promise((resolve, reject) => {
		tulind.indicators.macd.indicator([source], period, (err, response) => {
			if (err) {
				reject(err);
			} else {
				resolve({
					name: "MACD",
					data: response,
					baseLine: [0]
				})
			}
		});
	});
}      //   +-10

async function calculateMomentum(source, period) {
	return new Promise((resolve, reject) => {
		tulind.indicators.mom.indicator([source], [period], (err, response) => {
			if (err) {
				reject(err);
			} else {
				resolve({
					name: "MOM",
					data: response[0],
					baseLine: [0]
				})
			}
		});
	});
}

async function calculateCCI(source, period) {
	return new Promise((resolve, reject) => {
		tulind.indicators.cci.indicator(source, [period], (err, response) => {
			if (err) {
				reject(err);
			} else {
				resolve({
					name: "CCI",
					data: response[0],
					baseLine: [-100, 0, 100]
				})
			}
		});
	});
}

async function calculateStoch(source, period, smaPeriod) {
	return new Promise((resolve, reject) => {
		tulind.indicators.stoch.indicator(source, period, (err, response) => {
			tulind.indicators.sma.indicator([response[0]], [smaPeriod], (err, response) => {
				if (err) {
					reject(err);
				} else {
					resolve({
						name: "Stoch",
						data: response[0],
						baseLine: [20, 50, 80]
					})
				}
			})
		});
	});
}

async function calculateVWMA(source, volume, periodFast, periodSlow) {
	try {
		const maFastResponse = await new Promise((resolve, reject) => {
			tulind.indicators.vwma.indicator([source, volume], [periodFast], (err, response) => {
				if (err) {
					reject(err);
				} else {
					resolve(response);
				}
			});
		});

		const maSlowResponse = await new Promise((resolve, reject) => {
			tulind.indicators.vwma.indicator([source, volume], [periodSlow], (err, response) => {
				if (err) {
					reject(err);
				} else {
					resolve(response);
				}
			});
		});

		const maFast = maFastResponse[0].reverse();
		const maSlow = maSlowResponse[0].reverse();

		return {
			name: "VWMA",
			data: maFast.map((value, index) => value - maSlow[index]),
			baseLine: []
		}
	} catch (error) {
		throw error;
	}
}

async function calculateCMF(high, low, close, volume, period) {

	const cmfm = close.map((value, index) => ((value - low[index]) - (high[index] - value)) / (high[index] - low[index]));
	const cmfv = cmfm.map((value, index) => value * volume[index]);

	try {
		const smaCMFVResponse = await new Promise((resolve, reject) => {
			tulind.indicators.sma.indicator([cmfv], [period], (err, response) => {
				if (err) {
					reject(err);
				} else {
					resolve(response[0]);
				}
			});
		});

		const smaVolumeResponse = await new Promise((resolve, reject) => {
			tulind.indicators.sma.indicator([volume], [period], (err, response) => {
				if (err) {
					reject(err);
				} else {
					resolve(response[0]);
				}
			});
		});

		return {
			name: "CMF",
			data: smaCMFVResponse.map((value, index) => value / smaVolumeResponse[index]),
			baseLine: [0]
		}
	} catch (error) {
		throw error;
	}
}

async function calculateMFI(source, period) {
	return new Promise((resolve, reject) => {
		tulind.indicators.mfi.indicator(source, [period], (err, response) => {
			if (err) {
				reject(err);
			} else {
				resolve({
					name: "MFI",
					data: response[0],
					baseLine: [20, 50, 80]
				})
			}
		});
	});
}


module.exports = calculateIndicators;