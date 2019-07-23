import { Eos } from "./"
import { TextDecoder, TextEncoder } from "text-encoding"
import { PositionsContract } from "./positions"
import { BalanceGetter } from "./balance"

export class EosdtConnector {
    public readonly eos: ReturnType<typeof Eos>

    constructor(nodeAddress: string, privateKeys: string[]) {
        this.eos = Eos({
            httpEndpoint: nodeAddress,
            keyProvider: privateKeys,
            chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"
        })
    }

    public getPositions(): PositionsContract {
        return new PositionsContract(this)
    }

    public getBalances(): BalanceGetter {
        return new BalanceGetter(this)
    }
}
