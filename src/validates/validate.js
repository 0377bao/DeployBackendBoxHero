const { validationResult } = require('express-validator');

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'ERR',
            message: errors.array().map((err) => err.msg),
        });
    }
    next();
}

module.exports = validate;
