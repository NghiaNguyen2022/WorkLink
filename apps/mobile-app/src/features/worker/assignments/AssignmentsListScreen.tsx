import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { listAssignments } from '../../../lib/workerPortalApi';
import type { RootStackParamList } from '../../../navigation/types';
import { useAuth } from '../../../session/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Assignments'>;

export function AssignmentsListScreen({ navigation }: Props) {
  const { workerId } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['worker-assignments', workerId],
    queryFn: () => listAssignments(workerId as string),
    enabled: Boolean(workerId),
  });

  return (
    <ScreenContainer
      refreshing={isRefetching}
      onRefresh={() => refetch()}
    >
      {isLoading ? <Text>Đang tải...</Text> : null}

      {data && data.length === 0 ? (
        <Text>Bạn chưa có công việc nào được xác nhận.</Text>
      ) : null}

      {data?.map((item) => (
        <Pressable
          key={item.assignment.id}
          onPress={() =>
            navigation.navigate('AssignmentDetail', {
              assignmentId: item.assignment.id,
            })
          }
        >
          <Card>
            <Text style={styles.title}>{item.job.title}</Text>
            <Text style={styles.meta}>
              Trạng thái: {item.assignment.status}
            </Text>
            <Text style={styles.meta}>
              {new Date(item.job.startAt).toLocaleString('vi-VN')} –{' '}
              {new Date(item.job.endAt).toLocaleString('vi-VN')}
            </Text>
            <Text style={styles.payout}>
              {item.assignment.agreedPayout.toLocaleString('vi-VN')} đ
            </Text>
          </Card>
        </Pressable>
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
  meta: {
    fontSize: 13,
    color: '#475569',
  },
  payout: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D4ED8',
  },
});
