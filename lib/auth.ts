/**
 * Auth utilities - now powered by Supabase
 */
export { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  getUserProfile,
  hasRole,
  isAdmin,
  isRecruiter,
  isClient,
  type UserRole,
  type UserProfile,
} from "@/lib/supabase/auth";
