var smartContractCompiler = function(){
    var fs=require('fs');
    var solc=require('solc');
    var input = {
        'Auction.sol': fs.readFileSync(__dirname+'/contract/src/Auction.sol', 'utf8'),
        'Common.sol': fs.readFileSync(__dirname+'/contract/src/Common.sol', 'utf8'),
        'FirstSale.sol': fs.readFileSync(__dirname+'/contract/src/FirstSale.sol', 'utf8'),
        'ICO.sol': fs.readFileSync(__dirname+'/contract/src/ICO.sol', 'utf8'),
        'Token.sol': fs.readFileSync(__dirname+'/contract/src/Token.sol', 'utf8'),
        'ICOControllerMonolith.sol': fs.readFileSync(__dirname+'/contract/src/ICOControllerMonolith.sol', 'utf8')
        
    };
    
    let compiled = solc.compile({sources: input}, 1);
    return compiled;

}

module.exports = {
    smartContractCompiler
}

