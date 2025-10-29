import React, { createContext, useContext } from 'react';

// Create a context to store Google Client ID
const GoogleClientContext = createContext();

// Create a provider component
export const GoogleClientProvider = ({ children }) => {
    const googleClientId = import.meta.env.REACT_APP_GOOGLE_CLIENT_ID;  // Get it from .env file

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
