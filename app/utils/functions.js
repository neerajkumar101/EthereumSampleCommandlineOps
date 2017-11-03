var Web3 = require('web3');
var fs = require('fs');
var couchUtil = require('./couchFunctions.js');


var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

// const smartContractAddress = '0x71AeD59C02bB6004E554B1091A79B2eE05cFb1AB';  //old one build with mist
const amountValue = 1000;

/****************************************************************************************************
 * Random Utility Methods
 ***************************************************************************************************/

 /**
 * 
 * @param {any} fs 
 * @param {string} location 
 * @param {string} format 
 */
var fileStreamRead = (fs, location, format) => {
    return new Promise( (resolve, reject) => {
        fs.readFile(location, format, function(error, readData) {
            if (error) {
                console.log("error in reading file: ", error);
                reject(error);
                // return;
            } else {
                resolve(readData);
            }
        });
    });
}
/**
 * 
 * @param {locationn} location 
 * @param {any} jsonData 
 * @param {string} format 
 */
var fileStreamWriteJson = (fs, location, jsonData, format) => {
    return new Promise( (resolve, reject) => {
        fs.writeFile(location, jsonData, format, function(error, success){
            if (error) {
                reject(error);
                return;
            } else {
                resolve('abi is successfully written to the json file');
            }
        });
    });
}

// var readContractSourceBuildInitial = (fs, location, format, contractName) => {
var readContractSourceBuildInitial = (fs, compiledContract, contractName) => {
    
    return new Promise( (resolve, reject) => {

        // fileStreamRead(fs, location, format)
        //     .then((solidityCode)=>{
        //         var solc=require('solc');
                
        //         var compiled = solc.compile(solidityCode, 1);
        //         // var abi = JSON.parse(compiled.contracts[':MyToken'].interface);
        //         var abi = JSON.parse(compiled.contracts[contractName].interface);                
        //         var bytecode = '0x'+compiled.contracts[contractName].bytecode;
    
        //         myContract = web3.eth.contract(abi);

        //         var returnArray = [];
        //         returnArray.bytecode = bytecode;
        //         returnArray.myContract = myContract;
        //         returnArray.abi = abi;
                
        //         resolve(returnArray);
        //     })
        //     .catch((error)=>{
        //         console.log("error in reading file: ", error);
        //         reject(error);
        //     });

        // var solc=require('solc');
        // var input = {
        //     'Auction.sol': fs.readFileSync(__dirname+'/contract/src/Auction.sol', 'utf8'),
        //     'Common.sol': fs.readFileSync(__dirname+'/contract/src/Common.sol', 'utf8'),
        //     'FirstSale.sol': fs.readFileSync(__dirname+'/contract/src/FirstSale.sol', 'utf8'),
        //     'ICO.sol': fs.readFileSync(__dirname+'/contract/src/ICO.sol', 'utf8'),
        //     'Token.sol': fs.readFileSync(__dirname+'/contract/src/Token.sol', 'utf8'),
        //     'ICOControllerMonolith.sol': fs.readFileSync(__dirname+'/contract/src/ICOControllerMonolith.sol', 'utf8')
            
        // };

        // let compiled = solc.compile({sources: input}, 1);

        // var abi = JSON.parse(compiled.contracts[':MyToken'].interface);
        // var abi = JSON.parse(compiled.contracts[contractName+'.sol:'+contractName].interface);                
        // var bytecode = '0x'+compiled.contracts[contractName+'.sol:'+contractName].bytecode;
        var abi = JSON.parse(compiledContract.contracts[contractName+'.sol:'+contractName].interface);                
        var bytecode = '0x'+compiledContract.contracts[contractName+'.sol:'+contractName].bytecode;

        myContract = web3.eth.contract(abi);
        
        var returnArray = [];
        returnArray.bytecode = bytecode;
        returnArray.myContract = myContract;
        returnArray.abi = abi;
        
        resolve(returnArray);
    });
}

//  var checkBalance = function(address){
//     web3.eth.getBalance(address).then(function(balance){
//         console.log('balnce: ' + balance );
//     });
// }

