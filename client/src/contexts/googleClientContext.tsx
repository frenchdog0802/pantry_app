import React, { createContext, useContext } from 'react';
import config from "../../../config/config.js";

// Create a context to store Google Client ID
const GoogleClientContext = createContext();

// Create a provider component
export const GoogleClientProvider = ({ children }) => {
    const googleClientId = config.GOOGLE_CLIENT_ID;  // Get it from config

    return (
        <GoogleClientContext.Provider value={googleClientId}>
            {children}
        </GoogleClientContext.Provider>
    );
};

// Create a custom hook to use the client ID in other components
export const useGoogleClientId = () => {
    const context = useContext(GoogleClientContext);
    if (context === undefined) {
        throw new Error('useGoogleClientId must be used within a GoogleClientProvider');
    }
    return context;
};
