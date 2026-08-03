import * as Location from 'expo-location';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { checkIn } from '../../../lib/workerPortalApi';
import { useAuth } from '../../../session/AuthContext';

export async function captureCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error(
      'Cần cấp quyền vị trí để check-in tại nơi làm việc',
    );
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export function useCheckIn(assignmentId: string) {
  const { workerId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note?: string) => {
      const location = await captureCurrentLocation();

      return checkIn(workerId as string, assignmentId, {
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
