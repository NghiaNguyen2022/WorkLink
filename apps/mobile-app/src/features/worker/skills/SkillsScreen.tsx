import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { listCertificates, listSkills } from '../../../lib/workerPortalApi';
import { useAuth } from '../../../session/AuthContext';

export function SkillsScreen() {
  const { workerId } = useAuth();

  const skillsQuery = useQuery({
    queryKey: ['worker-skills', workerId],
    queryFn: () => listSkills(workerId as string),
    enabled: Boolean(workerId),
  });

  const certificatesQuery = useQuery({
    queryKey: ['worker-certificates', workerId],
    queryFn: () => listCertificates(workerId as string),
    enabled: Boolean(workerId),
  });

  return (
    <ScreenContainer
      refreshing={skillsQuery.isRefetching || certificatesQuery.isRefetching}
      onRefresh={() => {
        skillsQuery.refetch();
        certificatesQuery.refetch();
      }}
    >
      <Text style={styles.section}>Kỹ năng</Text>
      {skillsQuery.data?.map((skill) => (
        <Card key={skill.id}>
          <Text style={styles.title}>{skill.skillName}</Text>
          <Text>Mức độ: {skill.proficiencyLevel}</Text>
          <Text>Xác minh: {skill.verificationStatus}</Text>
        </Card>
      ))}

      <Text style={styles.section}>Chứng chỉ</Text>
      {certificatesQuery.data?.map((certificate) => (
        <Card key={certificate.id}>
          <Text style={styles.title}>{certificate.certificateCode}</Text>
          <Text>Số: {certificate.certificateNumber}</Text>
          <Text>Trạng thái: {certificate.status}</Text>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
});
