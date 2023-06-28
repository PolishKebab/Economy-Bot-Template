const express=require('express')
const app=express()
const {Bank} = require("../functions")
const{join}=require('path')
const {Authentication} = require("./Authentication")
var session = require('express-session')
/**
 * **Plugin made by:**
 * 
 * [PolishKebab](https://github.com/PolishKebab) and  [Demon](https://github.com/Mikejunior277)
 * 
 */
class API{
    /**
     * **Port for API host.**
     * @type {Number}
     */
    static port = 100;
    /**
     * **Secret key, set your own, and don't share with anyone**
     * @type {String}
     */
    static clientSecret = "Secret key";
    constructor(){
        if(!require("../config.json").modules.API){
            throw new Error(`[Modules:API] Error: module is not enabled.`)
        }
        app.use(express.json())
        app.use(session({
            secret: API.clientSecret,
            resave: false,
            saveUninitialized: true,
            cookie: { secure: true }
        }))
        app.set('view engine', 'ejs');
        app.set('views',join(__dirname,'views'))
        app.get('/leaderboard',async(req,res)=>{
            const leadboard=await Bank.getLeaderboard()
            res.status(200).send(leadboard)
        }).get('/user/:id',async(req,res)=>{
            const user=await Bank.getUser(`${req.params.id}`)
            if(!user){
                res.sendStatus(404)
            }
            res.status(200).send(user)
        }).get('/users',async(req,res)=>{
            const users=await Bank.getUsers()
            res.status(200).send(users)
        }).delete('/user/:id',async(req,res)=>{
            const authUser = await Authentication.getUser(req.session.username) // needs to be recoded for token, not username lol, everyone can get someones username lol, but token would be more secure.
            const response = await Authentication.deleteUser() // needs recode to accept username not id...
        }).post('/user/:id',async(req,res)=>{

        }).get("/",async(req,res)=>{
            res.render(join(__dirname,'views','index.html'))
        }).get('/auth',async (req,res)=>{
            res.sendFile(join(__dirname,'views','authentication.html'))
        }).post('/auth',async(req,res)=>{
            console.log(req.body)
            for(let i in req.body)req.session[i]=req.body[i]
        })
        app.listen(API.port,()=>{console.log(`api server status: running on port ${API.port}`)})
    }
}
module.exports={API}