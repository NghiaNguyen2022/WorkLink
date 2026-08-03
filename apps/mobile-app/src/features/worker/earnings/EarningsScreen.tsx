import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { getEarnings } from '../../../lib/workerPortalApi';
import { useAuth } from '../../../session/AuthContext';

export function EarningsScreen() {
  const { workerId } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['worker-earnings', workerId],
    queryFn: () => getEarnings(workerId as string, 'ALL'),
    enabled: Boolean(workerId),
  });

  return (
    <ScreenContainer
      refreshing={isRefetching}
      onRefresh={() => refetch()}
    >
      {isLoading ? <Text>Đang tải...</Text> : null}

      {data ? (
        <Card>
          <Text style={styles.title}>Tổng quan</Text>
          <Text>Tổng: {data.summary.total.toLocaleString('vi-VN')} đ</Text>
          <Text>
            Đã thanh toán: {data.summary.paid.toLocaleString('vi-VN')} đ
          </Text>
          <Text>
            Đang chờ: {data.summary.pending.toLocaleString('vi-VN')} đ
          </Text>
        </Card>
      ) : null}

      {data?.items.map((item) => (
        <Card key={item.payment.id}>
          <Text style={styles.title}>{item.job.title}</Text>
          <Text>{item.payment.amount.toLocaleString('vi-VN')} đ</Text>
          <Text>Trạng thái: {item.payment.status}</Text>
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
});
