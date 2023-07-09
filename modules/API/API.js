const express=require('express')
const app=express()
const{join}=require('path')
var session = require('express-session')
const Client=require('../../index')
const Authentication = require('../Authentication/Authentication')
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
    /**
     * @param {Client} client 
     */
    constructor(client){
        if(!client.config.modules.API){
            throw new Error(`[Modules:API] Error: module is not enabled.`)
        }
        app.use(express.json())
        app.use(session({
            secret: API.clientSecret,
            resave: false,
            saveUninitialized: true,
            cookie: { maxAge: 60000 }
        }))
        app.use(express.urlencoded({ extended: true }));
        app.use(async(req,res,next)=>{
            req.client = client;
            if(!req.session.user?.id)req.session.user={id:'true',username:'annonymous'}
            next()
        }).use('/api',require('../API/api-endpoints/api'))
        .use('/dashboard',require('../API/api-endpoints/dashboard'))
        app.set('view engine', 'ejs');
        app.set('views',join(__dirname,'views'))
        .get("/",async(req,res)=>{
            req.session.user.link = Authentication.authLink;
            res.render('index.ejs',{data:req.session.user})
        }).get('/auth',async (req,res)=>{
            res.sendFile(join(__dirname,'views','authentication.html'))
        }).post('/auth',async(req,res)=>{
            req.session.regenerate(function (err) {
                req.session.user={...req.body};
                req.session.save(()=>{
                    res.sendStatus(200)
                })
            })
        }).get("/logout",async(req,res)=>{
            req.session.destroy();
            res.redirect("/")
        })
        app.listen(API.port,()=>{console.log(`api server status: running on port ${API.port}`)})
    }
}
module.exports=API
