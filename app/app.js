const util = require('./functions.js'); //also contains couchUtil

const accounts = util.web3.eth.accounts;
const sourceAccountAddress = accounts[0]; 
const targetAccountAddress = accounts[1];   //accounts[2]; has no password
const anySourceAccountAddress = accounts[4]; 
const tokenAmount = 1000;  //1,00,000

const sourceAccountPassword = 'oodles';

/**
 * A prommise which gives out an array of all accounts in the system
 * we use this array to set following:
 */
new Promise(function(resolve, reject){
    var promiseRecieved = util.couchUtil.checkCouch();
    promiseRecieved.then(function(rows){
        if(rows[0] == undefined){
            var promOb = util.deployNewSmartContract(
                sourceAccountAddress, 
                sourceAccountPassword);

            promOb.then((contractInstance)=>{
                resolve(contractInstance);
            }).catch((error)=>{
                reject(error);
            });
        } else {
            var docId = rows[0].id;
            var promiseOb = util.couchUtil.promiseCouchDocById(docId);

            promiseOb.then(function(data){
                var smartContractDoc = data.docs[0];
                var smartContractAddress = smartContractDoc.contract_checksum_address;
    
                var retProm = util.deployExistingSmartContract(smartContractAddress);
                retProm.then( (contractInstance) => {
                    resolve(contractInstance);
                }).catch( (error) => {
                    reject(error);
                });
            });
        }    
        //handling the promise rejection
    }).catch((error) => {
        console.log('couchDB access error: ' + error);
    });
}).then(function(contractInstance){
    util.transferContractTokenFromAnySource( 
        anySourceAccountAddress, 
        targetAccountAddress, 
        sourceAccountPassword, 
        tokenAmount,
        contractInstance
    );
    //handling promise rejection
}).catch((error) => {
    console.log('error in Instantiating Smart Contract: ');
    console.log(error);
});
