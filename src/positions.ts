import BigNumber from "bignumber.js"
import { Eos } from "./"

import {
    EosdtContractParameters,
    EosdtContractSettings,
    TokenRate,
    EosdtPosition
} from "./interfaces/positions-contract"

import { EosdtConnectorInterface } from "./interfaces/connector"
import { toBigNumber, balanceToNumber } from "./utils"

export class PositionsContract {
    private contractName: string
    private eos: ReturnType<typeof Eos>

    constructor(connector: EosdtConnectorInterface) {
        this.eos = connector.eos
        this.contractName = "eosdtcntract"
    }

    private getOptions(account: {
        name: string
        authority?: string
    }): { authorization: string[]; sign: boolean; broadcast: boolean } {
        return {
            authorization: [`${account.name}@${account.authority || "active"}`],
            sign: true,
            broadcast: true
        }
    }

    public async create(
        accountName: string,
        eosAmount: string | number | BigNumber,
        eosdtAmount: string | number | BigNumber
    ): Promise<any> {
        eosAmount = toBigNumber(eosAmount)
        const roundedDebtAmount = toBigNumber(eosdtAmount).dp(4, 1)

        const receipt = await this.eos.transaction(
            {
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
            },
            this.getOptions({ name: accountName })
        )

        return receipt
    }

    public async close(senderAccount: string, positionId: number): Promise<any> {
        const receipt = await this.eos.transaction(
            {
                actions: [
                    {
                        account: this.contractName,
                        name: "close",
                        authorization: [{ actor: senderAccount, permission: "active" }],
                        data: { position_id: positionId }
                    }
                ]
            },
            this.getOptions({ name: senderAccount })
        )

        return receipt
    }

    public async del(creator: string, positionId: number): Promise<any> {
        const receipt = await this.eos.transaction(
            {
                actions: [
                    {
                        account: this.contractName,
                        name: "positiondel",
                        authorization: [{ actor: creator, permission: "active" }],
                        data: { position_id: positionId }
                    }
                ]
            },
            this.getOptions({ name: creator })
        )

        return receipt
    }

    public async give(
        account: string,
        receiver: string,
        positionId: number
    ): Promise<any> {
        const receipt = await this.eos.transaction(
            {
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
            },
            this.getOptions({ name: account })
        )
        return receipt
    }

    public async addCollateral(
        account: string,
        amount: string | number | BigNumber,
        positionId: number
    ): Promise<any> {
        amount = toBigNumber(amount)

        const receipt = await this.eos.transaction(
            {
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
            },
            this.getOptions({ name: account })
        )

        return receipt
    }

    public async deleteCollateral(
        sender: string,
        amount: string | number | BigNumber,
        positionId: number
    ): Promise<any> {
        if (typeof amount === "string" || typeof amount === "number") {
            amount = new BigNumber(amount)
        }

        const receipt = await this.eos.transaction(
            {
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
            },
            this.getOptions({ name: sender })
        )

        return receipt
    }

    public async generateDebt(
        account: string,
        amount: string | number | BigNumber,
        positionId: number
    ): Promise<any> {
        const roundedAmount = toBigNumber(amount).dp(4, 1)

        const receipt = await this.eos.transaction(
            {
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
            },
            this.getOptions({ name: account })
        )

        return receipt
    }

    public async burnbackDebt(
        account: string,
        amount: string | number | BigNumber,
        positionId: number
    ): Promise<any> {
        const roundedAmount = toBigNumber(amount).dp(4, 1)

        const receipt = await this.eos.transaction(
            {
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
            },
            this.getOptions({ name: account })
        )

        return receipt
    }

    public async marginCall(senderAccount: string, positionId: number): Promise<any> {
        const receipt = await this.eos.transaction(
            {
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
            },
            this.getOptions({ name: senderAccount })
        )

        return receipt
    }

    public async getContractEosAmount(): Promise<number> {
        const balance = await this.eos.getCurrencyBalance(
            "eosio.token",
            "eosdtcntract",
            "EOS"
        )
        return balanceToNumber(balance)
    }

    public async getRates(): Promise<TokenRate[]> {
        const table = await this.eos.getTableRows(
            true,
            "eosdtorclize",
            "eosdtorclize",
            "oracle.rates",
            "rate",
            "0",
            "-1",
            500
        )

        return table.rows
    }

    public async getPositionById(id: number): Promise<EosdtPosition | undefined> {
        const table = await this.eos.getTableRows(
            true,
            this.contractName,
            this.contractName,
            "positions",
            "position_id",
            id.toString(),
            id.toString(),
            1
        )

        return table.rows[0]
    }

    public async getAllUserPositions(maker: string): Promise<EosdtPosition[]> {
        const table = await this.eos.getTableRows(
            true,
            this.contractName,
            this.contractName,
            "positions",
            "maker",
            maker,
            maker,
            100,
            "name",
            "secondary"
        )

        return table.rows
    }

    public async getParameters(): Promise<EosdtContractParameters> {
        const table = await this.eos.getTableRows(
            true,
            this.contractName,
            this.contractName,
            "parameters",
            "parameter_id",
            "0",
            "-1"
        )

        return table.rows[0]
    }

    public async getSettings(): Promise<EosdtContractSettings> {
        const table = await this.eos.getTableRows(
            true,
            this.contractName,
            this.contractName,
            "ctrsettings",
            "setting_id",
            "0",
            "-1"
        )

        return table.rows[0]
    }
}
