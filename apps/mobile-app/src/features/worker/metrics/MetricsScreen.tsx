import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { getProfile } from '../../../lib/workerPortalApi';
import { useAuth } from '../../../session/AuthContext';

export function MetricsScreen() {
  const { workerId } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['worker-profile', workerId],
    queryFn: () => getProfile(workerId as string),
    enabled: Boolean(workerId),
  });

  if (isLoading || !data) {
    return (
      <ScreenContainer>
        <Text>Đang tải metric...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      refreshing={isRefetching}
      onRefresh={() => refetch()}
    >
      <View style={styles.statsGrid}>
        <StatTile
          label="Điểm đánh giá"
          value={data.rating.toFixed(1)}
        />
        <StatTile
          label="Job hoàn thành"
          value={String(data.completedJobs)}
        />
        <StatTile
          label="Tỷ lệ đúng giờ"
          value={`${data.onTimeRate}%`}
        />
        <StatTile
          label="Tỷ lệ hủy"
          value={`${data.cancellationRate}%`}
        />
      </View>

      <Card>
        <Text style={styles.cardTitle}>Xác minh</Text>
        <Text>Cấp xác minh: {data.verificationLevel}</Text>
        <Text>Trạng thái: {data.verificationStatus}</Text>
        <Text>
          Sẵn sàng nhận việc:{' '}
          {data.available ? 'Có' : 'Không'}
        </Text>
      </Card>
    </ScreenContainer>
  );
}

function StatTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statTile: {
    flexBasis: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  statLabel: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
});
