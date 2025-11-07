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
            
        }
        Views: {
            
        Functions: {
            
        }
        Enums: {
            
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
} 