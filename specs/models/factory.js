module.exports = (mongoose, connection) => {
	const TestModel = new mongoose.Schema({
		name: String,
	});

	return { TestModel: connection.model('TestModel', TestModel) };
};
