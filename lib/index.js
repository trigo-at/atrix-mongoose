const pkg = require('../package.json');

const AtrixMongoose = require('./AtrixMongoose');

module.exports = {
    name: pkg.name,
    version: pkg.version,
    register: () => {},
    factory: (atrix, service, config) => new AtrixMongoose(atrix, service, config),
    compatibility: {
        atrix: {
            min: '6.0.0-12',
        },
    },
};
