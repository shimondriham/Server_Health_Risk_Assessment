const mongoose =require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const questionSchema = new mongoose.Schema({
    userId: String,
    date_created: { type: Date, default: Date.now() },
    finished: { type: Boolean, default: false },
});

exports.QuestionModel = mongoose.model("questions", questionSchema);

exports.validQuestion = (_bodyData) => {
    let joiSchema = Joi.object({
        
    });

    return joiSchema.validate(_bodyData);
};
