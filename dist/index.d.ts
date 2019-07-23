interface Auth {
    actor: string;
    permission: string;
}
interface Action {
    account: string;
    name: string;
    authorization: Auth[];
    data: {
        [key: string]: string | number;
    };
}
interface TX {
    actions: Action[];
}
interface EosJS {
    getAccount: (name: string) => string;
    getCurrencyBalance: (code: string, account: string, symbol: string) => any[];
    getCurrencyStats: (code: string, symbol: string) => any;
    getTableRows: (json: boolean, code: string, scope: string, table: string, table_key: string, lower_bound: string, upper_bound: string, limit?: number, key_type?: string, index_position?: string) => any;
    transaction: (tx: TX, options: {
        authorization: string[];
        sign: boolean;
        broadcast: boolean;
    }) => any;
}
interface EosConfig {
    chainId: null | string;
    keyProvider: string[];
    httpEndpoint: string;
    expireInSeconds?: number;
    broadcast?: boolean;
    verbose?: boolean;
    sign?: boolean;
}
interface EosCreator {
    (config: EosConfig): EosJS;
}
export { EosdtConnector } from "./connector";
export { PositionsContract } from "./positions";
export { BalanceGetter } from "./balance";
export * from "./interfaces/positions-contract";
export * from "./interfaces/connector";
declare const Eos: EosCreator;
export { Eos };
