import { useState } from 'react';

export const UserProfile = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                        U
                    </div>
                    <span className="font-medium text-gray-700">User</span>
                </div>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div className="absolute bottom-full left-4 mb-2 w-48 bg-white rounded-lg shadow-lg py-1">
                        <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600">Profile</a>
                        <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600">Settings</a>
                        <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600">Sign out</a>
                    </div>
                )}
            </div>
        </div>
    );
};