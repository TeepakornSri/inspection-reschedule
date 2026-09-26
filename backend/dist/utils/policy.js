"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNeedManager = checkNeedManager;
function checkNeedManager(criticality, originalDueDate, newDueDate, approvedCount) {
    if (criticality !== 'A')
        return false;
    const maxDate = new Date(originalDueDate);
    maxDate.setUTCDate(maxDate.getUTCDate() + 30);
    if (newDueDate > maxDate)
        return true;
    if (approvedCount >= 1)
        return true;
    return false;
}
//# sourceMappingURL=policy.js.map