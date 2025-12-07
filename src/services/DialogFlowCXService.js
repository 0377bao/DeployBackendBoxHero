const db = require('../../models/index');
const bcrypt = require('bcrypt');
const Account = db.Account;
const Employee = db.Employee;
const AccountRoles = db.AccountRoles;
const Role = db.Role;
const Product = db.Product;
const Batch = db.Batch;
const Box = db.Box;
const dotenv = require('dotenv');
const { detectIntent } = require('../utils/DialogFlowCxHelper');

const { v4: uuidv4 } = require('uuid');
const DashboardService = require('./DashboardService');
const ProposalService = require('./ProposalService');
const { generateCode } = require('../common');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

const sessionInfoStore = {}; // In-memory store for session info

function valueProtoToJson(proto) {
    if (!proto) return null;
    if (proto.stringValue !== undefined) return proto.stringValue;
    if (proto.numberValue !== undefined) return proto.numberValue;
    if (proto.boolValue !== undefined) return proto.boolValue;
    if (proto.structValue) return structProtoToJson(proto.structValue);
    if (proto.listValue) return (proto.listValue.values || []).map(valueProtoToJson);
    if (proto.nullValue !== undefined) return null;
    return null;
}

function structProtoToJson(proto) {
    if (!proto || !proto.fields) return {};
    const result = {};
    for (const key in proto.fields) {
        result[key] = valueProtoToJson(proto.fields[key]);
    }
    return result;
}

