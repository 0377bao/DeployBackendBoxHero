const dotenv = require("dotenv")
dotenv.config()
const AWS = require("aws-sdk")
const config = new AWS.Config ({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.REGION,
})
AWS.config = config;
const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
module.exports = {docClient, s3};