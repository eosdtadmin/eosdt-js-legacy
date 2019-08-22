export interface EosdtVote {
    id: number
    proposal_name: string
    updated_at: string
    voter: string
    vote: number
    vote_json: string
}

export interface GovernanceSettings {
    setting_id: number // EOS type: uint64
    eosdtcntract_account: string // EOS type: name
    min_proposal_weight: string // EOS type: asset
    freeze_period: number // EOS type: uint32
    min_participation: string // EOS type: float64
    success_margin: string // EOS type: float64
    top_holders_amount: number // EOS type: uint32
    max_bp_count: number // EOS type: uint32
    max_bp_votes: number // EOS type: uint32
    min_vote_stake: string // EOS type: asset
    unstake_period: number // EOS type: uint32
    bpproxy_account: string
    governc_account: string
}

export interface BPVotes {
    producer: string // EOS type: name
    votes: string // EOS type: asset
}

export interface VoterInfo {
    voting_amount: string // EOS type: asset (NUT)
    withdrawal_date: string // EOS type: time_point_sec
}

export interface ProxyVoters {
    flags1: number
    is_proxy: number
    last_vote_weight: string
    owner: string
    producers: string[]
    proxied_vote_weight: string
    proxy: string
    reserved2: number
    reserved3: string
    staked: number
}
