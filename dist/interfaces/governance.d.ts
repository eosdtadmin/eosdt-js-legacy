export interface EosdtVote {
    id: number;
    proposal_name: string;
    updated_at: string;
    voter: string;
    vote: number;
    vote_json: string;
}
export interface GovernanceSettings {
    setting_id: number;
    eosdtcntract_account: string;
    min_proposal_weight: string;
    freeze_period: number;
    min_participation: string;
    success_margin: string;
    top_holders_amount: number;
    max_bp_count: number;
    max_bp_votes: number;
    min_vote_stake: string;
    unstake_period: number;
    bpproxy_account: string;
    governc_account: string;
}
export interface BPVotes {
    producer: string;
    votes: string;
}
export interface VoterInfo {
    voting_amount: string;
    withdrawal_date: string;
}
