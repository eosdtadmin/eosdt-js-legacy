import { EosdtConnectorInterface } from "./interfaces/connector"
import { balanceToNumber } from "./utils"
import { Eos } from "./"

export class BalanceGetter {
    private eos: ReturnType<typeof Eos>

    constructor(connector: EosdtConnectorInterface) {
        this.eos = connector.eos
    }

    public async getNut(account: string): Promise<number> {
        const balance = await this.eos.getCurrencyBalance("eosdtnutoken", account, "NUT")

        return balanceToNumber(balance)
    }

    public async getEosdt(account: string): Promise<number> {
        const balance = await this.eos.getCurrencyBalance(
            "eosdtsttoken",
            account,
            "EOSDT"
        )

        return balanceToNumber(balance)
    }

    public async getEos(account: string): Promise<number> {
        const balance = await this.eos.getCurrencyBalance("eosio.token", account, "EOS")

        return balanceToNumber(balance)
    }
}