/**
 * unlocks the source account of contract using given checksum address of account and its password.
 * @param {string} owner 
 * @param {string} password 
 * @param {number} duration 
 * @param {Function} cb 
 */
var unlockAccount=function(owner, password) {
    return new Promise( (resolve, reject) => {
        //this returns tru if successfull
        var unlockFlag = web3.personal.unlockAccount(owner, password);
        if(unlockFlag){
            resolve(unlockFlag);
        }else{
            reject(unlockFlag);
        }
    });
}


 /******************************************************************************************
  * Methods for handling the process of creating and deploying a smart contract 
  * from its source code
  ******************************************************************************************/

  /**
   * estimates the gas left in the source account.
   * @param {string} sourceAccount - surceAccount to estimaate Gas.
   * @param {string} bytecode - bytecode recieved from contract after compiling it.
   * @param {Function} cb - callback method
   */
  var estimateGas = (sourceAccount, bytecode) => { 
      return new Promise( (resolve, reject) => {
        var estimatedGas = web3.eth.estimateGas({                     
            from: sourceAccount,                     
            data: bytecode                 
        }); 
        if(estimatedGas > 0){
            resolve(estimatedGas);
        } else {
            reject(new Error('error has occoured in estimating gas'));
        }
      });  
  }
  /** Convirts the source code of smart contract to json parsed abi
   * @param {Function} cb 
   */

var convertToAbi = (compiledSmartContract, contractName) => {
    return new Promise( (resolve, reject) => {
        // var fs=require('fs');
        var readProm = readContractSourceBuildInitial(fs, compiledSmartContract, contractName);

        readProm.then((returnArray) => {
            //to write the compiled abi to the json file
            fileStreamWriteJson(fs, __dirname + '/abiJson/contractAbi.json', JSON.stringify(returnArray['abi']), 'utf8')
            .then((message)=>{
                console.log(message);
            })
            .catch((error)=>{
                console.log("error in writing to the file: ", error);                
            }); 
            
            resolve(returnArray);
        }).catch((error)=>{
            reject(error);
        });
    });          
}

/**
 * deploy the smart contract.
 * @param {object} contractInstance 
 * @param {string} owner 
 * @param {string} bytecode 
 * @param {number} gas 
 * @param {JSON} abi 
 * @param {Function} callback 
 */
var createContractInstance = function(contractItself, owner, bytecode, gas, abi) {
   // // constructor variables
    // var contractTotalSupply = 1000000000;
    // var contractName = 'ScriptDrop token';
    // var contractDecimals = 0;
    // var contractSymbol = 'SDT';

  return new Promise(function(resolve, reject){
        // creating new instance of the contract through its constructor
    contractItself.new(
        // contractTotalSupply,
        // contractName,
        // contractDecimals,
        // contractSymbol,
    {
        from: owner,
        data: bytecode,
        gas: gas+400000
        //can also be changed to promise handling
    }, (error, contractInstance) => {
        if (error) {
            console.log('error in deploying the contract, now firing callback for error.');
            callback(error,error);
            reject(error);
            return;
        } else if (contractInstance.address) {
            console.log('=============================contractAddress: ' + contractInstance.address);
            contractInstance.gas = gas;
            resolve(contractInstance);
        }
    });
  });
}

/**
 * Calls other utility methods to create and deploy smart contract from its source code.
 * @param {string} smartContractLocation, 
 * @param {string} formatToReadIn, 
 * @param {string} contractName
 * @param {string} reqOwner 
 * @param {string} reqOwnerPassword 
 * @param {Function} callback 
 */
