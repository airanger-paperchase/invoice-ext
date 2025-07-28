import React from 'react';

interface SidebarLinkProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, isActive }) => {
    return (
        <a
            href="/search"
            className={`
        flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
        ${isActive
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                }
      `}
        >
            <span className="text-xl">{icon}</span>
            <span className="font-medium">{label}</span>
        </a>
    );
};