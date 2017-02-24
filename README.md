
[![Greenkeeper badge](https://badges.greenkeeper.io/trigo-at/atrix-mongoose.svg?token=ae8a63062557b75372fcca4783b39d76b88315b19073a3a99ab1628ee0a3f731)](https://greenkeeper.io/) 
[![NSP Status](https://nodesecurity.io/orgs/trigo-gmbh/projects/b7a1970f-96b8-482f-b7a3-4ddaefa54929/badge)](https://nodesecurity.io/orgs/trigo-gmbh/projects/b7a1970f-96b8-482f-b7a3-4ddaefa54929)

# atrix-mongoose
## mongoose plugin for atrix microservice framework

atrix manoggose plugin automaticaly sets up the connection to you mongo db using monggose models

## Features
* configuration driven
* multi connection/database mgmt
* GridFs (gridfs-stream) intigration

## Installation

```bash
# install atrix framework
npm install -S @trigo/atrix

# install atrix-mongoose plugin
npm install -S @trigo/atrix-mongoose

# No need to install mongoose itself!
```

## Usage & Configuration
### models/TestModel.js
```javascript

'use strict';

// ATTENTION: Do not require mongoose here!

module.exports = (mongoose) => {
	return new mongoose.Schema({
		name: {
			type: 'string'
		}
	});
}
```

### models/factory.js
```javascript

'use strict';

// ATTENTION: Do not require mongoose here!

module.exports = (mongoose, connection) => {
	return {
		TestModel: connection.model('TestModel', require('./TestModel')(mongoose)),
	};
}
```

### handlers/GET.js
```javascript
module.exports = (req, reply, service) => {
	// access model class for connection "m1"
	const TestModel_C1 = service.dataConnections.m1.schema.TestModel;
	
	// access GridFs (gridfs-stream) for connection "m1"
	const GridFs_C1 = service.dataConnections.m1.gridfs;
	
	// access the mongoose connection object for connection "m1"
	const Connection_C1 = service.dataConnections.m1.connection;
	
	// access the mongoose object (shared between all connections)
	const mongoose = service.dataConnections.m1.mongoose;
	
	// get model class for connection "m2" 
	const TestModel_C2 = service.dataConnections.m2.schema.TestModel;
	...
}
```

### index.js
```javascript
'use strict';

const atrix = require('@trigo/atrix');
const path = require('path');

const svc = new atrix.Service('mongoose', {
	endpoints: {
		http: {
			// declare port to bind
      port: 3007,

      // the directory containing the handler files
      handlerDir: `${__dirname}/handlers`,
   	},
  },
	// declare a dataSource config section
	dataSource: {
		// name of the data source
		m1: {
			// type of data connection
			type: 'mongoose',
			// connection configuration
			config: {
				// path to the model factory module to be required by the plugin
				modelFactory: path.join(__dirname, './models/factory'),
				
				// database connection string
				connectionString: 'localhost:27017/test-atrix-mongoose-m1',
			},
		},
		m2: {
			type: 'mongoose',
			config: {
				modelFactory: path.join(__dirname, './models/factory'),
				connectionString: 'localhost:27017/test-atrix-mongoose-m2',
			},
		},
	},
});

// register service in atrix
atrix.addService(svc);

// setup http endpoint
svc.endpoints.add('http');

// start service. 
// This will wait for the mongo connection to be available before starting up. 
// When conection(s) is lost after initial startup the plugin automatically tries to reconnect  
svc.start();
```

Run service with ```node index.js```

## Common issues

If you installed mongoose itself and your code requires it somewhere before the plugin is loaded, you have a good chance to break connection & model setup. **Do not install mongoose itself!**. If unsure simply run ```npm remove -S mongoose``` in your application root folder.

