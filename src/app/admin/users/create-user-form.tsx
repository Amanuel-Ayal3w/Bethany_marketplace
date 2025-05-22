'use client';

import { useState } from 'react';
import Button from '@/shared/components/UI/button';
import Input from '@/shared/components/UI/input';
import toast from 'react-hot-toast';

export default function CreateUserForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'USER'>('ADMIN');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user');
            }

            toast.success(`${role} user created successfully`);

            // Reset form
            setEmail('');
            setPassword('');
            setRole('ADMIN');
        } catch (error) {
            console.error('Error creating user:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                </label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                </label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                />
                <p className="text-sm text-gray-500 mt-1">
                    Password must be at least 8 characters
                </p>
            </div>
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    User Role
                </label>
                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="role"
                            value="ADMIN"
                            checked={role === 'ADMIN'}
                            onChange={() => setRole('ADMIN')}
                            className="mr-2"
                        />
                        <span>Admin</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="role"
                            value="USER"
                            checked={role === 'USER'}
                            onChange={() => setRole('USER')}
                            className="mr-2"
                        />
                        <span>Regular User</span>
                    </label>
                </div>
            </div>
            <Button
                type="submit"
                disabled={isLoading}
            >
                {isLoading ? 'Creating...' : 'Create User'}
            </Button>
        </form>
    );
} 