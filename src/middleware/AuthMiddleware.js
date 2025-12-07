const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_FORBIDDEN = process.env.HTTP_FORBIDDEN;

const authUser = async (req, res, next) => {
    try {
        const employeeID = req.headers['employeeid'];
        const token = req.headers.token;
        if (token) {
            const accessToken = token.split(' ')[1];
            jwt.verify(accessToken, process.env.ACCESS_TOKEN, (err, user) => {
                if (err) {
                    return res.status(HTTP_UNAUTHORIZED).json({
                        status: 'ERR',
                        message: 'Token là không hợp lệ',
                    });
                } else if (employeeID != user.payload.employeeID) {
                    return res.status(HTTP_FORBIDDEN).json({
                        status: 'ERR',
                        message: 'Employee ID không trùng với token',
                    });
                } else {
                    next();
                }
            });
        } else {
            return res.status(HTTP_BAD_REQUEST).json({
                status: 'ERR',
                message: 'Token là bắt buộc',
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            status: 'ERR',
            message: [e.message],
        });
    }
};

// xác nhận xem có phải là system_admin hoặc là warehouse_manager của kho bằng warehouseID
const authUserIsManager = async (req, res, next) => {
    try {
        const employeeID = req.headers['employeeid'];
        const warehouseID = req.headers['warehouseid'];

        const token = req.headers.token;

        console.log('employee', employeeID);
        console.log('w', warehouseID);
        console.log('to', token);

        if (token) {
            const accessToken = token.split(' ')[1];
            jwt.verify(accessToken, process.env.ACCESS_TOKEN, (err, user) => {
                if (err) {
                    console.log(err);
                    return res.status(HTTP_UNAUTHORIZED).json({
                        status: 'ERR',
                        message: 'Token là không hợp lệ',
                    });
                } else if (employeeID != user.payload.employeeID) {
                    return res.status(HTTP_UNAUTHORIZED).json({
                        status: 'ERR',
                        message: 'Employee ID không trùng với token',
                    });
                } else {
                    const hasWareManagerRole = user.payload.roles.some((role) => role.roleName === 'WARE_MANAGER');

                    const hasSysAdminRole = user.payload.roles.some((role) => role.roleName === 'SYSTEM_ADMIN');

                    if (!hasSysAdminRole && !hasWareManagerRole) {
                        return res.status(HTTP_FORBIDDEN).json({
                            status: 'ERR',
                            message: 'Bạn không có quyền truy cập tài nguyên này',
                        });
                    }
                    if (hasWareManagerRole && user.payload.warehouseID !== warehouseID && !hasSysAdminRole) {
                        return res.status(HTTP_FORBIDDEN).json({
                            status: 'ERR',
                            message: 'Bạn không có quyền truy cập kho này',
                        });
                    }
                    next();
                }
            });
        } else {
            return res.status(HTTP_BAD_REQUEST).json({
                status: 'ERR',
                message: 'Token là bắt buộc',
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            status: 'ERR',
            message: [e.message],
        });
    }
};

// xác nhận xem có phải là system_admin hoặc là warehouse_manager
const authUserIsManagerWithoutWarehouse = async (req, res, next) => {
    try {
        const employeeID = req.headers['employeeid'];

        const token = req.headers.token;
        if (token) {
            const accessToken = token.split(' ')[1];
            jwt.verify(accessToken, process.env.ACCESS_TOKEN, (err, user) => {
                if (err) {
                    console.log(err);
                    return res.status(HTTP_UNAUTHORIZED).json({
                        status: 'ERR',
                        message: 'Token là không hợp lệ',
                    });
                } else if (employeeID != user.payload.employeeID) {
                    return res.status(HTTP_UNAUTHORIZED).json({
                        status: 'ERR',
                        message: 'Employee ID không trùng với token',
                    });
                } else {
                    const hasWareManagerRole = user.payload.roles.some((role) => role.roleName === 'WARE_MANAGER');

                    const hasSysAdminRole = user.payload.roles.some((role) => role.roleName === 'SYSTEM_ADMIN');

                    if (!hasSysAdminRole && !hasWareManagerRole) {
                        return res.status(HTTP_FORBIDDEN).json({
                            status: 'ERR',
                            message: 'Bạn không có quyền truy cập tài nguyên này',
                        });
                    } else {
                        next();
                    }
                }
            });
        } else {
            return res.status(HTTP_BAD_REQUEST).json({
                status: 'ERR',
                message: 'Token là bắt buộc',
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            status: 'ERR',
            message: [e.message],
        });
    }
};

const authUserIsManagerOrStockReceiver = async (req, res, next) => {
    try {
        const employeeID = req.headers['employeeid'];
        const warehouseID = req.headers['warehouseid'];
        const token = req.headers.token;

        if (!token) {
            return res.status(HTTP_BAD_REQUEST).json({
                status: 'ERR',
                message: 'Token là bắt buộc',
            });
        }

        const accessToken = token.split(' ')[1];

        jwt.verify(accessToken, process.env.ACCESS_TOKEN, (err, user) => {
            if (err) {
                return res.status(HTTP_UNAUTHORIZED).json({
                    status: 'ERR',
                    message: 'Token không hợp lệ',
                });
            }

            if (employeeID != user.payload.employeeID) {
                return res.status(HTTP_UNAUTHORIZED).json({
                    status: 'ERR',
                    message: 'Employee ID không trùng với token',
                });
            }

            // --- Ưu tiên check STOCK_RECEIVER trước ---
            const hasStockReceiverRole = user.payload.roles.some((role) => role.roleName === 'STOCK_RECEIVER');
            if (hasStockReceiverRole) {
                return next(); // Nếu là STOCK_RECEIVER thì pass luôn
            }

            // --- Nếu không phải STOCK_RECEIVER thì check System Admin / Ware Manager ---
            const hasWareManagerRole = user.payload.roles.some((role) => role.roleName === 'WARE_MANAGER');
            const hasSysAdminRole = user.payload.roles.some((role) => role.roleName === 'SYSTEM_ADMIN');

            if (!hasSysAdminRole && !hasWareManagerRole) {
                return res.status(HTTP_FORBIDDEN).json({
                    status: 'ERR',
                    message: 'Bạn không có quyền truy cập tài nguyên này',
                });
            }

            if (hasWareManagerRole && user.payload.warehouseID !== warehouseID && !hasSysAdminRole) {
                return res.status(HTTP_FORBIDDEN).json({
                    status: 'ERR',
                    message: 'Bạn không có quyền truy cập kho này',
                });
            }

            return next();
        });
    } catch (e) {
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            status: 'ERR',
            message: [e.message],
        });
    }
};

const authUserIsManagerOrStockDispatcher = async (req, res, next) => {
    try {
        const employeeID = req.headers['employeeid'];
        const warehouseID = req.headers['warehouseid'];
        const token = req.headers.token;

        if (!token) {
            return res.status(HTTP_BAD_REQUEST).json({
                status: 'ERR',
                message: 'Token là bắt buộc',
            });
        }

        const accessToken = token.split(' ')[1];

        jwt.verify(accessToken, process.env.ACCESS_TOKEN, (err, user) => {
            if (err) {
                return res.status(HTTP_UNAUTHORIZED).json({
                    status: 'ERR',
                    message: 'Token không hợp lệ',
                });
            }

            if (employeeID != user.payload.employeeID) {
                return res.status(HTTP_UNAUTHORIZED).json({
                    status: 'ERR',
                    message: 'Employee ID không trùng với token',
                });
            }

            // --- Ưu tiên check STOCK_DISPATCHER trước ---
            const hasStockDispatcherRole = user.payload.roles.some((role) => role.roleName === 'STOCK_DISPATCHER');
            if (hasStockDispatcherRole) {
                return next(); // Nếu là STOCK_DISPATCHER thì pass luôn
            }

            // --- Nếu không phải STOCK_DISPATCHER thì check System Admin / Ware Manager ---
            const hasWareManagerRole = user.payload.roles.some((role) => role.roleName === 'WARE_MANAGER');
            const hasSysAdminRole = user.payload.roles.some((role) => role.roleName === 'SYSTEM_ADMIN');

            if (!hasSysAdminRole && !hasWareManagerRole) {
                return res.status(HTTP_FORBIDDEN).json({
                    status: 'ERR',
                    message: 'Bạn không có quyền truy cập tài nguyên này',
                });
            }

            if (hasWareManagerRole && user.payload.warehouseID !== warehouseID && !hasSysAdminRole) {
                return res.status(HTTP_FORBIDDEN).json({
                    status: 'ERR',
                    message: 'Bạn không có quyền truy cập kho này',
                });
            }

            return next();
        });
    } catch (e) {
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            status: 'ERR',
            message: [e.message],
        });
    }
};

