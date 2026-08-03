import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';

import { Card } from '../../../components/Card';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ScreenContainer } from '../../../components/ScreenContainer';
import {
  getAssignment,
  setRelationship,
  submitReview,
} from '../../../lib/workerPortalApi';
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
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['worker-assignment', assignmentId],
    queryFn: () => getAssignment(workerId as string, assignmentId),
    enabled: Boolean(workerId),
  });

  const checkInMutation = useCheckIn(assignmentId);
  const checkOutMutation = useCheckOut(assignmentId);

  const reviewMutation = useMutation({
    mutationFn: () =>
      submitReview(workerId as string, {
        jobId: data!.assignment.jobId,
        assignmentId,
        overallRating: Number(rating) || 5,
        comment: comment || undefined,
      }),
    onError: (err) =>
      Alert.alert(
        'Gửi đánh giá thất bại',
        err instanceof Error ? err.message : 'Đã có lỗi xảy ra',
      ),
    onSuccess: () => Alert.alert('Đã gửi đánh giá'),
  });

  const relationshipMutation = useMutation({
    mutationFn: (preferenceType: 'PREFERRED' | 'BLOCKED') =>
      setRelationship(workerId as string, {
        jobId: data!.assignment.jobId,
        preferenceType,
        reason: `Đặt từ Worker App (${preferenceType})`,
      }),
    onError: (err) =>
      Alert.alert(
        'Không thể cập nhật',
        err instanceof Error ? err.message : 'Đã có lỗi xảy ra',
      ),
    onSuccess: () => Alert.alert('Đã cập nhật'),
  });

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

      {status === 'COMPLETED' ? (
        <Card>
          <Text style={styles.title}>Đánh giá khách hàng</Text>
          <Text>Điểm (1-5)</Text>
          <TextInput
            style={styles.input}
            value={rating}
            onChangeText={setRating}
            keyboardType="numeric"
          />
          <Text>Nhận xét</Text>
          <TextInput
            style={styles.input}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <PrimaryButton
            label="Gửi đánh giá"
            onPress={() => reviewMutation.mutate()}
            loading={reviewMutation.isPending}
          />
          <PrimaryButton
            label="Ưu tiên khách hàng này"
            variant="secondary"
            onPress={() =>
              relationshipMutation.mutate('PREFERRED')
            }
            loading={relationshipMutation.isPending}
          />
          <PrimaryButton
            label="Chặn khách hàng này"
            variant="danger"
            onPress={() =>
              relationshipMutation.mutate('BLOCKED')
            }
            loading={relationshipMutation.isPending}
          />
        </Card>
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
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
});
