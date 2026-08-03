import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, StyleSheet, Text } from 'react-native';

import { Card } from '../../../components/Card';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { listOffers, respondOffer } from '../../../lib/workerPortalApi';
import { useAuth } from '../../../session/AuthContext';
import type { WorkerOffer } from '../../../types/worker-portal';

export function JobFeedScreen() {
  const { workerId } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['worker-offers', workerId],
    queryFn: () => listOffers(workerId as string),
    enabled: Boolean(workerId),
  });

  const respondMutation = useMutation({
    mutationFn: ({
      offerId,
      decision,
    }: {
      offerId: string;
      decision: 'ACCEPT' | 'REJECT';
    }) => respondOffer(workerId as string, offerId, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['worker-offers', workerId],
      });
      queryClient.invalidateQueries({
        queryKey: ['worker-dashboard', workerId],
      });
    },
    onError: (err) => {
      Alert.alert(
        'Không thể phản hồi offer',
        err instanceof Error ? err.message : 'Đã có lỗi xảy ra',
      );
    },
  });

  return (
    <ScreenContainer
      refreshing={isRefetching}
      onRefresh={() => refetch()}
    >
      {isLoading ? <Text>Đang tải offer...</Text> : null}

      {data && data.length === 0 ? (
        <Text>Hiện chưa có offer công việc nào.</Text>
      ) : null}

      {data?.map((offer) => (
        <OfferCard
          key={offer.offerId}
          offer={offer}
          isResponding={respondMutation.isPending}
          onAccept={() =>
            respondMutation.mutate({
              offerId: offer.offerId,
              decision: 'ACCEPT',
            })
          }
          onReject={() =>
            respondMutation.mutate({
              offerId: offer.offerId,
              decision: 'REJECT',
            })
          }
        />
      ))}
    </ScreenContainer>
  );
}

function OfferCard({
  offer,
  isResponding,
  onAccept,
  onReject,
}: {
  offer: WorkerOffer;
  isResponding: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <Card>
      <Text style={styles.title}>{offer.jobTitle}</Text>
      <Text style={styles.meta}>Mã việc: {offer.jobCode}</Text>
      <Text style={styles.meta}>
        {new Date(offer.startAt).toLocaleString('vi-VN')} –{' '}
        {new Date(offer.endAt).toLocaleString('vi-VN')}
      </Text>
      <Text style={styles.payout}>
        {offer.proposedPayout.toLocaleString('vi-VN')} đ
      </Text>
      {offer.reasons && offer.reasons.length > 0 ? (
        <Text style={styles.reasons}>{offer.reasons.join(' · ')}</Text>
      ) : null}

      <PrimaryButton
        label="Chấp nhận"
        onPress={onAccept}
        loading={isResponding}
      />
      <PrimaryButton
        label="Từ chối"
        onPress={onReject}
        loading={isResponding}
        variant="secondary"
      />
    </Card>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  reasons: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
});
