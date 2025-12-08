const dotenv = require('dotenv');
const db = require('../../models');
const { Op, fn, col, where, literal } = require('sequelize');
const { generateBatchID, generateQRURL } = require('../common');
const Proposal = db.Proposal;
const Employee = db.Employee;
const Product = db.Product;
const Warehouse = db.Warehouse;
const Unit = db.Unit;
const ProposalDetail = db.ProposalDetail;
const OrderPurchase = db.OrderPurchase;
const sequelize = db.sequelize;
const Customer = db.Customer;
const OrderReleaseProposalDetail = db.OrderReleaseProposalDetail;
const OrderReleaseProposal = db.OrderReleaseProposal;
const OrderRelease = db.OrderRelease;
const BaseUnitProduct = db.BaseUnitProduct;
const Batch = db.Batch;

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_FORBIDDEN = process.env.HTTP_FORBIDDEN;
//const LIMIT_PAGE = parseInt(process.env.LIMIT_PAGE, 10);
const LIMIT_PAGE = 5;

class ProposalService {
    // create proposal
    createProposal(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const newProposal = await Proposal.create({ ...data, status: 'PENDING' }, { transaction });
                // create proposal detail
                await ProposalDetail.bulkCreate(
                    data.proposalDetails.map((item) => ({
                        ...item,
                        proposalID: newProposal.proposalID,
                    })),
                    { transaction },
                );
                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Tạo đề xuất thành công',
                    proposal: newProposal,
                });
            } catch (err) {
                await transaction.rollback();
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    // update proposal status
    updateStatusProposal(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const proposal = await Proposal.findOne({
                    where: { proposalID: data.proposalID },
                });
                const proposalDetails = await ProposalDetail.findAll({
                    where: { proposalID: data.proposalID },
                });
                if (!proposal) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Không tìm thấy đề xuất',
                    });
                }
                let message = '';
                if (data.status === 'APPROVED') {
                    message = 'Đề xuất đã được phê duyệt';
                    const batchMaxLength = await Batch.findAll({
                        attributes: ['batchID'],
                        order: [['batchID', 'DESC']],
                        limit: 1,
                        transaction,
                    });

                    let maxNumber = parseInt(batchMaxLength[0]?.batchID ? batchMaxLength[0]?.batchID.slice(1) : 0);

                    // update batchID for proposal detail
                    for (let index = 0; index < proposalDetails.length; index++) {
                        maxNumber += 1;
                        const proposalDetail = proposalDetails[index];

                        const batchID = generateBatchID('B', parseInt(maxNumber));

                        const qrCode = await generateQRURL(batchID);

                        const newBatch = await Batch.create(
                            {
                                batchID,
                                productID: proposalDetail.productID,
                                unitID: proposalDetail.unitID,
                                warehouseID: proposal.warehouseID,
                                status: 'WAITING_IMPORT',
                                qrCode,
                            },
                            { transaction },
                        );

                        await ProposalDetail.update(
                            {
                                batchIDQR: newBatch.qrCode,
                                batchID: newBatch.batchID,
                            },
                            {
                                where: { proposalDetailID: proposalDetail.proposalDetailID },
                                transaction,
                            },
                        );
                    }

                    // update qrCode for proposal
                    const qrCode = await generateQRURL(proposal.proposalID);
                    proposal.qrCode = qrCode;
                }
                if (data.status === 'REFUSE') {
                    message = 'Đề xuất đã bị từ chối';
                }
                // update proposal
                proposal.status = data.status;
                proposal.approverID = data.employeeIDApproval;
                await proposal.save({ transaction });

                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message,
                    proposal,
                });
            } catch (err) {
                await transaction.rollback();
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    // update proposal detail
    updateProposalDetail(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const proposal = await Proposal.findOne({
                    where: { proposalID: data.proposalID },
                });
                if (!proposal) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Không tìm thấy đề xuất',
                    });
                }
                if (data.employeeIDCreate !== proposal.employeeIDCreate) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_FORBIDDEN,
                        message: 'Bạn không phải người tạo đề xuất này',
                    });
                }
                if (proposal.status !== 'PENDING') {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_FORBIDDEN,
                        message: 'Chỉ có thể cập nhật khi đề xuất đang chờ duyệt',
                    });
                }
                // update proposal detail
                // xóa hết detail cũ
                await ProposalDetail.destroy({
                    where: { proposalID: data.proposalID },
                    transaction,
                });
                // thêm lại detail mới
                await ProposalDetail.bulkCreate(
                    data.proposalDetails.map((item) => ({
                        ...item,
                        proposalID: data.proposalID,
                    })),
                    { transaction },
                );

                // Lấy lại proposal kèm danh sách detail
                const updatedProposal = await Proposal.findOne({
                    where: { proposalID: data.proposalID },
                    include: [
                        {
                            model: ProposalDetail,
                            as: 'proposalDetails', // phải đúng alias
                            include: [
                                { model: Product, as: 'product' },
                                { model: Unit, as: 'unit' },
                            ],
                        },
                        { model: Employee, as: 'employeeCreate' },
                        { model: Employee, as: 'approver' },
                        { model: Warehouse, as: 'warehouse' },
                    ],
                    transaction,
                });

                await transaction.commit();

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Cập nhật chi tiết đề xuất thành công',
                    proposal: updatedProposal,
                });
            } catch (err) {
                await transaction.rollback();
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    // get proposal by warehouseID
    getProposalByWarehouse(warehouseID, page) {
        return new Promise(async (resolve, reject) => {
            try {
                let options = {
                    where: { warehouseID: warehouseID },
                    include: [
                        {
                            model: ProposalDetail,
                            as: 'proposalDetails',
                            include: [
                                { model: Product, as: 'product' },
                                { model: Unit, as: 'unit' },
                                { model: Batch, as: 'batch', attributes: ['qrCode'] },
                            ],
                        },
                        { model: Employee, as: 'employeeCreate' },
                        { model: Employee, as: 'approver' },
                        { model: Warehouse, as: 'warehouse' },
                    ],
                    order: [['createdAt', 'DESC']], // để bản mới nhất lên trước
                };

                if (page) {
                    const offset = (page - 1) * LIMIT_PAGE;

                    options.limit = LIMIT_PAGE;
                    options.offset = offset;
                }

                const proposals = await Proposal.findAll(options);
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách đề xuất theo kho thành công',
                    proposals,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    getProposalByEmployee(employeeID, page) {
        return new Promise(async (resolve, reject) => {
            try {
                let options = {
                    where: { employeeIDCreate: employeeID },
                    include: [
                        {
                            model: ProposalDetail,
                            as: 'proposalDetails',
                            include: [
                                { model: Product, as: 'product' },
                                { model: Unit, as: 'unit' },
                            ],
                        },
                        { model: Employee, as: 'employeeCreate' },
                        { model: Employee, as: 'approver' },
                        { model: Warehouse, as: 'warehouse' },
                    ],
                    order: [['createdAt', 'DESC']], // để bản mới nhất lên trước
                };

                if (page) {
                    const offset = (page - 1) * LIMIT_PAGE;

                    options.limit = LIMIT_PAGE;
                    options.offset = offset;
                }

                const proposals = await Proposal.findAll(options);
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách đề xuất theo nhân viên thành công',
                    proposals,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    getProposalDetail(proposalID) {
        return new Promise(async (resolve, reject) => {
            try {
                let options = {
                    where: { proposalID: proposalID },
                    include: [
                        {
                            model: ProposalDetail,
                            as: 'proposalDetails',
                            include: [
                                { model: Product, as: 'product' },
                                { model: Unit, as: 'unit' },
                                { model: Batch, as: 'batch', attributes: ['qrCode'] },
                            ],
                        },
                        { model: Employee, as: 'employeeCreate' },
                        { model: Employee, as: 'approver' },
                        { model: Warehouse, as: 'warehouse' },
                    ],
                    order: [['createdAt', 'DESC']], // để bản mới nhất lên trước
                };

                const proposal = await Proposal.findByPk(proposalID, {
                    include: [
                        {
                            model: ProposalDetail,
                            as: 'proposalDetails',
                            include: [
                                { model: Product, as: 'product' },
                                { model: Unit, as: 'unit' },
                                { model: Batch, as: 'batch', attributes: ['qrCode', 'batchID'] },
                            ],
                        },
                        { model: Employee, as: 'employeeCreate' },
                        { model: Employee, as: 'approver' },
                        { model: Warehouse, as: 'warehouse' },
                    ],
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy chi tiết đề xuất thành công',
                    proposal,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    // filter proposal
    filterProposal(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const limit = 5;
                const {
                    proposalID,
                    warehouseID,
                    status,
                    page = 1,
                    employeeName: employeeIDCreate,
                    employeeIDApproval,
                    updatedAt,
                    createdAt,
                } = data;

                let options = {
                    where: {},
                    include: [
                        {
                            model: ProposalDetail,
                            as: 'proposalDetails',
                            include: [
                                { model: Product, as: 'product' },
                                { model: Unit, as: 'unit' },
                            ],
                        },
                        { model: Employee, as: 'employeeCreate' },
                        { model: Employee, as: 'approver' },
                        { model: Warehouse, as: 'warehouse' },
                    ],
                    order: [['createdAt', 'DESC']],
                    limit,
                    offset: (page - 1) * limit,
                };

                // Thêm điều kiện lọc
                if (proposalID) {
                    options.where.proposalID = proposalID;
                }

                if (warehouseID) {
                    options.where.warehouseID = warehouseID;
                }

                if (employeeIDCreate) {
                    options.where.employeeIDCreate = employeeIDCreate;
                }

                if (status) {
                    options.where.status = status;
                }

                if (employeeIDApproval) {
                    options.where.employeeIDApproval = employeeIDApproval;
                }

                // So sánh ngày (bỏ thời gian)
                if (updatedAt) {
                    options.where = {
                        ...options.where,
                        [Op.and]: [
                            ...(options.where[Op.and] || []),
                            where(fn('DATE', col('Proposal.updatedAt')), updatedAt),
                        ],
                    };
                }

                if (createdAt) {
                    options.where = {
                        ...options.where,
                        [Op.and]: [
                            ...(options.where[Op.and] || []),
                            where(fn('DATE', col('Proposal.createdAt')), createdAt),
                        ],
                    };
                }

                const proposals = await Proposal.findAll(options);

                const total = await db.Proposal.count({ where: options.where });

                const totalPages = Math.ceil(total / limit);

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách đề xuất theo bộ lọc thành công',
                    proposals,
                    pagination: {
                        currentPage: page,
                        totalPages,
                    },
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err.message || 'Lỗi không xác định',
                });
            }
        });
    }

    // get proposal missing (status = APPROVED but not have stock receipt)
    getProposalMissing({ warehouseID }) {
        return new Promise(async (resolve, reject) => {
            try {
                const proposals = await Proposal.findAll({
                    where: {
                        status: 'APPROVED',
                        warehouseID,
                        proposalID: {
                            [Op.notIn]: sequelize.literal(
                                '(SELECT proposalID FROM order_purchase WHERE proposalID IS NOT NULL)',
                            ),
                        },
                    },
                    include: [
                        {
                            model: ProposalDetail,
                            as: 'proposalDetails',
                            include: [
                                { model: Product, as: 'product' },
                                { model: Unit, as: 'unit' },
                            ],
                        },
                        { model: Employee, as: 'employeeCreate' },
                        { model: Employee, as: 'approver' },
                        { model: Warehouse, as: 'warehouse' },
                    ],
                    order: [['createdAt', 'DESC']], // để bản mới nhất lên trước
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách đề xuất thiếu thành công',
                    proposals,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
    // create order realease proposal
    createOrderReleaseProposal(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { customerID } = data;
                const checkCustomerExist = await Customer.findOne({ where: { customerID } });
                if (!checkCustomerExist) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Khách hàng không tồn tại',
                    });
                }
                const newProposal = await db.OrderReleaseProposal.create(
                    {
                        orderReleaseProposalID: data.orderReleaseProposalID,
                        employeeIDCreate: data.employeeIDCreate,
                        approverID: null,
                        customerID: data.customerID,
                        warehouseID: data.warehouseID,
                        note: null,
                        status: 'PENDING',
                    },
                    { transaction },
                );
                // create proposal detail

                await db.OrderReleaseProposalDetail.bulkCreate(
                    data.orderReleaseProposalDetails.map((item) => ({
                        ...item,
                        orderReleaseProposalID: newProposal.orderReleaseProposalID,
                    })),
                    { transaction },
                );
                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Tạo đề xuất xuất hàng thành công',
                    proposal: newProposal,
                });
            } catch (err) {
                await transaction.rollback();
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
    // get all order release proposal
    getAllOrderReleaseProposal(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const currentPage = data?.page || 1;
                const whereClause = {};
                if (data?.orderReleaseProposalID) whereClause.orderReleaseProposalID = data.orderReleaseProposalID;
                if (data?.createdAt)
                    whereClause[Op.and] = [
                        ...(whereClause[Op.and] || []),
                        where(fn('DATE', col('OrderReleaseProposal.createdAt')), data.createdAt),
                    ];
                if (data?.status) {
                    whereClause.status = data.status;
                }
                if (data?.employeeIDCreate) whereClause.employeeIDCreate = data.employeeIDCreate;

                const orderProposalsRelease =
                    (await OrderReleaseProposal.findAll({
                        where: {
                            ...whereClause,
                        },
                        include: [
                            {
                                model: Employee,
                                as: 'creator',
                                attributes: ['employeeID', 'employeeName'],
                            },
                            {
                                model: Employee,
                                as: 'approver',
                                attributes: ['employeeID', 'employeeName'],
                            },
                            {
                                model: Warehouse,
                                as: 'warehouse',
                                attributes: ['warehouseID', 'warehouseName'],
                            },
                            {
                                model: OrderReleaseProposalDetail,
                                as: 'orderReleaseProposalDetails',
                                attributes: ['productID', 'productName', 'note'],
                                include: [
                                    {
                                        model: Product,
                                        as: 'product',
                                        attributes: ['image'],
                                        include: [
                                            {
                                                model: BaseUnitProduct,
                                                as: 'baseUnitProducts',
                                                attributes: ['baseUnitName'],
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                model: Customer,
                                as: 'customer',
                                attributes: ['customerID', 'customerName'],
                            },
                        ],
                        order: [['createdAt', 'DESC']],
                        limit: LIMIT_PAGE,
                        offset: (currentPage - 1) * LIMIT_PAGE,
                    })) || [];

                const totalRecord = await OrderReleaseProposal.count({ where: whereClause });
                const totalPages = Math.ceil(totalRecord / LIMIT_PAGE);
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách đề xuất xuất hàng thành công',
                    data: orderProposalsRelease,
                    pagination: {
                        currentPage: Number.parseInt(currentPage),
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
    // get order release proposal detail by id
    getOrderProposalReleaseDetailByID(orderReleaseProposalID) {
        return new Promise(async (resolve, reject) => {
            try {
                const orderReleaseProposalDetail = await OrderReleaseProposal.findOne({
                    where: { orderReleaseProposalID },
                    include: [
                        {
                            model: OrderReleaseProposalDetail,
                            as: 'orderReleaseProposalDetails',
                            include: [
                                {
                                    model: Product,
                                    as: 'product',
                                    attributes: ['productID', 'productName'],
                                    include: [
                                        {
                                            model: BaseUnitProduct,
                                            as: 'baseUnitProducts',
                                            attributes: ['baseUnitName'],
                                        },
                                    ],
                                },
                                {
                                    model: Unit,
                                    as: 'unit',
                                    attributes: ['unitName'],
                                },
                            ],
                        },
                        {
                            model: Customer,
                            as: 'customer',
                            attributes: ['customerID', 'customerName'],
                        },
                        {
                            model: Warehouse,
                            as: 'warehouse',
                            attributes: ['warehouseID', 'warehouseName'],
                        },
                        {
                            model: Employee,
                            as: 'creator',
                            attributes: ['employeeID', 'employeeName'],
                        },
                        {
                            model: Employee,
                            as: 'approver',
                            attributes: ['employeeID', 'employeeName'],
                        },
                    ],
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy chi tiết đề xuất xuất hàng thành công',
                    data: orderReleaseProposalDetail,
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
    approveOrderReleaseProposal(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const checkOrderReleaseProposalExist = await OrderReleaseProposal.findOne({
                    where: { orderReleaseProposalID: data.orderReleaseProposalID },
                });

                if (!checkOrderReleaseProposalExist) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Đề xuất xuất hàng không tồn tại',
                    });
                }

                const updateOrderReleaseProposal = await OrderReleaseProposal.update(
                    {
                        status: data.status,
                        approverID: data.employeeIDApproval,
                    },
                    { where: { orderReleaseProposalID: data.orderReleaseProposalID }, transaction },
                );
                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Cập nhật trạng thái đề xuất xuất hàng thành công',
                    data: updateOrderReleaseProposal,
                });
            } catch (err) {
                await transaction.rollback();
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
    searchOrderReleaseProposal(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const option = {};
                if (data.status) option.status = data.status;
                if (data.orderReleaseProposalID) option.orderReleaseProposalID = data.orderReleaseProposalID;

                const orderReleaseProposals = await OrderReleaseProposal.findAll({
                    where: {
                        ...option,
                    },
                    include: [
                        {
                            model: Employee,
                            as: 'creator',
                            attributes: ['employeeID', 'employeeName'],
                        },
                        {
                            model: Employee,
                            as: 'approver',
                            attributes: ['employeeID', 'employeeName'],
                        },
                        {
                            model: Customer,
                            as: 'customer',
                            attributes: ['customerID', 'customerName'],
                        },
                        {
                            model: OrderReleaseProposalDetail,
                            as: 'orderReleaseProposalDetails',
                            attributes: ['productID', 'productName', 'note'],
                        },
                    ],
                    order: [['createdAt', 'DESC']],
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Tìm kiếm phiếu đề xuất xuất hàng thành công',
                    data: orderReleaseProposals,
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
    getOrderReleaseProposalCanApply() {
        return new Promise(async (resolve, reject) => {
            try {
                const orderReleaseProposals = await OrderReleaseProposal.findAll({
                    where: {
                        status: 'COMPLETED',
                        orderReleaseProposalID: {
                            [Op.notIn]: literal(`(
                                SELECT orderReleaseProposalID FROM order_release AS o
                                WHERE o.orderReleaseProposalID is NOT NULL
                                )`),
                        },
                    },
                    include: [
                        {
                            model: Employee,
                            as: 'creator',
                            attributes: ['employeeID', 'employeeName'],
                        },
                        {
                            model: Employee,
                            as: 'approver',
                            attributes: ['employeeID', 'employeeName'],
                        },
                        {
                            model: Customer,
                            as: 'customer',
                            attributes: ['customerID', 'customerName'],
                        },
                        {
                            model: OrderReleaseProposalDetail,
                            as: 'orderReleaseProposalDetails',
                            include: [
                                {
                                    model: Unit,
                                    as: 'unit',
                                    attributes: ['unitID', 'unitName'],
                                },
                            ],
                            attributes: ['productID', 'productName', 'amountRequiredExport', 'note'],
                        },
                    ],
                    order: [['createdAt', 'DESC']],
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Tìm kiếm phiếu đề xuất xuất hàng thành công',
                    data: orderReleaseProposals,
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
}

module.exports = new ProposalService();
