const express=require('express')
const {Bank} = require("../../../functions.js")
const Authentication = require("../../Authentication/Authentication.js");
const route=express.Router()
const auth=express.Router()
auth.delete('/:id',async(req,res)=>{
    const authUser = await Authentication.getUser(req.session.user.id)
    const response = await Authentication.deleteUser(req.params.id,authUser.message.authlvl)
    res.status(response.code).send(response.message)
}).post('/:id',async(req,res)=>{
    const user = await Authentication.addUser(req.params.id,req.body.authlvl,req.session.user.authlvl)
    res.status(user.code).send(user.message)
}).put('/:id',async(req,res)=>{
    const user = await Authentication.editUser(req.params.id,req.session.user.authlvl,req.body.data)
    res.status(user.code).send(user.message)
}).get('/:id',async(req,res)=>{
    const user=await Authentication.getUser(req.params.id)
    if(!user){
        return res.sendStatus(404)
    }
    res.status(200).send(user)
})
const bank=express.Router()
bank.get('/users',async(req,res)=>{
    const users = await Bank.getUsers()
    res.status(200).send(users)       
}).get('/leaderboard',async(req,res)=>{
    const leadboard=await Bank.getLeaderboard()
    res.status(200).send(leadboard)
}).get('/:id',async(req,res)=>{
    const user = await Bank.getUser(req.params.id)
    if(!user){
        return res.sendStatus(404)
    }
    res.status(200).send(user)
}).post('/:id',async(req,res)=>{
    const usr= await Authentication.getUser(req.session.user.id)
    if(!usr||usr.message.authlvl<1)return res.sendStatus(401)
    if(usr.code!=200)return res.sendStatus(usr.code)
    const user = await Bank.addUser(req.body.id,req.body.credits||0)
    res.status(200).send(user)
}).put('/:id',async(req,res)=>{
    const usr= await Authentication.getUser(req.session.user.id)
    if(!usr||usr.message.authlvl<2)return res.sendStatus(401)
    if(usr.code!=200)return res.sendStatus(usr.code)
    if(body.method=="add"){
        var user = await Bank.addMoney(req.params.id,req.body.credits)
        res.status(200).send(user)
    }else if(req.body.method=="set"){
        var user = await Bank.setMoney(req.params.id,req.body.credits)
        res.status(200).send(user)
    }else if(req.body.method=="remove"){
        var user = await Bank.removeMoney(req.params.id,req.body.credits)
        res.status(200).send(user)
    }else{
        res.sendStatus(400)
    }
}).delete('/:id',async(req,res)=>{
    const usr= await Authentication.getUser(req.session.user.id)
    if(!usr||usr.message.authlvl<3)return res.sendStatus(401)
    if(usr.code!=200)return res.sendStatus(usr.code)
    const user=await Bank.deleteUser(req.body.id)
    res.sendStatus(200)
})
        
route.use('/auth',auth).use('/bank',bank)
module.exports= route