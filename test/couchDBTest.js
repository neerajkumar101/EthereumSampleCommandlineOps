var assert = require('assert');
var couchUtil = require('../app/couchFunctions.js');

var dbInfoJson = require('../app/dbinfo.json');

// Tests are hierarchical. Here we define a test suite for our calculator.
describe('DB Connection Test', function() {
	
	var couchdb = couchUtil.AuthenticateCouchAccess('admin', 'oodles');
	var dbName = dbInfoJson[0].dbInfo.dbName;
	var docId;
	var insertedDocId ;
	var insertDocRev;
	
	it('Json read test', (done) => {
		assert.equal(dbInfoJson[0].dbInfo.dbName, 'contract_info_db');
		done();
	});

	it('1. conntection with couchDB', async() => {
		var check = await couchUtil.AuthenticateCouchAccess('admin', 'oodles')._cache;
		assert.equal(check, null);
	});

	// And then we describe our testcases.
	it('2. A test QueryingCouchDB with mongoDB', async() => {
			const mangoQuery = {
				selector: {
					"_id" : dbInfoJson[0].dbInfo.document.docId  
				}
			};
			const parameters = {};
		var data = await couchUtil.mongoQueryCouchDB(couchdb, dbName, mangoQuery, parameters);
		assert.equal(data.docs[0].contract_checksum_address, dbInfoJson[0].dbInfo.document.contractChecksumAddress);
	});

	it('3. checkCouch test couchDB', async() => {
		rowsData = await couchUtil.checkCouch();
		docId = rowsData[0].id;
		assert.equal(docId, dbInfoJson[0].dbInfo.document.docId);
	});
	it('4. Test for getting data by id couchDB', async() => {
		var data = await couchUtil.promiseCouchDocById(docId);
		var contractAddress = data.docs[0].contract_checksum_address;
		assert.equal(contractAddress, '0xc7223364cb2c1a9230c0815160a54a1c36f19041');
	});
	it('5. inserting into couchDB', async() => {
		var inserted = await couchUtil.insertIntoCouch(couchdb, dbName, dbInfoJson[0].dbInfo.document.contractChecksumAddress, dbInfoJson[0].dbInfo.contractCreationHash);
		insertedDocId = inserted['data'].id;
		insertDocRev = inserted['data'].rev;
		assert.equal(inserted['data'].ok, true);
	});
	it('6. deleting from couchDB', async() => {
		var deleted = await couchUtil.deleteDocFromCouch(couchdb, dbName, insertedDocId, insertDocRev);
		assert.equal(deleted['data'].ok, true);
	});
});