// var deployNewSmartContract = function(smartContractLocation, formatToReadIn, contractName, reqOwner, reqOwnerPassword) {
    var deployNewSmartContract = function(compiledSmartContract, contractName, reqOwner, reqOwnerPassword) {
    return new Promise((resolve, reject)=>{
        var owner = reqOwner; 
        var password = reqOwnerPassword;
        // call a function to covert abi(arbitray binary definition) of contract
        // var convertToAbiProm = convertToAbi(smartContractLocation, formatToReadIn, contractName);
        var convertToAbiProm = convertToAbi(compiledSmartContract, contractName);
    
        convertToAbiProm.then( (returnArray) => {
            var bytecode = returnArray['bytecode'];
            var contractItself = returnArray['myContract'];
            var abi = returnArray['abi'];
    
            var unlockProm = unlockAccount(owner, password);
            unlockProm.then( (unlockFlag) => {
            
                var gasProm = estimateGas(owner, bytecode);
                gasProm.then( (gas) => {
                    var contractProm = createContractInstance(contractItself, owner, bytecode, gas, abi);
                    contractProm.then(function(contractInstance){
                        couchUtil.saveToCouch(contractInstance.address, contractInstance.transactionHash);
                        //main Promise resolve();
                        resolve(contractInstance);
                        console.log("A transmitted, waiting for mining...");
                        }).catch((error) => {
                        console.log('error in deploying new smart contract: ');
                        console.log(error);
                        });
                }).catch((error) => {
                    console.log(error)
                });
            }).catch( (unlockFlag) => {
                console.log('error in unlocking the account');
            });
    
        }).catch( (error) => {
            console.log('convert to abi error is here');
            console.log(error);
            reject(error);
        });
    })
}
/****************************************************************************************************
 * To Deploy Existing Method
 ***************************************************************************************************/

 /**
 * 
 * @param {string} smartContractAddress 
 * @param {function} callback 
 */
var deployExistingSmartContract = (reqOwner, reqOwnerPassword, smartContractAddress) => {
    return new Promise( (resolve, reject) => {
        fs.readFile(__dirname + '/abiJson/contractAbi.json', 'utf8', function(error, abiRetrieved) {
            if (error) {
                console.log("error in reading abi file: ", error);
                reject(error);
                return;
            } else {
                var unlockProm = unlockAccount(reqOwner, reqOwnerPassword);
                unlockProm.then( () => {
                    var abiJson = JSON.parse(abiRetrieved);
                    myContract = web3.eth.contract(abiJson);
                    var contractInstance = myContract.at(smartContractAddress);
                    // callback(null, contractInstance);
                    resolve(contractInstance);
                }).catch((error) => {
                    console.log('unlock inside deployexistingcontract error is here');
                    console.log(error);
                    return;
                });
            }
        });
    });
}

/****************************************************************************************************
 * TRansaction Utility Methods
 ***************************************************************************************************/

 /**
 * 
 * @param {string} sourceAccountAddress 
 * @param {string} targetAccountAddress 
 * @param {string} sourceAccountPassword 
 * @param {object} contractInstance 
 */
