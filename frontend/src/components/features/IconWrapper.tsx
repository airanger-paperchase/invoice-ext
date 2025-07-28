import React from 'react';

interface IconWrapperProps {
    color: string;
    children: React.ReactNode;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ color, children }) => {
    return React.cloneElement(children as React.ReactElement, {
        style: { fill: color }, // Pass the color or style directly to the icon
    });
};

export default IconWrapper;