const authUserIsManagerOrAccountant = async (req, res, next) => {
    try {
        const employeeID = req.headers['employeeid'];
        const warehouseID = req.headers['warehouseid'];
        const token = req.headers.token;

        if (!token) {
            return res.status(HTTP_BAD_REQUEST).json({
                status: 'ERR',
                message: 'Token là bắt buộc',
            });
        }

        const accessToken = token.split(' ')[1];

        jwt.verify(accessToken, process.env.ACCESS_TOKEN, (err, user) => {
            if (err) {
                return res.status(HTTP_UNAUTHORIZED).json({
                    status: 'ERR',
                    message: 'Token không hợp lệ',
                });
            }

            if (employeeID != user.payload.employeeID) {
                return res.status(HTTP_UNAUTHORIZED).json({
                    status: 'ERR',
                    message: 'Employee ID không trùng với token',
                });
            }

            // --- Ưu tiên check ACCOUNTANT trước ---
            const hasAccountantRole = user.payload.roles.some((role) => role.roleName === 'ACCOUNTANT');
            if (hasAccountantRole) {
                return next(); // Nếu là ACCOUNTANT thì pass luôn
            }

            // --- Nếu không phải ACCOUNTANT thì check System Admin / Ware Manager ---
            const hasWareManagerRole = user.payload.roles.some((role) => role.roleName === 'WARE_MANAGER');
            const hasSysAdminRole = user.payload.roles.some((role) => role.roleName === 'SYSTEM_ADMIN');

            if (!hasSysAdminRole && !hasWareManagerRole) {
                return res.status(HTTP_FORBIDDEN).json({
                    status: 'ERR',
                    message: 'Bạn không có quyền truy cập tài nguyên này',
                });
            }

            if (hasWareManagerRole && user.payload.warehouseID !== warehouseID && !hasSysAdminRole) {
                return res.status(HTTP_FORBIDDEN).json({
                    status: 'ERR',
                    message: 'Bạn không có quyền truy cập kho này',
                });
            }

            return next();
        });
    } catch (e) {
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            status: 'ERR',
            message: [e.message],
        });
    }
};

module.exports = {
    authUser,
    authUserIsManager,
    authUserIsManagerWithoutWarehouse,
    authUserIsManagerOrStockReceiver,
    authUserIsManagerOrStockDispatcher,
    authUserIsManagerOrAccountant,
};
