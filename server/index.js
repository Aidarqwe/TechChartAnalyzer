const express = require('express');
const cors = require("cors");
const bodyParser = require("express");
const Binance = require('binance-api-node').default;
const calculateIndicators = require("./indicators");
const findLevel = require('./findLevel');


const port = 5000;

const app = express();
const client = Binance();

app.use(cors());
app.use(bodyParser.json());

let currencyPair = "BTCUSDT";
let intervalData = "1h";




const getPrice = async () => {
	try {
		return await client.futuresPrices({ symbol: currencyPair});
	} catch (error) {
		console.log(error);
		throw error;
	}
};
const getCandleData = async (interval) => {
	try {
		return await client.futuresCandles({ symbol: currencyPair, interval: interval, limit: 300 });
	} catch (error) {
		console.log(error);
		throw error;
	}
};

const getOrderBook = async () => {
	try {
		return await client.futuresBook({ symbol: currencyPair, limit: 1000 });
	} catch (error) {
		console.log(error);
		throw error;
	}
};




app.get('/indicators', async (req, res) => {

	const candlesInfo = await getCandleData(intervalData)
	const open = candlesInfo.map(d => parseFloat(d["open"]));
	const high = candlesInfo.map(d => parseFloat(d["high"]));
	const low = candlesInfo.map(d => parseFloat(d["low"]));
	const close = candlesInfo.map(d => parseFloat(d["close"]));
	const volume = candlesInfo.map(d => parseFloat(d["volume"]));


	const indicators = await calculateIndicators(close, high, low, volume, intervalData);
	res.send(indicators)

});

app.get("/getPrice", async (req, res) => {
	try{
		const data = await getPrice();
		res.send(data)

	}catch (error){
		console.log(error)
	}

})

app.get("/orderbook", async (req, res) => {
	try{
		const data = await getOrderBook();
		res.send(data)

	}catch (error){
		console.log(error)
	}

})


app.get("/channels", async (req, res) => {
	try {
		const candlesInfo = await getCandleData(intervalData)
		const high = candlesInfo.map(d => parseFloat(d["high"]));
		const low = candlesInfo.map(d => parseFloat(d["low"]));
		const close = candlesInfo.map(d => parseFloat(d["close"]));
		const data = findLevel(high, low, close);
		res.send(data);
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
})

app.post('/interval', async (req, res) => {
	const { interval } = req.body;
	if (interval) {
		try {

			intervalData = interval;

			const newCandleData = await getCandleData(interval);

			res.send({ candlesInfo: newCandleData,});
		} catch (error) {
			res.status(500).send('Internal Server Error');
		}
	} else {
		res.status(400).send('Invalid interval');
	}
});


app.listen(port, () => {
	console.log(`Сервер запущен на http://localhost:${port}`);
});