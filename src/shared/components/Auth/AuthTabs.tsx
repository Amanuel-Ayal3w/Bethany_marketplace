'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

type Tab = 'login' | 'signup';

export default function AuthTabs() {
    const [activeTab, setActiveTab] = useState<Tab>('login');

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`flex-1 py-2 px-4 text-center ${activeTab === 'login'
                            ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('login')}
                >
                    Login
                </button>
                <button
                    className={`flex-1 py-2 px-4 text-center ${activeTab === 'signup'
                            ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('signup')}
                >
                    Sign Up
                </button>
            </div>

            {activeTab === 'login' ? <LoginForm /> : <SignUpForm />}
        </div>
    );
} 