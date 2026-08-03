import { useMutation, useQueryClient } from '@tanstack/react-query';

import { checkOut } from '../../../lib/workerPortalApi';
import { captureCurrentLocation } from '../checkin/useCheckIn';
import { useAuth } from '../../../session/AuthContext';

export function useCheckOut(assignmentId: string) {
  const { workerId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note?: string) => {
      const location = await captureCurrentLocation();

      return checkOut(workerId as string, assignmentId, {
        latitude: location.latitude,
        longitude: location.longitude,
        method: 'GPS',
        note,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['worker-assignment', assignmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['worker-assignments', workerId],
      });
    },
  });
}
