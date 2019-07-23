"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const positions_1 = require("./positions");
const balance_1 = require("./balance");
class EosdtConnector {
    constructor(nodeAddress, privateKeys) {
        this.eos = _1.Eos({
            httpEndpoint: nodeAddress,
            keyProvider: privateKeys,
            chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"
        });
    }
    getPositions() {
        return new positions_1.PositionsContract(this);
    }
    getBalances() {
        return new balance_1.BalanceGetter(this);
    }
}
exports.EosdtConnector = EosdtConnector;
