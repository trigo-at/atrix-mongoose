'use strict';

const atrix = require('@trigo/atrix');
const path = require('path');

atrix.configure({ pluginMap: { mongoose: path.join(__dirname, '../') } });

const mongoDb = process.env.MONGO_SRV || 'localhost:27017';

const svc = new atrix.Service('mongoose', {
	dataSource: {
		m1: {
			type: 'mongoose',
			config: {
				modelFactory: path.join(__dirname, './models/factory'),
				connectionString: `${mongoDb}/test-atrix-mongoose-m1`,
			},
		},
		m2: {
			type: 'mongoose',
			config: {
				modelFactory: path.join(__dirname, './models/factory'),
				connectionString: `${mongoDb}/test-atrix-mongoose-m2`,
			},
		},
	},
});
atrix.addService(svc);

