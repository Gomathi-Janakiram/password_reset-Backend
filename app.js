const express = require("express")
const mongodb = require("mongodb")
const bodyParser = require("body-parser")
var bcrypt = require("bcrypt")
require("dotenv").config();
const nodemailer = require("nodemailer")
const mongoClient = mongodb.MongoClient;
const app = express()
const mailgun = require("mailgun-js")
let DOMAIN_KEY="sandboxa84c1a3e4e4c4b2d9660e90a13cad0e9.mailgun.org"

const API_KEY="12b14252707dc65d89539e12a12ddb97-95f6ca46-48672fea"
let DOMAIN =DOMAIN_KEY;
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });


const dbURL = process.env.MONGO_URL||"mongodb://127.0.0.1:27017";

const port=process.env.PORT||

app.use(bodyParser.json())
// var urlencodedParser = bodyParser.urlencoded({ extended: true })
app.set("view engine", "ejs")

app.use(cors())
app.post("/login", async (req, res) => {
    let email = req.body.email;
    let password = req.body.password
    console.log(email, password);
    let existingUser;
    try {
        let clientInfo = await mongoClient.connect(dbURL);
        let db = clientInfo.db("PasswordReset");
        existingUser = await db
            .collection("users")
            .findOne({ email: req.body.email })
    } catch (error) {
        console.log(error);
    }

    if (!existingUser) {
        res.status(400).json({
            message: "User not found!Please Register",
        });
    } else {
        try {
            let isPasswordValid = await bcrypt.compare(
                password,
                existingUser.password
            );
            console.log(isPasswordValid);
            if (!isPasswordValid) {
                res.status(400).json({
                    message: "Your password does not match",
                });
            } else {
                res.status(200).json({
                    message: "Login successful",
                });
            }
        } catch (error) {
            console.log(error);
        }
    }
});



app.post("/signup", async (req, res) => {
    let password = req.body.password
    let existingUser;

    try {
        let clientInfo = await mongoClient.connect(dbURL);
        let db = clientInfo.db("PasswordReset");
        existingUser = await db
            .collection("users")
            .findOne({ email: req.body.email })
        if (existingUser) {
            res.status(200).json({ error: "user already exists" })
            clientInfo.close()
        } else {
            let genSalt = await bcrypt.genSalt(10)
            let hashedPassword = await bcrypt.hash(password, genSalt)
            req.body.password = hashedPassword
            req.body.resetPassword = ""
            await db.collection("users").insertOne(req.body)
            res.status(200).json({ message: "User registered" })
            clientInfo.close()
        }
    } catch (err) {
        console.log(err)
    }
})


app.post("/sendEmail", async (req, res) => {
    let Email = req.body.email;
    let existingUser;
    let db;
    try {
        let clientInfo = await mongoClient.connect(dbURL);
        db = clientInfo.db("PasswordReset");
        existingUser = await db
            .collection("users")
            .findOne({ email: Email })
    } catch (error) {
        console.log(error);
        return;
    }
    if (existingUser) {
        try {
            let randomGenString = (Math.random() * 10000000000).toString();
            const data = {
                from: "noreply@gmail.com",
                to: Email,
                subject: "PAssword reset link",
                html: `<p>Reset String : ${randomGenString}</p><a href='http://localhost:5501/frontend/reset_password.html'>Click on the link</a>`, // html body
            }
            await db.collection("users")
                .updateOne({ email: Email }, { $set: { resetPassword: randomGenString } }, (err, success) => {
                    if (!err) {
                        mg.messages().send(data, (error, body) => {
                            if (error) {
                                res.status(400).json({ error: error.message })
                            } else {
                                res.status(200).json({ message: "Email sent" })
                            }
                        })
                    }
                })
        } catch (error) {
            console.log(error);
        }
    } else {
        res.status(400).json({
            message: "User not available",
        });
    }
});

app.put('/newPassword', async (req, res) => {
    let existingUser;
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("PasswordReset");
        let existingUser = await db.collection('users')
            .findOne({
                $and: [{ email: req.body.email },
                { resetPassword: req.body.resetString }]
            });
        if (existingUser) {
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(req.body.password, salt)
            await db.collection("users")
                .updateOne({ email: req.body.email }, {
                    $set: { resetPassword: '', password: hash }
                })
            res.status(200).json({ status: "success", message: "Password Updated Successfully" })
            clientInfo.close()
        } else {
            res.status(400).json({
                message: 'Failed to reset password'
            })
            clientInfo.close()
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ error })
    }
})


app.listen(8000, (err) => {
    if (err) throw err;
    console.log(`Server started at ${process.env.PORT}`)
})