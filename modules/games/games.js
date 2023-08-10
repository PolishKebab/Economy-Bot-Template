const { Bank } = require("../../functions");
class Coinflip{
    static async run(user,side,amount){
        const sides = ["heads","tails"];
        if(!sides.includes(side)){
            throw new Error(`${side} is not a valid bet, please use \`heads\` or \`tails\``)
        }
        if(!await Bank.getUser(user)){
            await Bank.addUser(user)
            throw new Error(`Insufficient funds`)
        }
        if((await Bank.getUser(user)).credits<amount){
            throw new Error(`Insufficient funds`)
        }
        if(sides[(Math.random()*100)%2]==side){
            await Bank.addMoney(user,amount)
            return true;
        }else{
            await Bank.removeMoney(user,amount)
            return false;
        }
    }
}
class Games{
    coinflip = Coinflip;
}
module.exports=Games;