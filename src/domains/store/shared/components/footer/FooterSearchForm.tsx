'use client';

import React from 'react';
import Image from 'next/image';

const FooterSearchForm = () => {
    return (
        <div className="h-11 w-full relative ml-16">
            <input
                type="text"
                className="w-full h-full rounded-lg text-gray-700 border border-gray-300 pl-12 focus:border-gray-600"
                placeholder="Search"
            />
            <Image
                src="/icons/searchIcon.svg"
                width={16}
                height={16}
                alt="Search"
                className="absolute top-3.5 left-5 hidden sm:block"
            />
        </div>
    );
};

export default FooterSearchForm; 