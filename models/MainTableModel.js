
// Employee Model Definition
// Divya Basir
// July 20, 2021

const mongoose = require("mongoose");
const { stringify } = require("querystring");
const Schema = mongoose.Schema;

mongoose.Promise = require("bluebird");

// user model
const mainTableSchema = new Schema ({
    "username": {
        type: String,
        unique: true},
    "password": String,
    "firstName": String,
    "lastName": String,
    email: {
        type: String,
        unique: true},
        "SIN":String,
        "addressStreet":String,
        "addressCity":String,
        "addressProvince":String,
        "zip":String,
        "status":String,
        "departmentID":String,
        "contactNum":String,
        "position":String,
        "hire_date":Date,
    "isAdmin": Boolean,
    "start_date":Date,
        "end_date":Date,
        "break_time":Number
});

module.exports = mongoose.model("mainTables", mainTableSchema);