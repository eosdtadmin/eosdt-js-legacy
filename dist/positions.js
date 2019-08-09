"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const utils_1 = require("./utils");
class PositionsContract {
    constructor(connector) {
        this.eos = connector.eos;
        this.contractName = "eosdtcntract";
    }
    getOptions(account) {
        return {
            authorization: [`${account.name}@${account.authority || "active"}`],
            sign: true,
            broadcast: true
        };
    }
    create(accountName, eosAmount, eosdtAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            eosAmount = utils_1.toBigNumber(eosAmount);
            const roundedDebtAmount = utils_1.toBigNumber(eosdtAmount).dp(4, 1);
            const receipt = yield this.eos.transaction({
                actions: [
                    {
                        account: this.contractName,
                        name: "positionadd",
                        authorization: [{ actor: accountName, permission: "active" }],
                        data: {
                            maker: accountName
                        }
                    },
                    {
                        account: "eosio.token",
                        name: "transfer",
                        authorization: [{ actor: accountName, permission: "active" }],
                        data: {
                            from: accountName,
                            to: this.contractName,
                            quantity: `${eosAmount.toFixed(4)} EOS`,
                            memo: `${roundedDebtAmount.toFixed(9)} EOSDT`
                        }
                    }
                ]
            }, this.getOptions({ name: accountName }));
            return receipt;
        });
    }
    close(senderAccount, positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const receipt = yield this.eos.transaction({
                actions: [
                    {
                        account: this.contractName,
                        name: "close",
                        authorization: [{ actor: senderAccount, permission: "active" }],
                        data: { position_id: positionId }
                    }
                ]
            }, this.getOptions({ name: senderAccount }));
            return receipt;
        });
    }
    del(creator, positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const receipt = yield this.eos.transaction({
                actions: [
                    {
                        account: this.contractName,
                        name: "positiondel",
                        authorization: [{ actor: creator, permission: "active" }],
                        data: { position_id: positionId }
                    }
                ]
            }, this.getOptions({ name: creator }));
            return receipt;
        });
    }
    give(account, receiver, positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const receipt = yield this.eos.transaction({
                actions: [
                    {
                        account: this.contractName,
                        name: "positiongive",
                        authorization: [{ actor: account, permission: "active" }],
                        data: {
                            position_id: positionId,
                            to: receiver
                        }
                    }
                ]
            }, this.getOptions({ name: account }));
            return receipt;
        });
    }
    addCollateral(account, amount, positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            amount = utils_1.toBigNumber(amount);
            const receipt = yield this.eos.transaction({
                actions: [
                    {
                        account: "eosio.token",
                        name: "transfer",
                        authorization: [{ actor: account, permission: "active" }],
                        data: {
                            to: this.contractName,
                            from: account,
                            maker: account,
                            quantity: `${amount.toFixed(4)} EOS`,
                            memo: `position_id:${positionId}`
                        }
                    }
                ]
            }, this.getOptions({ name: account }));
            return receipt;
        });
    }
    deleteCollateral(sender, amount, positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof amount === "string" || typeof amount === "number") {
                amount = new bignumber_js_1.default(amount);
            }
            const receipt = yield this.eos.transaction({
                actions: [
                    {
                        account: this.contractName,
                        name: "colateraldel",
                        authorization: [{ actor: sender, permission: "active" }],
                        data: {
                            position_id: positionId,
                            collateral: `${amount.toFixed(4)} EOS`
                        }
                    }
                ]
            }, this.getOptions({ name: sender }));
            return receipt;
        });
    }
    generateDebt(account, amount, positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roundedAmount = utils_1.toBigNumber(amount).dp(4, 1);
            const receipt = yield this.eos.transaction({
                actions: [
                    {
                        account: this.contractName,
                        name: "debtgenerate",
                        authorization: [{ actor: account, permission: "active" }],
                        data: {
                            debt: `${roundedAmount.toFixed(9)} EOSDT`,
                            position_id: positionId
                        }
                    }
                ]
            }, this.getOptions({ name: account }));
            return receipt;
        });
    }
    burnbackDebt(account, amount, positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roundedAmount = utils_1.toBigNumber(amount).dp(4, 1);
            const receipt = yield this.eos.transaction({
                actions: [
                    {
                        account: "eosdtsttoken",
                        name: "transfer",
                        authorization: [{ actor: account, permission: "active" }],
                        data: {
                            to: this.contractName,
                            from: account,
                            maker: account,
                            quantity: `${roundedAmount.toFixed(9)} EOSDT`,
                            memo: `position_id:${positionId}`
                        }
                    }
                ]
            }, this.getOptions({ name: account }));
            return receipt;
        });
    }
    marginCall(senderAccount, positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const receipt = yield this.eos.transaction({
                actions: [
                    {
                        account: this.contractName,
                        name: "margincall",
                        authorization: [{ actor: senderAccount, permission: "active" }],
                        data: {
                            position_id: positionId
                        }
                    }
                ]
            }, this.getOptions({ name: senderAccount }));
            return receipt;
        });
    }
    getContractEosAmount() {
        return __awaiter(this, void 0, void 0, function* () {
            const balance = yield this.eos.getCurrencyBalance("eosio.token", "eosdtcntract", "EOS");
            return utils_1.balanceToNumber(balance);
        });
    }
    getRates() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.eos.getTableRows(true, "eosdtorclize", "eosdtorclize", "orarates", "rate", "0", "-1", 500);
            return table.rows;
        });
    }
    getPositionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.eos.getTableRows(true, this.contractName, this.contractName, "positions", "position_id", id.toString(), id.toString(), 1);
            return table.rows[0];
        });
    }
    getAllUserPositions(maker) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.eos.getTableRows(true, this.contractName, this.contractName, "positions", "maker", maker, maker, 100, "name", "secondary");
            return table.rows;
        });
    }
    getParameters() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.eos.getTableRows(true, this.contractName, this.contractName, "parameters", "parameter_id", "0", "-1");
            return table.rows[0];
        });
    }
    getSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.eos.getTableRows(true, this.contractName, this.contractName, "ctrsettings", "setting_id", "0", "-1");
            return table.rows[0];
        });
    }
}
exports.PositionsContract = PositionsContract;
