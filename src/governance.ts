import BigNumber from "bignumber.js"
import { Eos } from "./"
import { toBigNumber } from "./utils"
import { EosdtConnectorInterface } from "./interfaces/connector"

import {
    GovernanceSettings,
    EosdtVote,
    BPVotes,
    VoterInfo
} from "./interfaces/governance"

export class GovernanceContract {
    private contractName: string
    private eos: ReturnType<typeof Eos>

    constructor(connector: EosdtConnectorInterface) {
        this.eos = connector.eos
        this.contractName = "eosdtgovernc"
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

    public async stake(
        sender: string,
        amount: string | number | BigNumber
    ): Promise<any> {
        amount = toBigNumber(amount)

        const receipt = await this.eos.transaction(
            {
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
            },
            this.getOptions({ name: sender })
        )

        return receipt
    }

    public async stakeAndVoteForBlockProducers(
        sender: string,
        amount: string | number | BigNumber,
        producers: string[]
    ): Promise<any> {
        amount = toBigNumber(amount)
        const voter = sender
        const vote_json = JSON.stringify({ "eosdtbpproxy.producers": producers })
        const receipt = await this.eos.transaction(
            {
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
                        authorization: [{ actor: voter, permission: "active" }],
                        data: {
                            voter,
                            proposal_name: "blockproduce",
                            vote: 1,
                            vote_json
                        }
                    }
                ]
            },
            this.getOptions({ name: sender })
        )

        return receipt
    }

    public async getVoterInfo(accountName: string): Promise<VoterInfo | undefined> {
        const result = await this.eos.getTableRows(
            true,
            this.contractName,
            accountName,
            "voters",
            "voting_amount",
            "0",
            "-1"
        )
        return result.rows[0]
    }

    public async unstake(
        amount: string | number | BigNumber,
        voter: string
    ): Promise<any> {
        amount = toBigNumber(amount)

        const receipt = await this.eos.transaction(
            {
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
            },
            this.getOptions({ name: voter })
        )

        return receipt
    }

    public async voteForBlockProducers(
        voter: string,
        ...producers: string[]
    ): Promise<any> {
        const vote_json = JSON.stringify({ "eosdtbpproxy.producers": producers })
        const receipt = await this.eos.transaction(
            {
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
            },
            this.getOptions({ name: voter })
        )
        return receipt
    }

    public async getSettings(): Promise<GovernanceSettings> {
        const table = await this.eos.getTableRows(
            true,
            this.contractName,
            this.contractName,
            "govsettings",
            "setting_id",
            "0",
            "-1",
            1
        )
        return table.rows[0]
    }

    public async getVotes(): Promise<EosdtVote[]> {
        const table = await this.eos.getTableRows(
            true,
            this.contractName,
            this.contractName,
            "votes",
            "id",
            "0",
            "-1",
            1000
        )
        return table.rows
    }

    public async getBpVotes(): Promise<BPVotes[]> {
        const table = await this.eos.getTableRows(
            true,
            this.contractName,
            this.contractName,
            "bpvotes",
            "producer",
            "0",
            "-1"
        )
        return table.rows
    }
}
