// Staff Profile (SDL)
export interface StaffProfile {
    id: string;
    fileno: string;
    full_name: string;
    station?: string | null;
    qualification?: string | null;
    sex?: string | null;
    dob?: string | null;
    dofa?: string | null;
    doan?: string | null;
    dopa?: string | null;
    rank?: string | null;
    conr?: string | null;
    state?: string | null;
    lga?: string | null;
    email?: string | null;
    phone?: string | null;
    remark?: string | null;
    active?: boolean;
    is_hod?: boolean;
    is_driver?: boolean;
    is_typesetting?: boolean;
    is_education?: boolean;
    is_state_cordinator?: boolean;
    is_director?: boolean;
    is_secretary?: boolean;
    others?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
}

// APC Data
export interface APCData {
    id: string;
    file_no: string;
    name: string;
    conraiss?: string | null;
    station?: string | null;
    qualification?: string | null;
    sex?: string | null;
    tt?: string | null;
    mar_accr?: string | null;
    ncee?: string | null;
    gifted?: string | null;
    becep?: string | null;
    bece_mrkp?: string | null;
    ssce_int?: string | null;
    swapping?: string | null;
    ssce_int_mrk?: string | null;
    oct_accr?: string | null;
    ssce_ext?: string | null;
    ssce_ext_mrk?: string | null;
    pur_samp?: string | null;
    int_audit?: string | null;
    stock_tk?: string | null;
    type_of_vehicle?: string | null;
    count?: number | null;
    remark?: string | null;
    year?: string | null;
    active?: boolean;
    reactivation_date?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

// Posting Data
export interface PostingData {
    id: string;
    file_no: string;
    name: string;
    state?: string | null;
    station?: string | null;
    conraiss?: string | null;
    year?: string | null;
    assignment_venue?: string[] | null;
    assignments?: string[] | null;
    mandates?: string[] | null;
    count?: number | null;
    posted_for?: number | null;
    to_be_posted?: number | null;
    numb_of__nites?: number | null;
    description?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

// Assignment Data
export interface AssignmentData {
    id: string;
    code: string;
    name: string;
    active: boolean;
}

export interface AssignmentListResponse {
    items: AssignmentData[];
    total: number;
    skip: number;
    limit: number;
}

// API Response Types
export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface PostingListResponse {
    items: PostingData[];
    total: number;
    skip: number;
    limit: number;
}

export interface MessageResponse {
    message: string;
    success?: boolean;
}

// APC field keys for mapping
export const APC_FIELD_KEYS = [
    'tt',
    'mar_accr',
    'ncee',
    'gifted',
    'becep',
    'bece_mrkp',
    'ssce_int',
    'swapping',
    'ssce_int_mrk',
    'oct_accr',
    'ssce_ext',
    'ssce_ext_mrk',
    'pur_samp',
    'int_audit',
    'stock_tk',
];

