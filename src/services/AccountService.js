const db = require('../../models/index');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('./JwtService');
const Account = db.Account;
const Employee = db.Employee;
const AccountRoles = db.AccountRoles;
const Role = db.Role;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;

class AccountService {
    checkEmailExists(email) {
        return new Promise(async (resolve, reject) => {
            try {
                const accountFind = await Account.findAll({
                    where: {
                        email,
                    },
                });
                if (accountFind.length !== 0) {
                    resolve({
                        status: 'OK',
                        statusHttp: HTTP_OK,
                        message: 'Email đã tồn tại',
                        isExists: true,
                    });
                } else {
                    resolve({
                        status: 'OK',
                        statusHttp: HTTP_OK,
                        message: 'Email không tồn tại',
                        isExists: false,
                    });
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    createAccount(newAccount) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const {
                    employeeID,
                    email,
                    password,
                    status,
                    employeeName,
                    cccd,
                    dob,
                    phoneNumber,
                    gender,
                    image,
                    address,
                    startDate,
                    endDate,
                    roles,
                    warehouseID,
                } = newAccount;

                // Check email tồn tại
                const accountFind = await Account.findOne({ where: { email } });
                if (accountFind) {
                    return reject({
                        statusHttp: HTTP_BAD_REQUEST,
                        status: 'ERR',
                        message: 'Email đã tồn tại',
                    });
                }

                // check employee tồn tại
                const employeeFind = await Employee.findOne({ where: { employeeID } });
                if (employeeFind) {
                    return reject({
                        statusHttp: HTTP_BAD_REQUEST,
                        status: 'ERR',
                        message: 'Nhân viên đã tồn tại',
                    });
                }

                // check phone number
                const phoneExist = await Employee.findOne({
                    where: {
                        phoneNumber,
                    },
                });
                if (phoneExist) {
                    return reject({
                        statusHttp: HTTP_BAD_REQUEST,
                        status: 'ERR',
                        message: 'Số điện thoại đã tồn tại',
                    });
                }

                // check cccd
                const cccdExist = await Employee.findOne({
                    where: {
                        cccd,
                    },
                });
                if (cccdExist) {
                    return reject({
                        statusHttp: HTTP_BAD_REQUEST,
                        status: 'ERR',
                        message: 'CCCD đã tồn tại',
                    });
                }

                // Hash password
                const hash = bcrypt.hashSync(password, 10);

                // Tạo employee
                const employee = await Employee.create(
                    {
                        employeeID,
                        employeeName,
                        image,
                        cccd,
                        dob,
                        phoneNumber,
                        gender,
                        address,
                        startDate,
                        endDate,
                        warehouseID,
                        status,
                    },
                    { transaction },
                );

                // Tạo account + gán roles nhanh
                const account = await Account.create(
                    {
                        email,
                        password: hash,
                        statusWork: status,
                        employeeID: employee.employeeID,
                    },
                    { transaction },
                );

                if (roles?.length) {
                    await account.setRoles(
                        roles.map((r) => r.roleID),
                        { transaction },
                    );
                }

                // Generate token
                const payload = { employeeID, email, roles, warehouseID };
                const accessToken = await generateAccessToken(payload);
                const refreshToken = await generateRefreshToken(payload);

                await transaction.commit();
                resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    message: 'Tạo tài khoản thành công',
                    accessToken,
                    refreshToken,
                });
            } catch (e) {
                await transaction.rollback();
                console.log(e);
                reject(e);
            }
        });
    }
    loginAccount(accountLogin) {
        return new Promise(async (resolve, reject) => {
            try {
                const { email, password } = accountLogin;

                const accountFind = await Account.findAll({
                    where: {
                        email,
                    },
                });
                if (accountFind.length === 0) {
                    resolve({
                        status: 'ERR',
                        message: 'Email không tồn tại',
                        statusHttp: HTTP_NOT_FOUND,
                    });
                } else {
                    const comparePassword = await bcrypt.compare(password, accountFind[0].password);
                    if (!comparePassword) {
                        resolve({
                            status: 'ERR',
                            message: 'Mật khẩu không chính xác',
                            statusHttp: HTTP_UNAUTHORIZED,
                        });
                    } else {
                        const roles = await AccountRoles.findAll({
                            where: {
                                accountID: accountFind[0].accountID,
                            },
                        });
                        const roleNames = await Promise.all(
                            roles.map((role) => Role.findOne({ where: { roleID: role.roleID } })),
                        );

                        if (!roleNames) {
                            resolve({
                                status: 'ERR',
                                message: 'Không tìm thấy vai trò',
                                statusHttp: HTTP_NOT_FOUND,
                            });
                        }

                        const employee = await Employee.findOne({
                            where: {
                                employeeID: accountFind[0].employeeID,
                            },
                        });

                        if (!employee) {
                            resolve({
                                status: 'ERR',
                                message: 'Không tìm thấy nhân viên',
                                statusHttp: HTTP_NOT_FOUND,
                            });
                        }

                        const accessToken = await generateAccessToken({
                            employeeID: accountFind[0].employeeID,
                            email: accountFind[0].email,
                            roles: roleNames,
                            warehouseID: employee.warehouseID,
                        });

                        const refreshToken = await generateRefreshToken({
                            employeeID: accountFind[0].employeeID,
                            email: accountFind[0].email,
                            roles: roleNames,
                            warehouseID: employee.warehouseID,
                        });
                        resolve({
                            status: 'OK',
                            message: 'Đăng nhập thành công',
                            statusHttp: HTTP_OK,
                            accessToken,
                            refreshToken,
                        });
                    }
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    changePassword(changePasswordData) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { email, oldPassword, newPassword } = changePasswordData;

                const accountFind = await Account.findOne({ where: { email } });
                if (!accountFind) {
                    resolve({
                        status: 'ERR',
                        message: 'Email không tồn tại',
                        statusHttp: HTTP_NOT_FOUND,
                    });
                }

                const comparePassword = await bcrypt.compare(oldPassword, accountFind.password);

                if (!comparePassword) {
                    resolve({
                        status: 'ERR',
                        message: 'Mật khẩu cũ không chính xác',
                        statusHttp: HTTP_UNAUTHORIZED,
                    });
                }

                const hashNewPassword = bcrypt.hashSync(newPassword, 10);
                await Account.update({ password: hashNewPassword }, { where: { email } }, { transaction });

                await transaction.commit();
                resolve({
                    status: 'OK',
                    message: 'Đổi mật khẩu thành công',
                    statusHttp: HTTP_OK,
                });
            } catch (e) {
                await transaction.rollback();

                console.log(e);
                reject(e);
            }
        });
    }
}

module.exports = new AccountService();
