import { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/auth/fireauth';
import apiRequest from '@/ApiRequest';

const AuthContext = createContext();
const apiUrl = `${import.meta.env.VITE_BACKEND_API_BASE_URL}/api/users`;

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [currentGroupId, setCurrentGroupId] = useState(null);

    //get user data from api
    const getUserData = async (user) => {
        try {
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const res = await apiRequest(`${apiUrl}/${user.uid}`, options);
            setUserData(res);
            return res; // Return the response so we can use it in the effect
        } catch (error) {
            throw error;
        }
    }

    const formatDateToLocalYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
    //listen to auth state changes
    useEffect(() => {
        let isMounted = true; // For cleanup
        
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!isMounted) return; // Don't update state if component is unmounted
            
            setIsLoading(true);
            
            try {
                if (user) {
                    setAuthUser(user);
                    const userDataResult = await getUserData(user);
                    
                    if (isMounted) {
                        // Only update state if component is still mounted
                        setUserData(userDataResult);
                    }
                } else {
                    if (isMounted) {
                        setAuthUser(null);
                        setUserData(null);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    setAuthUser(null);
                    setUserData(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        });

        // Cleanup function
        return () => {
            isMounted = false;
            unsub();
        };
    }, []); // Empty dependency array since we only want this to run once on mount

    // Debug effect to log state changes
    useEffect(() => {
    }, [authUser, userData, isLoading]);

    const logout = async () => {
        try {
            await auth.signOut(); // Firebase signOut
            // onAuthStateChanged will handle setting authUser and userData to null
        } catch (error) {
            // Optionally, re-throw the error or handle it as needed
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ authUser, userData, setUserData, isLoading, getUserData, formatDateToLocalYYYYMMDD, logout, currentGroupId, setCurrentGroupId }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;