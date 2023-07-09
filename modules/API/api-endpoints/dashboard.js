const express=require('express')
const { Bank } = require('../../../functions')
const Authentication = require("../../Authentication/Authentication.js")
const dashboard=express.Router()
const {join}=require('path')
dashboard.get("/leaderboard/:length",async(req,res)=>{
    const leaderboard = await Promise.all((await Bank.getLeaderboard(parseInt(req.params.length))).map(async r=>{
        r.username=(await req.client.users.fetch(r.id)).username
        return r
    }))
    res.render("leaderboard",{leaderboard})
}).get("/leaderboard",async(req,res)=>{
    res.redirect("/dashboard/leaderboard/10")
}).get("/user/:id",async(req,res)=>{
    const{id}=req.params
    const auth = (await Authentication.getUser(req.session.user.id)).message
    var user;
    if(await Bank.getUser(id)){
        user = await req.client.users.fetch(id)
        user.credits = (await Bank.getUser(id)).credits
        user.authlvl = (await Authentication.getUser(id)).message?.authlvl||0
    }
    res.render("user",{user,auth,req,link:Authentication.authLink})
}).get("/user.css",async(req,res)=>{
    res.sendFile(join(__dirname,'../views','user.css'))
}).get("/leaderboard.css",async(req,res)=>{
    res.sendFile(join(__dirname,'../views','leaderboard.css'))
})
module.exports=dashboard