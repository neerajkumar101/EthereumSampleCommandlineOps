const util = require('./newJs.js'); //also contains couchUtil

const accounts = util.web3.eth.accounts;
const sourceAccountAddress = accounts[0]; 
const targetAccountAddress = accounts[1];   //accounts[2]; has no password
const anySourceAccountAddress = accounts[2]; 
const tokenAmount = 1000;  //1,00,000

const sourceAccountPassword = 'oodles';

/**
 * A prommise which gives out an array of all accounts in the system
 * we use this array to set following:
 */
var contractSource = __dirname + '/contract/src/Token.sol';
var format = 'utf8';
var contractName = 'Token';
var constructorVar = {
        // owner: sourceAccountAddress,
        // name: "ScriptDrop Token",
        // decimals: 8,
        // symbol: "SDT",
    }

new Promise(function(resolve, reject){
    var promOb = util.deployNewSmartContract(
        contractSource,
        format,
        constructorVar,
        contractName,
        sourceAccountAddress, 
        sourceAccountPassword);

    promOb.then((contractInstance)=>{
        resolve(contractInstance);
    }).catch((error)=>{
        reject(error);
    });

}).then(function(contractInstance){
    // util.transferContractTokenFromAnySource( 
    //     sourceAccountAddress, 
    //     targetAccountAddress, 
    //     sourceAccountPassword, 
    //     tokenAmount,
    //     contractInstance
    // );
    console.log(contractInstance);
    //handling promise rejection
}).catch((error) => {
    console.log('error in Instantiating Smart Contract: ');
    console.log(error);
});
