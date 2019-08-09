"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class GovernanceContract {
    constructor(connector) {
        this.eos = connector.eos;
        this.contractName = "eosdtgovernc";
    }
    getOptions(account) {
        return {
            authorization: [`${account.name}@${account.authority || "active"}`],
            sign: true,
            broadcast: true
        };
    }
    stake(sender, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            amount = utils_1.toBigNumber(amount);
            const receipt = yield this.eos.transaction({
                actions: [
                    {
                        account: "eosdtnutoken",
                        name: "transfer",
                        authorization: [{ actor: sender, permission: "active" }],
                        data: {
                            from: sender,
                            to: this.contractName,
                            quantity: `${amount.toFixed(9)} NUT`,
                            memo: ""
                        }
                    }
                ]
            }, this.getOptions({ name: sender }));
            return receipt;
        });
    }
    stakeAndVote(sender, amount, producers) {
        return __awaiter(this, void 0, void 0, function* () {
            amount = utils_1.toBigNumber(amount);
            const vote_json = JSON.stringify({ "eosdtbpproxy.producers": producers });
            const receipt = yield this.eos.transaction({
                actions: [
                    {
                        account: "eosdtnutoken",
                        name: "transfer",
                        authorization: [{ actor: sender, permission: "active" }],
                        data: {
                            from: sender,
                            to: this.contractName,
                            quantity: `${amount.toFixed(9)} NUT`,
                            memo: ""
                        }
                    },
                    {
                        account: this.contractName,
                        name: "vote",
                        authorization: [{ actor: sender, permission: "active" }],
                        data: {
                            sender,
                            proposal_name: "blockproduce",
                            vote: 1,
                            vote_json
                        }
                    }
                ]
            }, this.getOptions({ name: sender }));
            return receipt;
        });
    }
    getVoterInfo(accountName) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.eos.getTableRows(true, this.contractName, accountName, "voters", "voting_amount", "0", "-1");
            return result.rows[0];
        });
    }
    unstake(amount, voter) {
        return __awaiter(this, void 0, void 0, function* () {
            amount = utils_1.toBigNumber(amount);
            const receipt = yield this.eos.transaction({
                actions: [
                    {
                        account: this.contractName,
                        name: "unstake",
                        authorization: [{ actor: voter, permission: "active" }],
                        data: {
                            voter,
                            quantity: `${amount.toFixed(9)} NUT`
                        }
                    }
                ]
            }, this.getOptions({ name: voter }));
            return receipt;
        });
    }
    voteForBlockProducers(voter, ...producers) {
        return __awaiter(this, void 0, void 0, function* () {
            const vote_json = JSON.stringify({ "eosdtbpproxy.producers": producers });
            const receipt = yield this.eos.transaction({
                actions: [
                    {
                        account: this.contractName,
                        name: "vote",
                        authorization: [{ actor: voter, permission: "active" }],
                        data: {
                            voter,
                            proposal_name: "blockproduce",
                            vote: 1,
                            vote_json
                        }
                    }
                ]
            }, this.getOptions({ name: voter }));
            return receipt;
        });
    }
    getSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.eos.getTableRows(true, this.contractName, this.contractName, "govsettings", "setting_id", "0", "-1", 1);
            return table.rows[0];
        });
    }
    getVotes() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.eos.getTableRows(true, this.contractName, this.contractName, "votes", "id", "0", "-1", 1000);
            return table.rows;
        });
    }
    getBpVotes() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.eos.getTableRows(true, this.contractName, this.contractName, "bpvotes", "producer", "0", "-1");
            return table.rows;
        });
    }
}
exports.GovernanceContract = GovernanceContract;
