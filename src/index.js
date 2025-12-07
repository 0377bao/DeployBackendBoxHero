const dotenv = require('dotenv');
const express = require('express');
const router = require('./routes');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const { startBaselineJob } = require('./cron/baselineJob');

dotenv.config();

const port = process.env.PORT;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
// Parser data from tag form
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
//add io to middleware
app.use((req, res, next) => {
    req.io = io;
    next();
});
//start router
router(app);
startBaselineJob();

server.listen(port, () => {
    console.log(`server listening on ${port}`);
});
