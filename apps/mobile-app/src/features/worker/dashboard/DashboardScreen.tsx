import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { getDashboard } from '../../../lib/workerPortalApi';
import type { RootStackParamList } from '../../../navigation/types';
import { useAuth } from '../../../session/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { workerId, user, logout } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['worker-dashboard', workerId],
    queryFn: () => getDashboard(workerId as string),
    enabled: Boolean(workerId),
  });

  return (
    <ScreenContainer
      refreshing={isRefetching}
      onRefresh={() => refetch()}
    >
      <Text style={styles.greeting}>Xin chào, {user?.fullName}</Text>

      {isLoading ? <Text>Đang tải...</Text> : null}

      {data ? (
        <View style={styles.statsGrid}>
          <StatTile label="Đang làm" value={data.activeAssignments} />
          <StatTile label="Chờ xác nhận" value={data.waitingConfirmation} />
          <StatTile label="Offer chờ" value={data.pendingOffers} />
          <StatTile label="Đã hoàn thành" value={data.completedAssignments} />
        </View>
      ) : null}

      {data ? (
        <Card>
          <Text style={styles.cardTitle}>Thu nhập</Text>
          <Text>Đã nhận: {formatVnd(data.totalEarned)}</Text>
          <Text>Đang chờ: {formatVnd(data.pendingEarnings)}</Text>
          <Text>Tháng này: {formatVnd(data.earningsThisMonth)}</Text>
        </Card>
      ) : null}

      <Card>
        <PrimaryButton
          label="Offer công việc"
          onPress={() => navigation.navigate('Offers')}
        />
        <PrimaryButton
          label="Công việc của tôi"
          onPress={() => navigation.navigate('Assignments')}
          variant="secondary"
        />
        <PrimaryButton
          label="Thu nhập"
          onPress={() => navigation.navigate('Earnings')}
          variant="secondary"
        />
        <PrimaryButton
          label="Lịch rảnh"
          onPress={() => navigation.navigate('Availability')}
          variant="secondary"
        />
        <PrimaryButton
          label="Hồ sơ cá nhân"
          onPress={() => navigation.navigate('Profile')}
          variant="secondary"
        />
        <PrimaryButton
          label="Kỹ năng"
          onPress={() => navigation.navigate('Skills')}
          variant="secondary"
        />
        <PrimaryButton
          label="Metric cá nhân"
          onPress={() => navigation.navigate('Metrics')}
          variant="secondary"
        />
      </Card>

      <PrimaryButton
        label="Đăng xuất"
        onPress={() => logout()}
        variant="danger"
      />
    </ScreenContainer>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function formatVnd(value: number) {
  return `${value.toLocaleString('vi-VN')} đ`;
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
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
