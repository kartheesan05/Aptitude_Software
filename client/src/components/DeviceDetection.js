import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DeviceDetection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(false);

    const checkDevice = () => {
        // More comprehensive mobile detection
        const isMobileDevice = (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(navigator.userAgent)
            // || window.innerWidth <= (window.screen.width * 2/3)
        );

        setIsMobile(isMobileDevice);

        // Only redirect if we're not already on the restriction page
        if (isMobileDevice && location.pathname !== '/mobile-restriction') {
            navigate('/mobile-restriction', { replace: true });
            return true;
        }
        return false;
    };

    useEffect(() => {
        const isMobileDevice = checkDevice();
        
        if (!isMobileDevice) {
            const handleResize = () => {
                checkDevice();
            };

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [location.pathname]);

    // Force check on mount and pathname change
    useEffect(() => {
        checkDevice();
    }, [location.pathname]);

    return null;
};

export default DeviceDetection;
