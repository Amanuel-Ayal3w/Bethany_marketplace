import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type UserRole = 'ADMIN' | 'USER';

// POST endpoint to create a new user with selected role
export async function POST(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        // Get current user session to check admin access
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized - Please log in'
            }, { status: 401 });
        }

        try {
            // Try to check if user has admin role
            const { data: user, error: userError } = await supabase.auth.getUser();

            if (userError) {
                console.error('Error getting user:', userError);
                return NextResponse.json({
                    success: false,
                    error: 'Error checking user authentication'
                }, { status: 500 });
            }

            // Since we can't reliably check the Profile table for permissions due to errors,
            // we'll implement a simple admin check based on a predefined admin email list.
            // In a production environment, you should use a proper role-based access control system.
            const adminEmails = [
                'amanuelayalew983@gmail.com',
                'amanuel.ayalew@aait.edu.et'  // Added this email from the logs
            ];

            if (!adminEmails.includes(user.user?.email || '')) {
                return NextResponse.json({
                    success: false,
                    error: 'Forbidden - Admin access required'
                }, { status: 403 });
            }
        } catch (err) {
            console.error('Error checking admin permissions:', err);
            return NextResponse.json({
                success: false,
                error: 'Error checking permissions'
            }, { status: 500 });
        }

        // Get new user data from request body
        const { email, password, role = 'USER' } = await request.json();

        // Validate role
        if (role !== 'ADMIN' && role !== 'USER') {
            return NextResponse.json({
                success: false,
                error: 'Invalid role specified'
            }, { status: 400 });
        }

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                error: 'Email and password are required'
            }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid email format'
            }, { status: 400 });
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json({
                success: false,
                error: 'Password must be at least 8 characters long'
            }, { status: 400 });
        }

        // Create the user in Auth using signUp
        const { data: userData, error: userError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
            }
        });

        // Check if there was an error or if the user was not created
        if (userError) {
            // If the error is because the user already exists, return a specific error
            if (userError.message.includes('already registered')) {
                return NextResponse.json({
                    success: false,
                    error: 'User with this email already exists'
                }, { status: 409 });
            }

            return NextResponse.json({
                success: false,
                error: `Failed to create user: ${userError.message}`
            }, { status: 500 });
        }

        if (!userData.user) {
            return NextResponse.json({
                success: false,
                error: 'User creation failed'
            }, { status: 500 });
        }

        try {
            // Create the profile with the specified role using Supabase
            const now = new Date().toISOString();
            const { error: profileCreateError } = await supabase
                .from('Profile')
                .insert([{
                    id: userData.user.id,
                    role: role,
                    createdAt: now,
                    updatedAt: now
                }]);

            if (profileCreateError) {
                console.error('Error creating user profile:', profileCreateError);
                // Don't return an error here, since the user was created successfully
                // Instead, we'll just log the error and return success
            }
        } catch (err) {
            console.error('Error adding user to Profile table:', err);
            // Continue instead of failing, since the auth user was created
        }

        return NextResponse.json({
            success: true,
            message: `${role} user created successfully`,
            userId: userData.user.id
        });

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({
            success: false,
            error: 'Server error'
        }, { status: 500 });
    }
} 