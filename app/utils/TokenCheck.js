var js = require('./newJs.js');

const accounts = js.web3.eth.accounts;
const sourceAccountAddress = accounts[0]; 
const targetAccountAddress = accounts[2];   //accounts[2]; has no password
const anySourceAccountAddress = accounts[2]; 
const tokenAmount = 1000;  //1,00,000

const sourceAccountPassword = 'oodles';


var contractAddress = '0x3589e24dfc7cc489522c64d4bb64448593924653';

var abiRetrievedProm = js.fileStreamRead(js.fs, __dirname+'/customCheck/checkAbi.json', 'utf8');
abiRetrievedProm.then((abiRetrieved)=>{
    new Promise((resolve, reject) => {
        var abiJson = JSON.parse(abiRetrieved);
        var myContract = js.web3.eth.contract(abiJson);
        var contractInstance = myContract.at(contractAddress);
        if(contractInstance != null)
            resolve(contractInstance);
        else
            reject('Error occured: ');
    }).then((contractInstance)=>{
        console.log(contractInstance);
        // js.transferContractTokenFromAnySource(
        //     sourceAccountAddress, 
        //     targetAccountAddress, 
        //     sourceAccountPassword,
        //     tokenAmount, 
        //     contractInstance)
    }).catch((error)=>{
        console.log(error);
    });
}).catch((error)=>{
    console.log(error);
});