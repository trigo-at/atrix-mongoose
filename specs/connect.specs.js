'use strict';

/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0, arrow-body-style: 0 */

const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
require('./service');
const atrix = require('@trigo/atrix');

describe('loads datasources into service', () => {
	beforeEach(async () => {
		await atrix.services.mongoose.start();
	});

	afterEach(async () => {
		const M1TestModel = atrix.services.mongoose.dataConnections.m1.schema.TestModel;
		const M2TestModel = atrix.services.mongoose.dataConnections.m2.schema.TestModel;

		await M1TestModel.remove({});
		await M2TestModel.remove({});
	});

	it('connect all and expose as service.dataConnections', async () => {
		expect(atrix.services.mongoose.dataConnections.m1).to.be.an('object');
		expect(atrix.services.mongoose.dataConnections.m2).to.be.an('object');
	});

	it('expose "schema" object', async () => {
		expect(atrix.services.mongoose.dataConnections.m1.schema).to.be.an('object');
		expect(atrix.services.mongoose.dataConnections.m1.schema).to.be.an('object');
	});

	it('expose "grifs" object', async () => {
		expect(atrix.services.mongoose.dataConnections.m1.gridfs).to.be.an('object');
		expect(atrix.services.mongoose.dataConnections.m1.gridfs).to.be.an('object');
	});

	it('can write to gridFs', async () => {
		const f = await new Promise((resolve, reject) => {
			const ws = atrix.services.mongoose.dataConnections.m1.gridfs.createWriteStream({
				_id: 'test',
				filename: 'alien_by_delun.jpg',
			});
			fs.createReadStream(path.join(__dirname, './alien_by_delun.jpg')).pipe(ws);
			ws.on('close', (file) => {
				resolve(file);
			});
			ws.on('error', (err) => {
				reject(err);
			});
		});

		expect(f._id).to.equal('test');
		expect(f.filename).to.equal('alien_by_delun.jpg');
	});

	it('Models are bound to the connections', async () => {
		const M1TestModel = atrix.services.mongoose.dataConnections.m1.schema.TestModel;
		const M2TestModel = atrix.services.mongoose.dataConnections.m2.schema.TestModel;

		await new M1TestModel({
			name: 'm1',
		}).save();
		await new M2TestModel({
			name: 'm2',
		}).save();

		const m1Data = await M1TestModel.find({}).lean();
		expect(m1Data.length).to.equal(1);
		expect(m1Data[0].name).to.equal('m1');
		const m2Data = await M2TestModel.find({}).lean();
		expect(m2Data.length).to.equal(1);
		expect(m2Data[0].name).to.equal('m2');
	});

	it('expose "connection" object', async () => {
		expect(atrix.services.mongoose.dataConnections.m1.connection).to.be.an('object');
		expect(atrix.services.mongoose.dataConnections.m2.connection).to.be.an('object');
	});

	it('expose "mongoose"', async () => {
		expect(atrix.services.mongoose.dataConnections.m1.mongoose).to.be.an('object');
		expect(atrix.services.mongoose.dataConnections.m2.mongoose).to.be.an('object');
	});
});