var transferContractTokenFromFixedSource = function(
        sourceAccountAddress, 
        targetAccountAddress, 
        sourceAccountPassword,
        tokenAmount, 
        contractInstance)
{
    new Promise(function(resolve, reject){
        var transferData = contractInstance.transfer.getData(targetAccountAddress, tokenAmount); 
        
        var unlockProm = unlockAccount(sourceAccountAddress, sourceAccountPassword);
        unlockProm.then( (unlockFlag) => {
            var transactionHash = contractInstance._eth.sendTransaction({
                from: sourceAccountAddress, 
                to: contractInstance.address,            
                data: transferData
            });
            console.log('Transfer Transaction hash: ' + transactionHash);
            
            new Promise((resolve, reject) => {
                console.log('fetching transaction reciept...');
                var transactionReciept = web3.eth.getTransactionReceipt(transactionHash);
                while(transactionReciept == null){
                    transactionReciept = web3.eth.getTransactionReceipt(transactionHash); 
                }
                // quite lame checking, else is never gonna be reached, 
                if(transactionReciept != null)
                    resolve (transactionReciept);
                else
                    reject(transactionReciept);   
            }).then((transactionReciept) => {
                console.log('Current Block No. :' + transactionReciept.blockNumber);
                resolve(contractInstance);
            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            console.log('unlock inside commitTrabsaction error is here');
            console.log(error);
            return;
        });
        
    }).then((contractInstance) => {
        console.log('================= After Token Transaction balance of source account: ' + 
        checkTokenBalance(contractInstance, sourceAccountAddress)+' %');

        console.log('================= After Token Transaction balance of target account: ' + 
        checkTokenBalance(contractInstance, targetAccountAddress)+' %');
    }).catch( (error) => {
        console.log('transaction reciept is null: ' + error);
    });
}
/**
 * 
 * @param {*} contractSourceAccountAddress 
 * @param {*} contractInstance 
 * @param {*} anySourceAccountAddress 
 * @param {*} sourceAccountPassword 
 * @param {*} limitAmount 
 */
var approveTransactionLimit = function(contractSourceAccountAddress, 
        contractInstance, anySourceAccountAddress, sourceAccountPassword, limitAmount) {

    var transferData = contractInstance.approve.getData(anySourceAccountAddress, limitAmount);
    unlockAccount(anySourceAccountAddress, sourceAccountPassword).then( (unlockFlag) => {
        var approveTransactionHash = contractInstance._eth.sendTransaction({
            from: contractSourceAccountAddress, 
            to: contractInstance.address,            
            data: transferData
        });
    }).catch((error)=>{
        console.log(error);
    });
}

/**
 * 
 * @param {*} anySourceAccountAddress 
 * @param {*} targetAccountAddress 
 * @param {*} sourceAccountPassword 
 * @param {*} tokenAmount 
 * @param {*} contractInstance 
 */
var transferContractTokenFromAnySource = function(
    anySourceAccountAddress, 
    targetAccountAddress, 
    sourceAccountPassword,
    tokenAmount, 
    contractInstance)
{
    new Promise(function(resolve, reject){
        
        approveTransactionLimit(anySourceAccountAddress,
            contractInstance, anySourceAccountAddress, sourceAccountPassword, 10000);
        
        var transferData = contractInstance.transferFrom.getData(
            anySourceAccountAddress, targetAccountAddress, tokenAmount);

        var unlockProm = unlockAccount(anySourceAccountAddress, sourceAccountPassword);

        unlockProm.then( (unlockFlag) => {
            var transactionHash = contractInstance._eth.sendTransaction({
                from: anySourceAccountAddress, 
                to: contractInstance.address,            
                data: transferData
            });
            console.log('Transfer Transaction hash: ' + transactionHash);
            
            new Promise((resolve, reject) => {
                console.log('fetching transaction reciept...');
                var transactionReciept = web3.eth.getTransactionReceipt(transactionHash);
                while(transactionReciept == null){
                    transactionReciept = web3.eth.getTransactionReceipt(transactionHash); 
                }
                // quite lame checking, else is never gonna be reached, 
                if(transactionReciept != null)
                    resolve (transactionReciept);
                else
                    reject(transactionReciept);   
            }).then((transactionReciept) => {
                console.log('Current Block No. :' + transactionReciept.blockNumber);
                resolve(contractInstance);
            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            console.log('unlock inside commitTransaction error is here');
            console.log(error);
            return;
        });
        
    }).then((contractInstance) => {
        console.log('================= After Token Transaction balance of source account: ' + 
        checkTokenBalance(contractInstance, anySourceAccountAddress)+' %');

        console.log('================= After Token Transaction balance of target account: ' + 
        checkTokenBalance(contractInstance, targetAccountAddress)+' %');
    }).catch( (error) => {
        console.log('transaction reciept is null: ' + error);
    });
}

/**
 * 
 * @param {object} contractInstance 
 * @param {string} accountAddress 
 */
var checkTokenBalance = function(contractInstance, accountAddress){
    return contractInstance.balanceOf(accountAddress).c[0];
    // return contractInstance.contract.balanceOf(accountAddress).c[0];
    
}
/**
 * Creates an ethereum account with provided passphrase.
 * @param {string} passphrase 
 */
var createEthereumAccount = function(passphrase){
    web3.personal.createEthereumAccount(passphrase);
}

module.exports = {
    web3 : web3,
    couchUtil : couchUtil,  //just to show how to modify visible name of a method    
    deployNewSmartContract, 
    deployExistingSmartContract,
    unlockAccount,
    transferContractTokenFromFixedSource,
    transferContractTokenFromAnySource,
    createEthereumAccount
}