import { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/auth/fireauth';
import apiRequest from '@/ApiRequest';

// Import Firebase auth functions that will be used
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';

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
             // Return the response directly
             return await apiRequest(`${apiUrl}/${user.uid}`, options);
         } catch (error) {
             // Log the error or handle it more specifically if needed
             // console.error("Error fetching user data:", error); // Keep this if you want error logging
             throw error; // Re-throw to be caught by the useEffect or calling function
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
            if (!isMounted) return; 
            
            setIsLoading(true);
            
            try {
                if (user) {
                    setAuthUser(user);
                    const userDataResult = await getUserData(user); 
                    
                    if (isMounted) {
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
    }, []); 

    // --- NEW AUTH FUNCTIONS ---
    const registerUserWithEmailAndPassword = async (email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if (user) {
                setAuthUser(user);
                setIsLoading(true); 
                const data = await getUserData(user);
                setUserData(data);
                setIsLoading(false);
            }
            return userCredential;
        } catch (error) {
            setAuthUser(null);
            setUserData(null);
            setIsLoading(false);
            throw error;
        }
    };

    const loginUserWithEmailAndPassword = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if (user) {
                setAuthUser(user);
                setIsLoading(true); 
                const data = await getUserData(user);
                setUserData(data);
                setIsLoading(false);
            }
            return userCredential;
        } catch (error) {
            setAuthUser(null); 
            setUserData(null);
            setIsLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth); 
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ 
            authUser, 
            userData, 
            setUserData, 
            isLoading, 
            formatDateToLocalYYYYMMDD, 
            logout, 
            currentGroupId, 
            setCurrentGroupId,
            registerUserWithEmailAndPassword,
            loginUserWithEmailAndPassword
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;