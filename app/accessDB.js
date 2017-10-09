const NodeCouchDb = require('node-couchdb');


const smartContractAddress = '0x4ef67477cb1bbe47d607fdfc15fb24ad222a9aeb';

// not admin party 
var saveToCouch = function(contractAddress){
    var NodeCouchDb = require('node-couchdb');

    var couchdb = new NodeCouchDb({
        auth: {
            user: 'admin',
            pass: 'oodles'
        }
     });
     if(couchdb != null){
         couchdb.listDatabases().then(dbs => console.log(dbs), err => {
             console.log(err);
         });
         // couchdb.insert("sampledb", {
         //     _id: "f9669f802226cbfa81f20e80ee000631",
         //     field: ["contract_checksum_address", smartContractAddress, true]
         // }).then(({data, headers, status}) => {
         //     // data is json response 
         //     console.log(data);
         //     // headers is an object with all response headers 
         //     console.log(headers);
         //     // status is statusCode number 
         //     console.log(status);
         // }, err => {
         //     // either request error occured 
         //     console.log(err);
         //     // ...or err.code=EDOCCONFLICT if document with the same id already exists 
         // });
     
            // note that "doc" must have both "_id" and "_rev" fields 
         couchdb.update("sampledb", {
             _id: "f9669f802226cbfa81f20e80ee000631",
             _rev: "7-536a541c08ae3bcab1911cb91035ca1c",
             contract_checksum_address: contractAddress
         }).then(({data, headers, status}) => {
             // data is json response 
             console.log(data);
             // headers is an object with all response headers 
             console.log(headers);
             // status is statusCode number 
             console.log(status);
         }, err => {
             // either request error occured 
             // ...or err.code=EDOCCONFLICT if document with the same id already exists 
             console.log(err);
         });

     }
 }(smartContractAddress);