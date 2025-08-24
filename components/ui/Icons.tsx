import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M6.36,22.51V7.5h3.03l5.34,11.22L20.07,7.5h3.03V22.51h-2.31V10.43l-4.59,9.6H13.2L8.67,10.43V22.51Z" transform="translate(-1 -1)"/>
        <path d="M29.5,22.51V7.5h9.45v2.1H31.81V14h6.51v2.1H31.81v4.3h7.29v2.1Z" transform="translate(-1 -1)"/>
        <path d="M43.34,22.51V7.5h2.31V22.51Z" transform="translate(-1 -1)"/>
        <path d="M51.9,22.79a8.6,8.6,0,0,1-4.71-1.31l1.17-1.77a6.83,6.83,0,0,0,3.54,1.11,4.42,4.42,0,0,0,4.71-4.56,4.3,4.3,0,0,0-4.2-4.5,3.92,3.92,0,0,0-3.69,2.46H58V7.5h2.31v4.11h.15a5.59,5.59,0,0,1,5-4.41,6.57,6.57,0,0,1,7,6.81,6.8,6.8,0,0,1-7,7.08A8.41,8.41,0,0,1,51.9,22.79Zm8.28-6.15a4.34,4.34,0,0,0-4.56-4.71,4.48,4.48,0,0,0-4.65,4.8,4.3,4.3,0,0,0,4.53,4.62A4.45,4.45,0,0,0,60.18,16.64Z" transform="translate(-1 -1)"/>
        <path d="M79.24,22.51l-6-8.52h-.12v8.52H70.81V7.5h2.31l5.91,8.4h.12V7.5h2.31V22.51Z" transform="translate(-1 -1)"/>
        <path d="M96,22.79a8.41,8.41,0,0,1-8.37-8.31,8.32,8.32,0,0,1,8.37-8.28,8.19,8.19,0,0,1,8.28,8.28A8.25,8.25,0,0,1,96,22.79Zm0-14.49a6.11,6.11,0,0,0-6.15,6.21,6,6,0,0,0,6.15,6.09,6.08,6.08,0,0,0,6.12-6.09A6.11,6.11,0,0,0,96,8.3Z" transform="translate(-1 -1)"/>
        <path d="M110.16,22.51V7.5h9.45v2.1h-7.14V14h6.51v2.1h-6.51v4.3h7.29v2.1Z" transform="translate(-1 -1)"/>
        <path d="M2.31,21.2,5.22,15,2.31,8.8H5.43l1.74,3.9,1.74-3.9h3.12L8.91,15,3.09,6.21H8.88L6.81,17.4l-2,3.8Z" transform="translate(-1 -1)"/>
    </svg>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

export const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

export const UploadCloudIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 17.2a4.6 4.6 0 0 0-4.5-5.2A6.4 6.4 0 0 0 6 13a4.8 4.8 0 0 0 5 4.9h8.5a3.5 3.5 0 0 0 1-6.7Z" />
        <path d="M12 12v9" />
        <path d="m16 16-4-4-4 4" />
    </svg>
);

export const ShoppingCartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
);

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);