import { apiDelete, apiGet, apiPatch, apiPost } from './api';
import type {
  AssignmentExecution,
  LoginResponse,
  WorkerAvailability,
  WorkerCertificate,
  WorkerDashboard,
  WorkerEarnings,
  WorkerOffer,
  WorkerProfile,
  WorkerSkill,
} from '../types/worker-portal';

export function login(email: string, password: string) {
  return apiPost<LoginResponse>('/auth/login', {
    email,
    password,
  });
}

export function getDashboard(workerId: string) {
  return apiGet<WorkerDashboard>(
    `/worker-portal/workers/${workerId}/dashboard`,
  );
}

export function getProfile(workerId: string) {
  return apiGet<WorkerProfile>(
    `/worker-portal/workers/${workerId}/profile`,
  );
}

export function updateProfile(
  workerId: string,
  input: Partial<{
    biography: string;
    currentAddress: string;
    currentDistrict: string;
    currentCity: string;
    transportType: string;
    maxTravelKm: number;
    minimumHourlyRate: number;
    available: boolean;
    emergencyContactName: string;
    emergencyContactPhone: string;
  }>,
) {
  return apiPatch<WorkerProfile>(
    `/worker-portal/workers/${workerId}/profile`,
    input,
  );
}

export function listAvailability(workerId: string) {
  return apiGet<WorkerAvailability[]>(
    `/worker-portal/workers/${workerId}/availability`,
  );
}

export function createAvailability(
  workerId: string,
  input: {
    availabilityType?: string;
    dayOfWeek?: number;
    specificDate?: string;
    startTime: string;
    endTime: string;
    serviceAreas?: string[];
    isAvailable?: boolean;
  },
) {
  return apiPost<WorkerAvailability[]>(
    `/worker-portal/workers/${workerId}/availability`,
    input,
  );
}

export function deleteAvailability(
  workerId: string,
  availabilityId: string,
) {
  return apiDelete<WorkerAvailability[]>(
    `/worker-portal/workers/${workerId}/availability/${availabilityId}`,
  );
}

export function listSkills(workerId: string) {
  return apiGet<WorkerSkill[]>(
    `/worker-portal/workers/${workerId}/skills`,
  );
}

export function listCertificates(workerId: string) {
  return apiGet<WorkerCertificate[]>(
    `/worker-portal/workers/${workerId}/certificates`,
  );
}

export function listOffers(workerId: string) {
  return apiGet<WorkerOffer[]>(
    `/worker-portal/workers/${workerId}/offers`,
  );
}

export function respondOffer(
  workerId: string,
  offerId: string,
  decision: 'ACCEPT' | 'REJECT',
  note?: string,
) {
  return apiPost(
    `/worker-portal/workers/${workerId}/offers/${offerId}/respond`,
    { decision, note },
  );
}

export function listAssignments(workerId: string) {
  return apiGet<
    Array<{
      assignment: {
        id: string;
        jobId: string;
        status: string;
        agreedPayout: number;
      };
      job: { id: string; title: string; startAt: string; endAt: string };
    }>
  >(`/worker-portal/workers/${workerId}/assignments`);
}

export function getAssignment(workerId: string, assignmentId: string) {
  return apiGet<AssignmentExecution>(
    `/worker-portal/workers/${workerId}/assignments/${assignmentId}`,
  );
}

export function checkIn(
  workerId: string,
  assignmentId: string,
  input: {
    latitude: number;
    longitude: number;
    method?: string;
    note?: string;
  },
) {
  return apiPost<AssignmentExecution>(
    `/worker-portal/workers/${workerId}/assignments/${assignmentId}/check-in`,
    input,
  );
}

export function checkOut(
  workerId: string,
  assignmentId: string,
  input: {
    latitude: number;
    longitude: number;
    method?: string;
    note?: string;
  },
) {
  return apiPost<AssignmentExecution>(
    `/worker-portal/workers/${workerId}/assignments/${assignmentId}/check-out`,
    input,
  );
}

export function createIncident(
  workerId: string,
  assignmentId: string,
  input: {
    incidentType: string;
    severity: string;
    description: string;
  },
) {
  return apiPost<AssignmentExecution>(
    `/worker-portal/workers/${workerId}/assignments/${assignmentId}/incidents`,
    input,
  );
}

export function getEarnings(
  workerId: string,
  status: 'PENDING' | 'PAID' | 'ALL' = 'ALL',
) {
  return apiGet<WorkerEarnings>(
    `/worker-portal/workers/${workerId}/earnings?status=${status}`,
  );
}
