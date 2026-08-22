import { useQuery } from '@tanstack/react-query';
import { AuthService } from '../api/auth';
import type { User } from '../types';

export const useCurrentUser = () => {
  return useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await AuthService.getProfile();
      const raw = response.data as Record<string, unknown> | null;
      if (raw && typeof raw === 'object' && 'user' in raw) {
        return raw.user as User;
      }
      return raw as unknown as User;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
