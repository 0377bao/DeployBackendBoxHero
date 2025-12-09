const db = require('../../models');
const dotenv = require('dotenv');
const Customer = db.Customer;
const OrderRelease = db.OrderRelease;
const OrderReleaseDetail = db.OrderReleaseDetail;
const OrderReleaseBatchBoxDetail = db.OrderReleaseBatchBoxDetail;
const BaseUnitProduct = db.BaseUnitProduct;
const Employee = db.Employee;
const Product = db.Product;
const Batch = db.Batch;
const Unit = db.Unit;
const Warehouse = db.Warehouse;
const { Op } = require('sequelize');
dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;

const LIMIT_PAGE = 5;

class CustomerService {
    async getAllCustomers(page = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                const currentPage = Number.parseInt(page || 0) || 1;
                const { count, rows: customers } = await Customer.findAndCountAll({
                    limit: LIMIT_PAGE,
                    offset: (currentPage - 1) * LIMIT_PAGE,
                });
                const totalPages = Math.ceil(count / LIMIT_PAGE);
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: customers,
                    pagination: {
                        currentPage,
                        totalPages,
                    },
                });
            } catch (error) {
                console.error(error);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Không thể lấy danh sách khách hàng',
                });
            }
        });
    }
    async findCustomerById(customerID) {
        return await new Promise(async (resolve, reject) => {
            try {
                const customer = await Customer.findByPk(customerID);
                if (!customer) {
                    reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Khách hàng không tồn tại',
                    });
                    return;
                }
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: customer,
                });
            } catch (error) {
                console.error(error);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi khi lấy thông tin khách hàng',
                });
            }
        });
    }
    async filterCustomer(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const whereClause = {};
                if (data?.customerID) whereClause.customerID = data.customerID;
                if (data?.customerName) whereClause.customerName = { [Op.like]: `%${data.customerName}%` };
                if (data?.customerPhone) whereClause.phone = { [Op.like]: `%${data.customerPhone}%` };
                if (data?.email) whereClause.email = data.email;

                const customers = await Customer.findAll({ where: whereClause });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: customers,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi khi lọc khách hàng',
                });
            }
        });
    }
    async getHistoryOrderOfCustomer(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const { customerID, page = 1 } = data;
                const { count, rows: history } = await OrderRelease.findAndCountAll({
                    where: { customerID, status: 'COMPLETED' },
                    include: [
                        {
                            model: OrderReleaseDetail,
                            as: 'orderReleaseDetails',
                            include: [
                                {
                                    model: OrderReleaseBatchBoxDetail,
                                    as: 'orderReleaseBatchBoxDetails',
                                },
                                {
                                    model: Batch,
                                    as: 'batch',
                                    // attributes: ['batchID', 'productID'],
                                    include: [
                                        {
                                            model: Product,
                                            as: 'product',
                                            attributes: ['productID', 'productName'],
                                            include: [
                                                {
                                                    model: BaseUnitProduct,
                                                    as: 'baseUnitProducts',
                                                    attributes: ['baseUnitProductID', 'baseUnitName'],
                                                },
                                            ],
                                        },
                                        {
                                            model: Unit,
                                            as: 'unit',
                                            attributes: ['unitID', 'unitName'],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: Employee,
                            as: 'employees',
                        },
                        {
                            model: Customer,
                            as: 'customers',
                        },
                        {
                            model: Warehouse,
                            as: 'warehouses',
                            attributes: ['warehouseID', 'warehouseName'],
                        },
                    ],
                    distinct: true,
                });

                const totalPages = Math.ceil(count / LIMIT_PAGE);

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách lịch sử của khách hàng thành công',
                    data: history,
                    pagination: {
                        currentPage: page,
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
    async getAllCustomersNotPagination() {
        return new Promise(async (resolve, reject) => {
            try {
                const customers = await Customer.findAll();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách khách hàng thành công',
                    data: customers,
                });
            } catch (error) {
                console.error(error);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Không thể lấy danh sách khách hàng',
                });
            }
        });
    }
}

module.exports = new CustomerService();
