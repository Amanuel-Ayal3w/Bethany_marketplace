export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profile: {
                Row: {
                    id: string
                    role: string
                }
                Insert: {
                    id: string
                    role?: string
                }
                Update: {
                    id?: string
                    role?: string
                }
            }
            // Add other tables from your schema as needed
        }
        Views: {
            // Define views if you have any
        }
        Functions: {
            // Define functions if you have any
        }
        Enums: {
            // Define enums if you have any
        }
    }
    auth: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string | null
                    created_at: string
                }
            }
        }
    }
} 