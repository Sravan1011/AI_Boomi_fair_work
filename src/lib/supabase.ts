import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Lazy initialization to avoid crashes during Next.js static generation
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
    if (supabaseInstance) {
        return supabaseInstance;
    }

    // Check if we have valid URLs (not placeholders)
    if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
        // Return a mock client that logs warnings during development/build
        console.warn("Supabase not configured - using mock client");
        return {
            from: () => ({
                select: () => Promise.resolve({ data: [], error: null }),
                insert: () => Promise.resolve({ data: null, error: null }),
                update: () => Promise.resolve({ data: null, error: null }),
                delete: () => Promise.resolve({ data: null, error: null }),
                eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
            }),
        } as unknown as SupabaseClient;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
}

// Export a proxy that lazily initializes the client
export const supabase = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        const client = getSupabaseClient();
        const value = (client as unknown as Record<string, unknown>)[prop as string];
        if (typeof value === "function") {
            return value.bind(client);
        }
        return value;
    },
});

// Database types matching our schema
export type Database = {
    public: {
        Tables: {
            jobs: {
                Row: {
                    id: string;
                    contract_job_id: number;
                    title: string;
                    description: string;
                    description_ipfs: string;
                    amount: number;
                    deadline: number;
                    client: string;
                    freelancer: string | null;
                    status: string;
                    deliverable_ipfs: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["jobs"]["Row"], "id" | "created_at" | "updated_at">;
                Update: Partial<Database["public"]["Tables"]["jobs"]["Insert"]>;
            };
            disputes: {
                Row: {
                    id: string;
                    contract_dispute_id: number;
                    job_id: string;
                    contract_job_id: number;
                    raised_by: string;
                    reason: string;
                    status: string;
                    outcome: string;
                    created_at: string;
                    resolved_at: string | null;
                };
                Insert: Omit<Database["public"]["Tables"]["disputes"]["Row"], "id" | "created_at">;
                Update: Partial<Database["public"]["Tables"]["disputes"]["Insert"]>;
            };
            evidence: {
                Row: {
                    id: string;
                    dispute_id: string;
                    ipfs_hash: string;
                    description: string;
                    uploaded_by: string;
                    uploaded_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["evidence"]["Row"], "id" | "uploaded_at">;
                Update: Partial<Database["public"]["Tables"]["evidence"]["Insert"]>;
            };
            ai_analysis: {
                Row: {
                    id: string;
                    dispute_id: string;
                    recommendation: string;
                    confidence: number;
                    summary: string;
                    reasoning: string[];
                    analyzed_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["ai_analysis"]["Row"], "id" | "analyzed_at">;
                Update: Partial<Database["public"]["Tables"]["ai_analysis"]["Insert"]>;
            };
            votes: {
                Row: {
                    id: string;
                    dispute_id: string;
                    juror: string;
                    decision: string;
                    voted_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["votes"]["Row"], "id" | "voted_at">;
                Update: Partial<Database["public"]["Tables"]["votes"]["Insert"]>;
            };
            jurors: {
                Row: {
                    id: string;
                    dispute_id: string;
                    juror_address: string;
                    selected_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["jurors"]["Row"], "id" | "selected_at">;
                Update: Partial<Database["public"]["Tables"]["jurors"]["Insert"]>;
            };
            meet_recordings: {
                Row: {
                    id: string;
                    job_id: string | null;
                    room_name: string;
                    jaas_session_id: string | null;
                    ipfs_cid: string | null;
                    transcript: string | null;
                    duration_seconds: number | null;
                    recorded_by: string | null;
                    created_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["meet_recordings"]["Row"], "id" | "created_at">;
                Update: Partial<Database["public"]["Tables"]["meet_recordings"]["Insert"]>;
            };
            legal_reports: {
                Row: {
                    id: string;
                    dispute_id: string;
                    report_text: string;
                    report_ipfs: string | null;
                    evidence_summary: {
                        messages_count: number;
                        voice_count: number;
                        meet_transcript: boolean;
                        ipfs_files_count: number;
                    } | null;
                    recommendation: "CLIENT" | "FREELANCER" | "NEUTRAL";
                    confidence: number;
                    generated_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["legal_reports"]["Row"], "id" | "generated_at">;
                Update: Partial<Database["public"]["Tables"]["legal_reports"]["Insert"]>;
            };
        };
    };
};
