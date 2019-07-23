import { Eos } from "../"

export interface EosdtConnectorInterface {
    eos: ReturnType<typeof Eos>
}
