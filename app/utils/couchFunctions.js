/****************************************************************************************************
 * CouchDB Utility Methods
 ***************************************************************************************************/
var NodeCouchDb = require('node-couchdb');
const COUCHADMIN = 'admin';
const COUCHADMINPASSPHRASE = 'oodles'; 
/**
 * 
 * @param {string} userAdmin 
 * @param {string} passphrase 
 */
var AuthenticateCouchAccess = function(userAdmin, passphrase){
    var couchAuthInstance = new NodeCouchDb({
        host: 'localhost',
        protocol: 'http',
        port: 5984,
        auth: {
            user: userAdmin,
            pass: passphrase
        }
     });
     return couchAuthInstance;
 }
 
 /**
  * 
  * @param {string} contractAddress 
  * @param {string} conractCreationHash 
  */
 var saveToCouch = function(contractAddress,conractCreationHash){
 
    var couchdb = AuthenticateCouchAccess(COUCHADMIN, COUCHADMINPASSPHRASE);
    
     if(couchdb != null){
        var parametersObject= {}
        var insertProm = insertIntoCouch(couchdb, "contract_info_db", contractAddress, conractCreationHash);
        insertProm.then((responseArray)=>{
            // data is json response 
            console.log('data is: ');            
            console.log(responseArray.data);
            // headers is an object with all response headers 
            console.log('header is: ');            
            console.log(responseArray.headers);
            // status is statusCode number 
            console.log('status is: '+responseArray.status);
        })
        .catch((error)=>{
            // either request error occured 
            // ...or err.code=EDOCCONFLICT if document with the same id already exists 
            console.log('couch insert error is here');
            console.log(error);
        });
         
     }
 }
 
 /**
  * 
  */
 var checkCouch = function(){
    var returnOb;
 
    var returnProm = new Promise((resolve, reject) => {
 
        var couchdb = AuthenticateCouchAccess(COUCHADMIN, COUCHADMINPASSPHRASE);
 
         if(couchdb != null){
            const dbName = "contract_info_db";
            const viewUrl = "_design/contractDesignDoc/_view/new-view";
             
            const queryOptions = {
                // startKey,
                // endKey
            };
             
            getCouchDataByView(couchdb, dbName, viewUrl, queryOptions)
                .then((rowsObject)=>{
                    resolve(rowsObject);
                }).catch((error)=>{
                    reject(error);
                });
        }
    });
    return returnProm;
 }
 
 /**
  * 
  * @param {string} docId 
  */
 var promiseCouchDocById = function(docId){
    var returnProm = new Promise((resolve, reject) => {
 
        var couchdb = AuthenticateCouchAccess(COUCHADMIN, COUCHADMINPASSPHRASE);
 
         if(couchdb != null){
            const dbName = "contract_info_db";
            const mangoQuery = {
                selector: {
                    "_id" : docId  
                }
            };
            const parameters = {};
            
            mongoQueryCouchDB(couchdb, dbName, mangoQuery, parameters)
                .then((data)=>{
                    resolve(data);
                })
                .catch((error)=>{
                    reject(error);
                });
            
        }
    });
    return returnProm;
 }
var deleteDocFromCouch = (couchdb, dbName, docId, docRev) => {
    return new Promise((resolve, reject) => {
        couchdb.del(dbName, docId, docRev).then(({data, headers, status}) => {
            // data is json response 
            // headers is an object with all response headers 
            // status is statusCode number 
            var responseArray = [];            
            responseArray.data = data;
            responseArray.headers = headers;            
            responseArray.status = status;
            resolve(responseArray);
        }, err => {
            // either request error occured 
            // ...or err.code=EDOCMISSING if document does not exist 
            // ...or err.code=EUNKNOWN if response status code is unexpected 
            reject(error);
        });
    })
}
 var insertIntoCouch = (couchdb, dbName, contractAddress, conractCreationHash)=>{
    return new Promise((resolve, reject)=>{
        couchdb.insert(dbName, {
            contract_checksum_address: contractAddress,
            contract_creation_hash: conractCreationHash
        }).then(({data, headers, status}) => {
            
            var responseArray = [];            
            responseArray.data = data;
            responseArray.headers = headers;            
            responseArray.status = status;
            resolve(responseArray);
        }, error => {
            reject(error);
        });
    });
 }
 /**
  * queries couch db providing name of database, mongoQuery and parameters
  * @param {*} couchdb 
  * @param {*} dbName 
  * @param {*} mangoQuery 
  * @param {*} parameters 
  */
var mongoQueryCouchDB = (couchdb, dbName, mangoQuery, parameters)=>{
    return new Promise((resolve, reject)=>{
        couchdb.mango(dbName, mangoQuery, parameters).then(({data, headers, status}) => {
            // data is json response 
            console.log(data);
            resolve(data);
            // headers is an object with all response headers 
            // status is statusCode number 
        }, error => {
            // either request error occured 
            // ...or err.code=EDOCMISSING if document is missing 
            // ...or err.code=EUNKNOWN if statusCode is unexpected 
             console.log('mongo query error is here');
            console.log(error);
            reject(error);
        });
    });
}

var getCouchDataByView = (couchdb, dbName, viewUrl, queryOptions)=>{
    return new Promise((resolve, reject)=>{
        couchdb.get(dbName, viewUrl, queryOptions).then(({data, headers, status}) => {
            // data is json response 
            var rowsObject = data.rows;                
            resolve(rowsObject);
            // headers is an object with all response headers 
            // status is statusCode number 
        }, error => {
            // either request error occured 
            // ...or err.code=EDOCMISSING if document is missing 
            // ...or err.code=EUNKNOWN if statusCode is unexpected

            console.log('couch get error is here');
            console.log(error); 
            reject(error);
        });
    });
}



 module.exports = {
    COUCHADMIN ,
    COUCHADMINPASSPHRASE,
    AuthenticateCouchAccess : AuthenticateCouchAccess,
    saveToCouch : saveToCouch,
    checkCouch : checkCouch,
    promiseCouchDocById : promiseCouchDocById,
    mongoQueryCouchDB,
    insertIntoCouch,
    deleteDocFromCouch
}