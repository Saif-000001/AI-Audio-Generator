import { createContext, useEffect, useState } from "react"
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import app from "../Firebase/Firebase.Config";

const auth = getAuth(app);
export const AuthContext = createContext(null)

const googleProvider = new GoogleAuthProvider();

function AuthProviders({children}) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const createUser = (email, password) =>{
        setLoading(true)
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const signIn = (email, password) =>{
      setLoading(true)
      return signInWithEmailAndPassword(auth,email,password);
    }

    const signInWithGoogle = () =>{
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    }

    const logOut = () =>{
      setLoading(true)
      return signOut(auth);
    }

    useEffect(() =>{
      const unsubscribe = onAuthStateChanged(auth, currentUser =>{
        console.log('user in the auth state change', currentUser);
        setUser(currentUser)
        setLoading(false)
      })
      return () => {
        unsubscribe()
      }
    },[])

    const authInfo = {
        user,
        loading,
        createUser,
        signIn,
        signInWithGoogle,
        logOut
    }
  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProviders