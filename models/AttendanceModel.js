
// Attendance Model Definition
// Divya Basir
// July 20, 2021

const mongoose = require("mongoose");
const { stringify } = require("querystring");
const Schema = mongoose.Schema;

mongoose.Promise = require("bluebird");

// user model
const AttendanceSchema = new Schema ({
    "username": String,
        "start_date":Date,
        "end_date":Date,
        "break_time":Number
});

module.exports = mongoose.model("attendance", AttendanceSchema);