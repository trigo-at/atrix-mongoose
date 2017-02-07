'use strict';

const mongoose = require('mongoose');
const bb = require('bluebird');
const Grid = require('gridfs-stream');

mongoose.Promise = Promise;

const MAX_RETIRES = 1000;
const RETRY_DELAY = 1000;


class AtrixMongoose {
	constructor(atrix, service, config) {
		this.retries = {};
		this.atrix = atrix;
		this.service = service;
		this.log = this.service.log;
		this.config = config;
	}

	async start() {
		this.log.info('start connection', this.config);
		return this.connect();
	}

	async connect() {
		this.log.info('connect:', this.config);
		const connection = await this.connectPromise(this.config.connectionString); // eslint-disable-line
		const modelFactory = require(this.config.modelFactory); // eslint-disable-line
		const schema = modelFactory(mongoose, connection);
		return {
			mongoose,
			connection,
			schema,
			gridfs: new Grid(connection.db, mongoose.mongo),
		};
	}

	async connectPromise(connectionString) {
		if (this.retries[connectionString] === undefined) {
			this.retries[connectionString] = 0;
		}

		return new Promise((resolve, reject) => {
			if (!this.resolveConnectionPromise) {
				this.resolveConnectionPromise = resolve;
				this.rejectConnectionPromise = reject;
			}
			const options = {
				server: {
					socketOptions: {
						keepAlive: 1,
					},
				},
			};

			this.log.info(`Connect to db: ${connectionString}`);
			const connection = mongoose.createConnection(connectionString, options);
			connection.on('error', (err) => {
				this.log.error({
					err,
				}, 'Connection error to MongoDB.');
			});

			connection.on('open', () => {
				this.log.info(`Connection to MongoDB ${connectionString}  established.`);
				this.retries[connectionString] = 0;
				this.resolveConnectionPromise(connection);
			});

			connection.on('disconnected', async () => {
				this.log.error(`Connection to MongoDB lost.
					Reconnect retry: ${this.retries[connectionString]} to ${connectionString} in ${Math.abs(RETRY_DELAY / 1000)} seconds...`);
				if (this.retries[connectionString]++ <= MAX_RETIRES) {
					await bb.delay(RETRY_DELAY);
					this.connectPromise(connectionString);
				} else {
					this.rejectConnectionPromise(new Error(`Counld not reconnect to to MongoDB: ${connectionString}`));
				}
			});
		});
	}
}

module.exports = AtrixMongoose;
