import BigNumber from "bignumber.js";
import { EosdtConnectorInterface } from "./interfaces/connector";
import { GovernanceSettings, EosdtVote, BPVotes, VoterInfo, ProxyVoters } from "./interfaces/governance";
export declare class GovernanceContract {
    private contractName;
    private eos;
    constructor(connector: EosdtConnectorInterface);
    private getOptions;
    stake(sender: string, amount: string | number | BigNumber): Promise<any>;
    stakeAndVoteForBlockProducers(sender: string, amount: string | number | BigNumber, producers: string[]): Promise<any>;
    getVoterInfo(accountName: string): Promise<VoterInfo | undefined>;
    unstake(amount: string | number | BigNumber, voter: string): Promise<any>;
    voteForBlockProducers(voter: string, producers: string[]): Promise<any>;
    getSettings(): Promise<GovernanceSettings>;
    getVotes(): Promise<EosdtVote[]>;
    getBpVotes(): Promise<BPVotes[]>;
    getProxyVotes(): Promise<ProxyVoters>;
}