class DialogFlowCXService {
    checkInventoryProduct(productId) {
        return new Promise(async (resolve, reject) => {
            try {
                const product = await Product.findByPk(productId);
                if (!product) {
                    return resolve({
                        sessionInfo: {
                            parameters: {
                                inventory_status: 'NOT_FOUND',
                                product_code_not_found: productId,
                            },
                        },
                    });
                }
                return resolve({
                    sessionInfo: {
                        parameters: {
                            inventory_status: 'OK',
                            product_name: product.productName,
                            product_amount: product.amount,
                        },
                    },
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    batchOfProduct(productId) {
        return new Promise(async (resolve, reject) => {
            try {
                const product = await Product.findByPk(productId);
                if (!product) {
                    return resolve({
                        sessionInfo: {
                            parameters: {
                                batch_of_product_status: 'NOT_FOUND',
                                product_code_not_found: productId,
                            },
                        },
                    });
                }
                const batches = await Batch.findAll({
                    where: { productID: productId, remainAmount: { [db.Sequelize.Op.gt]: 0 } },
                    include: [
                        {
                            model: Box,
                            as: 'boxes',
                            attributes: ['boxID', 'boxName'],
                            through: { attributes: [] },
                            required: true,
                        },
                    ],
                });

                if (batches.length === 0) {
                    return resolve({
                        sessionInfo: {
                            parameters: {
                                batch_of_product_status: 'OK',
                                product_code_found: productId,
                                batches_list_formatted: `Không có lô hàng nào cho sản phẩm với mã là ${productId}.`,
                            },
                        },
                    });
                } else {
                    const batchDetails = batches
                        .map(
                            (batch) =>
                                `- Lô ${batch.batchID}: Ngày sản xuất ${
                                    batch.manufactureDate.toISOString().split('T')[0]
                                }, Ngày hết hạn ${batch.expiryDate.toISOString().split('T')[0]}, Số lượng còn lại ${
                                    batch.remainAmount
                                }, Ô chứa: ${batch.boxes.map((box) => box.boxName).join(', ')}
                            `,
                        )
                        .join('\n');

                    return resolve({
                        sessionInfo: {
                            parameters: {
                                batch_of_product_status: 'OK',
                                product_code_found: productId,
                                batches_list_formatted: `Các lô hàng chứa"${productId}":\n\n` + batchDetails,
                            },
                        },
                    });
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    productAboutToExpire(days = 30) {
        return new Promise(async (resolve, reject) => {
            try {
                const now = new Date();
                const toDate = new Date();
                toDate.setDate(toDate.getDate() + days);
                const batches = await Batch.findAll({
                    where: {
                        status: 'AVAILABLE',
                        remainAmount: { [Op.gt]: 0 },
                        expiryDate: {
                            [Op.gt]: now,
                            [Op.lte]: toDate,
                        },
                    },
                    include: [
                        {
                            model: Box,
                            as: 'boxes',
                            attributes: ['boxID', 'boxName'],
                            through: { attributes: [] },
                            required: true,
                        },
                    ],
                });

                if (batches.length === 0) {
                    return resolve({
                        sessionInfo: {
                            parameters: {
                                batches_soon_expired: `Không có lô hàng nào sắp hết hạn trong vòng ${days} ngày tới.`,
                            },
                        },
                    });
                } else {
                    const batchDetails = batches
                        .map(
                            (batch) =>
                                `- Lô ${batch.batchID}: Ngày sản xuất ${
                                    batch.manufactureDate.toISOString().split('T')[0]
                                }, Ngày hết hạn ${batch.expiryDate.toISOString().split('T')[0]}, Số lượng còn lại ${
                                    batch.remainAmount
                                }, Ô chứa: ${batch.boxes.map((box) => box.boxName).join(', ')}
                            `,
                        )
                        .join('\n');

                    return resolve({
                        sessionInfo: {
                            parameters: {
                                batches_soon_expired:
                                    `Các lô hàng sắp hết hạn trong vòng ${days} ngày tới:\n\n` + batchDetails,
                            },
                        },
                    });
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    inventoryLow() {
        return new Promise(async (resolve, reject) => {
            try {
                const lowInventoryProducts = await DashboardService.getStaticProductHasLowStock({});

                if (lowInventoryProducts.data.length === 0) {
                    return resolve({
                        sessionInfo: {
                            parameters: {
                                low_inventory_result: `Không có sản phẩm nào có tồn kho thấp.\n\nTôi có thể làm gì khác cho bạn không?`,
                            },
                        },
                    });
                } else {
                    const lowInventoryDetails = lowInventoryProducts.data
                        .map(
                            (product) =>
                                `- Sản phẩm ${product.productID}: ${product.productName}, Tồn kho hiện tại: ${product.amount}
                            `,
                        )
                        .join('\n');

                    return resolve({
                        sessionInfo: {
                            parameters: {
                                low_inventory_result:
                                    `Các sản phẩm có tồn kho thấp:\n\n` +
                                    lowInventoryDetails +
                                    `\nBạn có muốn tôi tạo giúp bạn phiếu đề xuất nhập các sản phẩm này không?`,
                                proposal_suggested: lowInventoryProducts.data.map((p) => p.productID),
                            },
                        },
                    });
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    createProposalForInventoryLow(employee_code, number_proposal, proposal_suggested) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = {
                    proposalID: generateCode('PDX-'),
                    employeeIDCreate: employee_code,
                    warehouseID: 'WH1',
                    note: '',
                    proposalDetails: proposal_suggested.map((it) => ({
                        productID: it,
                        unitID: '1',
                        quantity: number_proposal,
                    })),
                };

                const createResult = await ProposalService.createProposal(data);
                if (createResult.statusHttp === HTTP_OK) {
                    return resolve({
                        sessionInfo: {
                            parameters: {
                                create_proposal_result: `Tác vụ hoàn tất.Tôi đã tạo phiếu đề xuất thành công với ID: ${createResult.proposal.proposalID}`,
                            },
                        },
                    });
                } else {
                    return resolve({
                        sessionInfo: {
                            parameters: {
                                create_proposal_result: `Tôi không thể tạo phiếu đề xuất vào lúc này. Vui lòng thử lại sau.`,
                            },
                        },
                    });
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    initUserSession(employeeID, accessToken) {
        return new Promise(async (resolve, reject) => {
            try {
                let userInfo = null;
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
                userInfo = {
                    employeeID: employee.employeeID,
                    employeeName: employee.employeeName,
                };
                const sessionId = uuidv4();
                userInfo.isAdmin = employee.account.roles.some(
                    (role) => role.roleName === 'SYSTEM_ADMIN' || role.roleName === 'WARE_MANAGER',
                );

                userInfo.isStockReceiver = employee.account.roles.some((role) => role.roleName === 'STOCK_RECEIVER');

                userInfo.isStockDispatcher = employee.account.roles.some(
                    (role) => role.roleName === 'STOCK_DISPATCHER',
                );

                userInfo.isAccountant = employee.account.roles.some((role) => role.roleName === 'ACCOUNTANT');

                sessionInfoStore[sessionId] = {
                    accessToken: accessToken,
                    ...userInfo,
                };
                await detectIntent('Initial User', sessionId);

                return resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    sessionId: sessionId,
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    default() {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve({
                    statusHttp: HTTP_OK,
                    fulfillment_response: {
                        messages: [
                            {
                                text: {
                                    text: ['Default response from DialogFlowCXService.'],
                                },
                            },
                        ],
                    },
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    chatWithDialogFlowCX(message, sessionId) {
        return new Promise(async (resolve, reject) => {
            try {
                const dfResponse = await detectIntent(message, sessionId);
                const frontendMessages = [];

                for (const msg of dfResponse.queryResult.responseMessages) {
                    // --- XỬ LÝ TEXT (Phần này của bạn đã đúng) ---
                    if (msg.text && msg.text.text) {
                        for (const txt of msg.text.text) {
                            if (txt) {
                                frontendMessages.push({
                                    from: 'bot',
                                    type: 'text',
                                    text: txt,
                                });
                            }
                        }
                    }

                    // --- XỬ LÝ PAYLOAD (Phần này đã được sửa) ---
                    if (msg.payload && msg.payload.fields) {
                        const payload = msg.payload.fields;

                        // 1. Kiểm tra richContent
                        if (
                            payload.richContent &&
                            payload.richContent.listValue &&
                            payload.richContent.listValue.values
                        ) {
                            // 2. Lặp qua các 'row'
                            for (const row of payload.richContent.listValue.values) {
                                // 3. Lặp qua các 'item' trong row
                                if (row.listValue && row.listValue.values) {
                                    for (const item of row.listValue.values) {
                                        // 4. Lấy 'fields' từ 'structValue' của item
                                        const itemFields = item.structValue.fields;

                                        // 5. Lấy 'type' và 'options' một cách an toàn
                                        const itemType = itemFields.type?.stringValue;
                                        const itemOptionsArray = itemFields.options?.listValue?.values; // Đây là mảng các options

                                        // 6. Kiểm tra đúng 'type' và 'options'
                                        if (itemType === 'chips' && itemOptionsArray) {
                                            // 7. Map mảng 'itemOptionsArray'
                                            const buttons = itemOptionsArray.map((opt) => {
                                                // 8. Lấy 'text' từ structValue của mỗi option
                                                const optText = opt.structValue.fields.text?.stringValue;
                                                return {
                                                    label: optText,
                                                    value: optText, // Dùng text làm value
                                                };
                                            });

                                            frontendMessages.push({
                                                from: 'bot',
                                                type: 'buttons',
                                                buttons: buttons,
                                            });
                                        } else if (itemType === 'action' && itemOptionsArray) {
                                            const buttons = itemOptionsArray.map((opt) => {
                                                const fields = opt.structValue?.fields;
                                                if (!fields) return {};

                                                const label = fields.label?.stringValue;
                                                const payload = fields.payload
                                                    ? valueProtoToJson(fields.payload)
                                                    : null;

                                                return {
                                                    label,
                                                    payload,
                                                };
                                            });

                                            frontendMessages.push({
                                                from: 'bot',
                                                type: 'actions',
                                                actions: buttons,
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // --- KẾT QUẢ TRẢ VỀ (Sửa lại theo yêu cầu ban đầu) ---
                return resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    message: `Nhắn tin tới DialogFlow CX thành công.`,
                    sessionId: sessionId,
                    data: frontendMessages,
                });
            } catch (e) {
                console.log(e);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
    initUserSessionViaWebhook(sessionIdFromDF) {
        return new Promise(async (resolve, reject) => {
            try {
                const userInfo = sessionInfoStore[sessionIdFromDF];
                // delete sessionInfoStore[sessionIdFromDF]; // Optional: remove session info after use
                delete sessionInfoStore[sessionIdFromDF];

                return resolve({
                    sessionInfo: {
                        parameters: userInfo,
                    },
                });
            } catch (e) {
                console.log(e);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
}

module.exports = new DialogFlowCXService();
