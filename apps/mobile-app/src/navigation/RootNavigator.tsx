import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../features/auth/LoginScreen';
import { AssignmentDetailScreen } from '../features/worker/assignments/AssignmentDetailScreen';
import { AssignmentsListScreen } from '../features/worker/assignments/AssignmentsListScreen';
import { AvailabilityScreen } from '../features/worker/availability/AvailabilityScreen';
import { DashboardScreen } from '../features/worker/dashboard/DashboardScreen';
import { EarningsScreen } from '../features/worker/earnings/EarningsScreen';
import { JobFeedScreen } from '../features/worker/job-feed/JobFeedScreen';
import { ProfileScreen } from '../features/worker/profile/ProfileScreen';
import { SkillsScreen } from '../features/worker/skills/SkillsScreen';
import { useAuth } from '../session/AuthContext';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: 'Trang chủ' }}
          />
          <Stack.Screen
            name="Offers"
            component={JobFeedScreen}
            options={{ title: 'Offer công việc' }}
          />
          <Stack.Screen
            name="Assignments"
            component={AssignmentsListScreen}
            options={{ title: 'Công việc của tôi' }}
          />
          <Stack.Screen
            name="AssignmentDetail"
            component={AssignmentDetailScreen}
            options={{ title: 'Chi tiết công việc' }}
          />
          <Stack.Screen
            name="Earnings"
            component={EarningsScreen}
            options={{ title: 'Thu nhập' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Hồ sơ cá nhân' }}
          />
          <Stack.Screen
            name="Availability"
            component={AvailabilityScreen}
            options={{ title: 'Lịch rảnh' }}
          />
          <Stack.Screen
            name="Skills"
            component={SkillsScreen}
            options={{ title: 'Kỹ năng & chứng chỉ' }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
