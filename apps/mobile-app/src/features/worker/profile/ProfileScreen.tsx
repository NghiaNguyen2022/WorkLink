import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Card } from '../../../components/Card';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { getProfile, updateProfile } from '../../../lib/workerPortalApi';
import { useAuth } from '../../../session/AuthContext';

export function ProfileScreen() {
  const { workerId } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['worker-profile', workerId],
    queryFn: () => getProfile(workerId as string),
    enabled: Boolean(workerId),
  });

  const [biography, setBiography] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [minimumHourlyRate, setMinimumHourlyRate] = useState('');
  const [maxTravelKm, setMaxTravelKm] = useState('');
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (data) {
      setBiography(data.biography ?? '');
      setCurrentAddress(data.currentAddress ?? '');
      setMinimumHourlyRate(
        data.minimumHourlyRate ? String(data.minimumHourlyRate) : '',
      );
      setMaxTravelKm(String(data.maxTravelKm));
      setAvailable(data.available);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProfile(workerId as string, {
        biography,
        currentAddress,
        minimumHourlyRate: minimumHourlyRate
          ? Number(minimumHourlyRate)
          : undefined,
        maxTravelKm: maxTravelKm ? Number(maxTravelKm) : undefined,
        available,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['worker-profile', workerId],
      });
      Alert.alert('Đã lưu hồ sơ');
    },
    onError: (err) => {
      Alert.alert(
        'Không thể lưu hồ sơ',
        err instanceof Error ? err.message : 'Đã có lỗi xảy ra',
      );
    },
  });

  if (isLoading || !data) {
    return (
      <ScreenContainer>
        <Text>Đang tải hồ sơ...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Card>
        <View style={styles.row}>
          <Text style={styles.label}>Sẵn sàng nhận việc</Text>
          <Switch value={available} onValueChange={setAvailable} />
        </View>

        <Text style={styles.label}>Giới thiệu bản thân</Text>
        <TextInput
          style={styles.input}
          value={biography}
          onChangeText={setBiography}
          multiline
        />

        <Text style={styles.label}>Địa chỉ hiện tại</Text>
        <TextInput
          style={styles.input}
          value={currentAddress}
          onChangeText={setCurrentAddress}
        />

        <Text style={styles.label}>Mức lương tối thiểu (đ/giờ)</Text>
        <TextInput
          style={styles.input}
          value={minimumHourlyRate}
          onChangeText={setMinimumHourlyRate}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Bán kính di chuyển tối đa (km)</Text>
        <TextInput
          style={styles.input}
          value={maxTravelKm}
          onChangeText={setMaxTravelKm}
          keyboardType="numeric"
        />

        <PrimaryButton
          label="Lưu thay đổi"
          onPress={() => updateMutation.mutate()}
          loading={updateMutation.isPending}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
