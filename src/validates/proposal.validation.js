const { query, body } = require('express-validator');

const checkCreateProposal = [
    body('proposalID')
        .notEmpty()
        .withMessage('Proposal ID là bắt buộc')
        .bail()
        .isString()
        .withMessage('Proposal ID không hợp lệ'),
    body('employeeIDCreate')
        .notEmpty()
        .withMessage('Employee Create ID là bắt buộc')
        .bail()
        .isString()
        .withMessage('Employee Create ID không hợp lệ'),
    body('warehouseID')
        .notEmpty()
        .withMessage('Warehouse ID là bắt buộc')
        .bail()
        .isString()
        .withMessage('Warehouse ID không hợp lệ'),
    body('proposalDetails')
        .isArray()
        .withMessage('Chi tiết đề xuất phải là một mảng')
        .bail()
        .custom((value) => {
            if (value.length === 0) {
                throw new Error('Chi tiết đề xuất không được để trống');
            }
            return true;
        }),
    body('proposalDetails.*.productID')
        .notEmpty()
        .withMessage('Mã sản phẩm là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã sản phẩm không hợp lệ'),

    body('proposalDetails.*.unitID')
        .notEmpty()
        .withMessage('Unit ID là bắt buộc')
        .bail()
        .isString()
        .withMessage('Unit ID không hợp lệ'),

    body('proposalDetails.*.quantity')
        .notEmpty()
        .withMessage('Số lượng là bắt buộc')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Số lượng phải là số nguyên tối thiểu là 1'),

    body('proposalDetails.*.note').optional().isString().withMessage('Ghi chú chi tiết không hợp lệ'),
];

// check update status proposal
const checkUpdateStatusProposal = [
    body('proposalID')
        .notEmpty()
        .withMessage('Proposal ID là bắt buộc')
        .bail()
        .isString()
        .withMessage('Proposal ID không hợp lệ'),
    body('employeeIDApproval')
        .notEmpty()
        .withMessage('Employee Approval ID là bắt buộc')
        .bail()
        .isString()
        .withMessage('Employee Approval ID không hợp lệ'),
    body('status')
        .notEmpty()
        .withMessage('Status là bắt buộc')
        .bail()
        .isIn(['PENDING', 'COMPLETED', 'REFUSE', 'APPROVED'])
        .withMessage('Status không nằm trong danh sách cho phép (PENDING, COMPLETED, REFUSE, APPROVED)'),
];

// update proposal detail
const checkUpdateProposalDetail = [
    body('proposalID')
        .notEmpty()
        .withMessage('Proposal ID là bắt buộc')
        .bail()
        .isString()
        .withMessage('Proposal ID không hợp lệ'),
    body('employeeIDCreate')
        .notEmpty()
        .withMessage('Employee Create ID là bắt buộc')
        .bail()
        .isString()
        .withMessage('Employee Create ID không hợp lệ'),
    body('proposalDetails')
        .isArray()
        .withMessage('Chi tiết đề xuất phải là một mảng')
        .bail()
        .custom((value) => {
            if (value.length === 0) {
                throw new Error('Chi tiết đề xuất không được để trống');
            }
            return true;
        }),
    body('proposalDetails.*.proposalDetailID')
        .notEmpty()
        .withMessage('Mã chi tiết là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã chi tiết không hợp lệ'),

    body('proposalDetails.*.productID')
        .notEmpty()
        .withMessage('Mã sản phẩm là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã sản phẩm không hợp lệ'),

    body('proposalDetails.*.unitID')
        .notEmpty()
        .withMessage('Unit ID là bắt buộc')
        .bail()
        .isString()
        .withMessage('Unit ID không hợp lệ'),

    body('proposalDetails.*.quantity')
        .notEmpty()
        .withMessage('Số lượng là bắt buộc')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Số lượng phải là số nguyên tối thiểu là 1'),

    body('proposalDetails.*.note').optional().isString().withMessage('Ghi chú chi tiết không hợp lệ'),
];

// check create order release proposal
const checkCreateOrderReleaseProposal = [
    body('orderReleaseProposalID')
        .notEmpty()
        .withMessage('Mã phiếu đễ xuất xuất kho là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã phiếu đễ xuất xuất kho không hợp lệ'),
    body('employeeIDCreate')
        .notEmpty()
        .withMessage('Mã nhân viên tạo phiếu là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã nhân viên tạo phiếu không hợp lệ'),
    body('customerID')
        .notEmpty()
        .withMessage('Mã khách hàng là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã khách hàng không hợp lệ'),
    body('warehouseID')
        .notEmpty()
        .withMessage('Mã kho là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã kho không hợp lệ'),
    body('status')
        .notEmpty()
        .withMessage('Trạng thái là bắt buộc')
        .bail()
        .isIn(['PENDING', 'COMPLETED', 'REFUSE'])
        .withMessage('Trạng thái không hợp lệ (PENDING, COMPLETED, REFUSE)'),
    body('orderReleaseProposalDetails.*.productID')
        .notEmpty()
        .withMessage('Mã sản phẩm là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã sản phẩm không hợp lệ'),
    body('orderReleaseProposalDetails.*.productName')
        .notEmpty()
        .withMessage('Tên sản phẩm là bắt buộc')
        .bail()
        .isString()
        .withMessage('Tên sản phẩm không hợp lệ'),
    body('orderReleaseProposalDetails.*.unitID')
        .notEmpty()
        .withMessage('Mã đơn vị xuất là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã đơn vị xuất không hợp lệ'),
    body('orderReleaseProposalDetails.*.amountRequiredExport')
        .notEmpty()
        .withMessage('Số lượng xuất là bắt buộc')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Số lượng xuất phải là số nguyên tối thiểu là 1'),
];

const checkStatusOrderReleaseProposal = [
    body('orderReleaseProposalID')
        .notEmpty()
        .withMessage('Mã phiếu đề xuất xuất kho là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã phiếu đề xuất xuất kho không hợp lệ'),
    body('employeeIDApproval')
        .notEmpty()
        .withMessage('Mã nhân viên phê duyệt là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã nhân viên phê duyệt phải là chuỗi'),
    body('status')
        .notEmpty()
        .withMessage('Trạng thái là bắt buộc')
        .bail()
        .isIn(['PENDING', 'COMPLETED', 'REFUSE'])
        .withMessage('Trạng thái không hợp lệ (PENDING, COMPLETED, REFUSE)'),
];

module.exports = {
    checkCreateProposal,
    checkUpdateStatusProposal,
    checkUpdateProposalDetail,
    checkCreateOrderReleaseProposal,
    checkStatusOrderReleaseProposal,
};
