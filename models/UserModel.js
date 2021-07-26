
// User Model Definition
// Divya Basir
// July 20, 2021

const mongoose = require("mongoose");
const { stringify } = require("querystring");
const Schema = mongoose.Schema;

mongoose.Promise = require("bluebird");

// user model
const userSchema = new Schema ({
    "username": {
        type: String,
        unique: true},
    "password": String,
    "firstName": String,
    "lastName": String,
    email: {
        type: String,
        unique: true},
    "isAdmin": Boolean
});

module.exports = mongoose.model("users", userSchema);



//inside server.js dummy code
/*
app.get("/firstrunsetup", (req, res) => {
    var Clint = new userModel({
        username: 'clint',
        password: '1234',
        firstName: 'Clint',
        lastName: 'MacDonald',
        email: 'clint.macdonald@senecacollege.ca',
        isAdmin: true
    });

    console.log("Got here after creating user model");
    Clint.save((err) => {
        console.log("Error: " + err + ";");
        if (err) {
            console.log("There was an error creating Clint: " + err);
        }
        else {
            console.log("Clint was created");
        }
    });
    console.log("Got here after saving Clint");
    res.redirect("/");
})
*/