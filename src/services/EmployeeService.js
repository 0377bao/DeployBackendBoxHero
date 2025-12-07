const { Op } = require('sequelize');
const db = require('../../models');
const dotenv = require('dotenv');
const Employee = db.Employee;
const Account = db.Account;
const Role = db.Role;
const AccountRoles = db.AccountRoles;

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;

const LIMIT_PAGE = 5;

class EmployeeService {
    findEmployee(employeeID) {
        return new Promise(async (resolve, reject) => {
            try {
                const employee = await Employee.findOne({
                    where: { employeeID },
                    include: [
                        {
                            model: Account,
                            as: 'account',
                            include: {
                                model: Role,
                                as: 'roles',
                                through: { attributes: [] },
                            },
                        },
                    ],
                });

                const { account, ...response } = employee.toJSON();

                if (employee)
                    resolve({
                        status: 'OK',
                        statusHttp: HTTP_OK,
                        message: 'Lấy nhân viên thành công',
                        employee: {
                            ...response,
                            statusWork: account.statusWork,
                        },
                    });
                else {
                    reject({
                        status: 'OK',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Nhân viên không tồn tại',
                    });
                }
            } catch (err) {
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
    findAllEmployee(adminId, page = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                const currentPage = Number.parseInt(page || 0) || 1;
                const { count, rows: employees } = await Employee.findAndCountAll({
                    where: {
                        employeeID: { [Op.ne]: adminId },
                        status: 'ACTIVE',
                    },
                    include: [
                        {
                            model: Account,
                            as: 'account',
                            include: [
                                {
                                    model: Role,
                                    as: 'roles',
                                    through: { attributes: [] },
                                },
                            ],
                        },
                    ],
                    limit: LIMIT_PAGE,
                    offset: (currentPage - 1) * LIMIT_PAGE,
                });
                const totalPages = Math.ceil(count / LIMIT_PAGE);
                const responseEmployee = [];
                employees.forEach((emp) => {
                    const { account, ...response } = emp.toJSON();
                    const { roles, ...restAccount } = account;
                    responseEmployee.push({ ...response, statusWork: account.statusWork, roles });
                });

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách nhân viên thành công',
                    employees: responseEmployee,
                    pagination: {
                        currentPage,
                        totalPages,
                    },
                });
            } catch (err) {
                console.log(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
    updateEmployee(employee) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const {
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
                    status,
                    roles,
                    warehouseID,
                } = employee;
                let updateEmployee = {
                    employeeID,
                    employeeName,
                    image,
                    cccd,
                    dob,
                    phoneNumber,
                    gender,
                    address,
                    startDate,
                    status,
                    roles,
                    warehouseID,
                };
                const checkExist = await Employee.findOne({
                    where: { employeeID },
                });
                if (!checkExist) {
                    resolve({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Nhân viên không tồn tại',
                    });
                }
                if (status == 'INACTIVE') {
                    if (!endDate) {
                        resolve({
                            status: 'ERR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: 'Ngày kết thúc bắt buộc khi nhân viên nghỉ việc',
                        });
                    } else {
                        updateEmployee.endDate = endDate;
                        const updateStatusAccount = await Account.update(
                            {
                                statusWork: status,
                            },
                            {
                                where: { employeeID },
                            },
                            { transaction },
                        );
                    }
                }
                const updateResponse = await Employee.update(
                    {
                        ...updateEmployee,
                    },
                    { where: { employeeID } },
                    { transaction },
                );

                const accountEmployee = await Account.findOne({ where: { employeeID } });
                const newRole = roles.map((roleItem) => Number.parseInt(roleItem.roleID));
                // update new role

                const updateRoleAccount = await accountEmployee.setRoles(newRole, { transaction });
                console.log('---check-update-success---');
                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Cập nhật thông tin nhân viên thành công',
                });
            } catch (err) {
                console.log(err);
                await transaction.rollback();
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
    searchEmployee(adminId, keyword) {
        return new Promise(async (resolve, reject) => {
            try {
                const currentPage = keyword?.page || 1;
                let where = {
                    [Op.and]: [
                        { employeeID: { [Op.ne]: adminId } }, // loại bỏ employeeID request
                    ],
                };
                if (keyword.employeeID) where.employeeID = { [Op.like]: `%${keyword.employeeID}%` };
                if (keyword.phoneNumber) where.phoneNumber = { [Op.like]: `%${keyword.phoneNumber}%` };
                if (keyword.status) where.status = keyword.status;
                console.log(where);
                const { count, rows: resultSearch } = await Employee.findAndCountAll({
                    where,
                    include: [
                        {
                            model: Account,
                            as: 'account',
                            include: [
                                {
                                    model: Role,
                                    as: 'roles',
                                    through: { attributes: [] }, // bỏ qua bảng phụ quan hệ nhiều nhiều
                                },
                            ],
                        },
                    ],
                    limit: LIMIT_PAGE,
                    offset: (currentPage - 1) * LIMIT_PAGE,
                });
                if (resultSearch) {
                    const totalPages = Math.ceil(count / LIMIT_PAGE);
                    const formatResultSearch = [];
                    resultSearch.forEach((emp) => {
                        console.log(emp);

                        const { account, ...response } = emp.toJSON();
                        const { roles, ...responseAccount } = account;
                        formatResultSearch.push({
                            ...response,
                            roles,
                            account,
                        });
                    });
                    resolve({
                        status: 'OK',
                        statusHttp: HTTP_OK,
                        message: 'Lọc danh sách thành công',
                        employeeFilter: formatResultSearch,
                        pagination: {
                            currentPage: Number.parseInt(currentPage),
                            totalPages,
                        },
                    });
                }
                //console.log(1)
            } catch (err) {
                console.log(err);
                //console.log(3);
                // throw err
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
}

module.exports = new EmployeeService();
