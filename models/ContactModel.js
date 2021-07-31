
// Attendance Model Definition
// Divya Basir
// July 20, 2021

const mongoose = require("mongoose");
const { stringify } = require("querystring");
const Schema = mongoose.Schema;

mongoose.Promise = require("bluebird");

// user model
const ContactSchema = new Schema ({
    "username": String,
        "firstName":String,
        "lastName":String,
        "email":String,
        "contactNum": String,
    "query_message": String
});

module.exports = mongoose.model("contact", ContactSchema);