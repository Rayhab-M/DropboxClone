import {
    fetchAuthSession,
    signUp as amplifySignUp,
    signIn as amplifySignIn,
    signOut as amplifySignOut,
  } from '@aws-amplify/auth';
  
 
  export const signUp = async (email, password) => {
    try {
      const { userId } = await amplifySignUp({
        username: email,
        password,
        options: { userAttributes: { email } },
      });
      return userId;
    } catch (error) {
      throw error;
    }
  };
  

  export const confirmSignUp = async (email, code) => {
    console.error('confirmSignUp is no longer supported in v6.');
  };
  

  export const signIn = async (email, password) => {
    try {
      return await amplifySignIn({ username: email, password });
    } catch (error) {
      throw error;
    }
  };
  
 
  export const signOut = async () => {
    try {
      await amplifySignOut();
    } catch (error) {
      throw error;
    }
  };
  
 
  export const getCurrentUser = async () => {
    try {
      const session = await fetchAuthSession();
      return session?.tokens?.idToken || null;
    } catch {
      return null;
    }
  };
  