const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateAccessToken = async (payload) => {
    const access_token = await jwt.sign({ payload }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
    return access_token;
};

const generateRefreshToken = async (payload) => {
    const refresh_token = await jwt.sign({ payload }, process.env.REFRESH_TOKEN, { expiresIn: '365d' });
    return refresh_token;
};

const refreshToken = async (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            const refreshToken = token.split(' ')[1];
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN, async (err, user) => {
                if (err) {
                    console.log(err);

                    resolve({
                        status: 'ERR',
                        message: 'Authentication failed',
                    });
                } else {
                    const access_token = await jwt.sign({ payload: { ...user.payload } }, process.env.ACCESS_TOKEN, {
                        expiresIn: '1h',
                    });
                    resolve({
                        status: 'OK',
                        message: 'RefreshToken successfully',
                        accessToken: access_token,
                    });
                }
            });
        } catch (e) {
            console.log(e);
            reject(e);
        }
    });
};

module.exports = { generateAccessToken, generateRefreshToken, refreshToken };
