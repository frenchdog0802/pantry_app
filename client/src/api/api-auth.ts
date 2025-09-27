// src/api/auth.ts
import { api } from './client';
import type { User } from './types';

// Signin function
const signin = async (user: User) => {
  try {
    // Use the `api.post` method to make the POST request
    const response = await api.post('/auth/signin', user);
    return response;
  } catch (err) {
    console.error('Signin error:', err);
    throw err; // Optional: You can rethrow or handle the error as needed
  }
};

// Signout function
const signout = async () => {
  try {
    // Use the `api.get` method to make the GET request
    const response = await api.get('/auth/signout');
    return response;
  } catch (err) {
    console.error('Signout error:', err);
    throw err; // Optional: You can rethrow or handle the error as needed
  }
};

export { signin, signout };
