const toobusy = require('toobusy-js');

module.exports = (req, res, next) => {
    if (toobusy()) {
        res.send(503, "Server Too Busy");
    } else {
        next();
    }
};