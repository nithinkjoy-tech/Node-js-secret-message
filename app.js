const express = require("express")
const app = express()
const expressLayout = require("express-ejs-layouts")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const Messages = require("./model/user")


app.use(expressLayout)
app.set("view engine", "ejs")

const db = require("./config/keys").MongoURI
mongoose.connect(db, {useNewUrlParser: true})
    .then(console.log("connected to database"))
    .catch(err => console.log(err))

app.use(express.urlencoded({
    extended: false
}))

app.use(cookieParser("secret"))

const cookieConfig = {
    httpOnly: true,
    maxAge: 432000000,
    signed: true
}

app.get("/", (req, res) => {
    const testCookie = req.signedCookies.nithin_messages
    if(!testCookie){
        return res.render("index")
    }
    return res.redirect("/result")
})

app.post("/messages", async (req, res) => {
    const testCookie = req.signedCookies.nithin_messages
    console.log(testCookie)
    if (!testCookie) {
        const value = Math.random().toString(16).substring(2, 15)
        const collection = new Messages({
            name: req.body.name,
            cookie: value
        })

        collection.save()

        res.cookie("nithin_messages", value, cookieConfig)
        return res.render("sharelink", {value})
    }
    const result = await Messages.findOne({cookie: testCookie})
    if (testCookie === result.cookie) {
        return res.redirect("/result")
    }

})

app.get("/messages/:id", async (req, res) => {
    const {id}=req.query
    const testCookie = req.signedCookies.nithin_messages
    try{
    const result = await Messages.findOne({cookie: id})
    if (testCookie === result.cookie) {
        return res.redirect("/result")
    }
    const name=result.name
    res.render("writemessage",{name})
    }
    catch(ex){
        return res.send("Invalid Link")
    } 
})

app.post("/messagesent", async (req, res) => {
    const id = req.body.name
    const msg = req.body.ans1
    console.log(msg)
    const user = await Messages.findOne({cookie: id})
    user.messages.push(msg)
    user.save()
    res.render("successfullysent")
})

app.get("/result",async(req,res)=>{
    try{
    const testCookie = req.signedCookies.nithin_messages
    console.log("/result cookie",testCookie)
    if(!testCookie) return res.redirect("/")
    const result=await Messages.findOne({cookie:testCookie})
    console.log("/result result and result.message",result,result.messages)
    const messagesOfMongo=result.messages
    console.log(messagesOfMongo)
    const messagesArray=Object.values(messagesOfMongo)
    const n=messagesArray.length
    const link="http://nkjsecretmessage.herokuapp.com/messages/link?id="+testCookie;
    messagesString=""
    for(i=0;i<n;i++){
       messagesString+= messagesArray[i]+"./.;./."
    }
    len=messagesString.length
    messagesToDisplay=messagesString.substring(0,len-7)
    res.render("result",{messagesToDisplay,link})
}
catch(ex){
    res.render("alreadylink")
}
})

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Listening to port ${port}`))