import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';

import { Card } from '../../../components/Card';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ScreenContainer } from '../../../components/ScreenContainer';
import {
  createAvailability,
  deleteAvailability,
  listAvailability,
} from '../../../lib/workerPortalApi';
import { useAuth } from '../../../session/AuthContext';

export function AvailabilityScreen() {
  const { workerId } = useAuth();
  const queryClient = useQueryClient();
  const [startTime, setStartTime] = useState('08:00:00');
  const [endTime, setEndTime] = useState('17:00:00');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['worker-availability', workerId],
    queryFn: () => listAvailability(workerId as string),
    enabled: Boolean(workerId),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createAvailability(workerId as string, {
        availabilityType: 'RECURRING',
        startTime,
        endTime,
        isAvailable: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['worker-availability', workerId],
      });
    },
    onError: (err) => {
      Alert.alert(
        'Không thể thêm lịch rảnh',
        err instanceof Error ? err.message : 'Đã có lỗi xảy ra',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (availabilityId: string) =>
      deleteAvailability(workerId as string, availabilityId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['worker-availability', workerId],
      });
    },
  });

  return (
    <ScreenContainer
      refreshing={isRefetching}
      onRefresh={() => refetch()}
    >
      <Card>
        <Text style={styles.title}>Thêm khung giờ rảnh</Text>
        <Text style={styles.label}>Giờ bắt đầu (HH:MM:SS)</Text>
        <TextInput
          style={styles.input}
          value={startTime}
          onChangeText={setStartTime}
        />
        <Text style={styles.label}>Giờ kết thúc (HH:MM:SS)</Text>
        <TextInput
          style={styles.input}
          value={endTime}
          onChangeText={setEndTime}
        />
        <PrimaryButton
          label="Thêm lịch rảnh"
          onPress={() => createMutation.mutate()}
          loading={createMutation.isPending}
        />
      </Card>

      {isLoading ? <Text>Đang tải...</Text> : null}

      {data?.map((item) => (
        <Card key={item.id}>
          <Text style={styles.title}>
            {item.availabilityType === 'RECURRING'
              ? `Thứ ${item.dayOfWeek ?? '-'}`
              : item.specificDate ?? 'Một lần'}
          </Text>
          <Text>
            {item.startTime} - {item.endTime}
          </Text>
          <Text>
            {item.isAvailable ? 'Đang bật' : 'Đang tắt'}
          </Text>
          <PrimaryButton
            label="Xoá"
            onPress={() => deleteMutation.mutate(item.id)}
            loading={deleteMutation.isPending}
            variant="danger"
          />
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
});
