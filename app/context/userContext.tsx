"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

type UserProfile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  username: string
  xp: number;
  stars: number; 
};

interface UserContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  addXp: (amount: number) => void;
  addStars: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/api/user/profile');
        setUserProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, []);
  
  const addXp = (amount: number) => {
    setUserProfile(prev => {
      if (!prev) return null;
      return { ...prev, xp: prev.xp + amount };
    });
  };

  const addStars = (amount: number) => {
    setUserProfile(prev => {
        if (!prev) return null;
        return { ...prev, stars: prev.stars + amount };
    });
  };

  return (
    <UserContext.Provider value={{ userProfile, isLoading, addXp, addStars }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};