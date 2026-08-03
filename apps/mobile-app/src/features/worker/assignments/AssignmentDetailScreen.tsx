import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text } from 'react-native';

import { Card } from '../../../components/Card';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { getAssignment } from '../../../lib/workerPortalApi';
import type { RootStackParamList } from '../../../navigation/types';
import { useAuth } from '../../../session/AuthContext';
import { useCheckIn } from '../checkin/useCheckIn';
import { useCheckOut } from '../checkout/useCheckOut';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'AssignmentDetail'
>;

export function AssignmentDetailScreen({ route }: Props) {
  const { assignmentId } = route.params;
  const { workerId } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['worker-assignment', assignmentId],
    queryFn: () => getAssignment(workerId as string, assignmentId),
    enabled: Boolean(workerId),
  });

  const checkInMutation = useCheckIn(assignmentId);
  const checkOutMutation = useCheckOut(assignmentId);

  const handleCheckIn = () => {
    checkInMutation.mutate(undefined, {
      onError: (err) =>
        Alert.alert(
          'Check-in thất bại',
          err instanceof Error ? err.message : 'Đã có lỗi xảy ra',
        ),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['worker-dashboard', workerId],
        });
        refetch();
      },
    });
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate(undefined, {
      onError: (err) =>
        Alert.alert(
          'Check-out thất bại',
          err instanceof Error ? err.message : 'Đã có lỗi xảy ra',
        ),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['worker-dashboard', workerId],
        });
        refetch();
      },
    });
  };

  if (isLoading || !data) {
    return (
      <ScreenContainer>
        <Text>Đang tải chi tiết công việc...</Text>
      </ScreenContainer>
    );
  }

  const status = data.assignment.status;

  return (
    <ScreenContainer onRefresh={() => refetch()}>
      <Card>
        <Text style={styles.title}>Trạng thái: {status}</Text>
        <Text>
          Thù lao: {data.assignment.agreedPayout.toLocaleString('vi-VN')} đ
        </Text>
        {data.session?.checkInAt ? (
          <Text>
            Check-in lúc:{' '}
            {new Date(data.session.checkInAt).toLocaleString('vi-VN')}
          </Text>
        ) : null}
        {data.session?.checkOutAt ? (
          <Text>
            Check-out lúc:{' '}
            {new Date(data.session.checkOutAt).toLocaleString('vi-VN')}
          </Text>
        ) : null}
      </Card>

      {status === 'CONFIRMED' ? (
        <PrimaryButton
          label="Check-in (GPS)"
          onPress={handleCheckIn}
          loading={checkInMutation.isPending}
        />
      ) : null}

      {status === 'ACTIVE' ? (
        <PrimaryButton
          label="Check-out (GPS)"
          onPress={handleCheckOut}
          loading={checkOutMutation.isPending}
        />
      ) : null}

      {data.incidents.length > 0 ? (
        <Card>
          <Text style={styles.title}>Sự cố</Text>
          {data.incidents.map((incident) => (
            <Text key={incident.id}>
              {incident.incidentType} ({incident.severity}) –{' '}
              {incident.status}
            </Text>
          ))}
        </Card>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
});
