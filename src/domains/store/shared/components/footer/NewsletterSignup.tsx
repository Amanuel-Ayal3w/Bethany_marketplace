'use client';

import React, { useState } from 'react';
import Button from '@/shared/components/UI/button';

const NewsletterSignup = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would add the logic to subscribe to the newsletter
        console.log('Subscribing with email:', email);
        setEmail('');
        // Add a toast notification here
    };

    return (
        <form onSubmit={handleSubscribe} className="flex w-auto justify-start">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email address"
                className="w-[200px] text-sm h-8 rounded-md px-4 border border-gray-300 focus:border-gray-800"
                required
            />
            <Button
                type="submit"
                className="h-8 px-4 ml-2 rounded-md border text-sm border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 active:text-gray-900"
            >
                Subscribe
            </Button>
        </form>
    );
};

export default NewsletterSignup; 