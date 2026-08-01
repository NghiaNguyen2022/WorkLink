import { hash } from 'bcryptjs';
import { createPool, type PoolConnection } from 'mysql2/promise';

import { getMySqlPoolOptions } from './database.config';

const IDS = {
  adminUser: '00000000-0000-4000-8000-000000000001',
  operatorUser: '00000000-0000-4000-8000-000000000002',
  customerUser: '00000000-0000-4000-8000-000000000003',
  workerUser: '00000000-0000-4000-8000-000000000004',

  customerProfile: '00000000-0000-4000-8000-000000000101',
  customerLocation: '00000000-0000-4000-8000-000000000111',
  workerProfile: '00000000-0000-4000-8000-000000000201',
  workerSkillReception: '00000000-0000-4000-8000-000000000211',
  workerSkillHousekeeping: '00000000-0000-4000-8000-000000000212',
  workerAvailability: '00000000-0000-4000-8000-000000000221',

  categoryHousekeeping: '00000000-0000-4000-8000-000000000301',
  categoryCleaning: '00000000-0000-4000-8000-000000000302',
  categoryEventReception: '00000000-0000-4000-8000-000000000303',
  categoryWarehouse: '00000000-0000-4000-8000-000000000304',
  categoryElderCare: '00000000-0000-4000-8000-000000000305',
  categoryMc: '00000000-0000-4000-8000-000000000306',

  job: '00000000-0000-4000-8000-000000000401',
  requirementSkill: '00000000-0000-4000-8000-000000000411',
  requirementDress: '00000000-0000-4000-8000-000000000412',
  pricingQuote: '00000000-0000-4000-8000-000000000421',
  candidate: '00000000-0000-4000-8000-000000000431',
  assignment: '00000000-0000-4000-8000-000000000441',
  paymentDeposit: '00000000-0000-4000-8000-000000000451',
  supportCase: '00000000-0000-4000-8000-000000000461',
  auditLog: '00000000-0000-4000-8000-000000000471',
} as const;

async function seedUsers(
  connection: PoolConnection,
  passwordHash: string,
): Promise<void> {
  const users = [
    [
      IDS.adminUser,
      'admin@worklink.local',
      passwordHash,
      'Quản trị hệ thống WorkLink',
      '0900000000',
      'ADMIN',
      true,
    ],
    [
      IDS.operatorUser,
      'operator@worklink.local',
      passwordHash,
      'Nhân viên điều phối WorkLink',
      '0900000005',
      'OPERATOR',
      true,
    ],
    [
      IDS.customerUser,
      'customer@worklink.local',
      passwordHash,
      'Khách hàng mẫu',
      '0900000001',
      'CUSTOMER',
      true,
    ],
    [
      IDS.workerUser,
      'worker@worklink.local',
      passwordHash,
      'Nguyễn Thị Lan',
      '0900000002',
      'WORKER',
      true,
    ],
  ];

  for (const user of users) {
    await connection.execute(
      `INSERT INTO users
       (id, email, password_hash, full_name, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         password_hash = VALUES(password_hash),
         full_name = VALUES(full_name),
         phone = VALUES(phone),
         role = VALUES(role),
         is_active = VALUES(is_active)`,
      user,
    );
  }
}

async function seedCustomers(connection: PoolConnection): Promise<void> {
  await connection.execute(
    `INSERT INTO customer_profiles
     (id, user_id, customer_type, display_name, company_name,
      verification_status, rating, completed_jobs, is_blocked)
     VALUES (?, ?, 'BUSINESS', 'ABC Event Co., Ltd.',
             'ABC Event Co., Ltd.', 'VERIFIED', 4.70, 12, FALSE)
     ON DUPLICATE KEY UPDATE
       customer_type = VALUES(customer_type),
       display_name = VALUES(display_name),
       company_name = VALUES(company_name),
       verification_status = VALUES(verification_status),
       rating = VALUES(rating),
       completed_jobs = VALUES(completed_jobs),
       is_blocked = VALUES(is_blocked)`,
    [IDS.customerProfile, IDS.customerUser],
  );

  await connection.execute(
    `INSERT INTO customer_locations
     (id, customer_id, label, contact_name, contact_phone,
      address_line, ward, district, city, latitude, longitude, is_default)
     VALUES (?, ?, 'Địa điểm sự kiện', 'Nguyễn Văn An', '0900000011',
             '123 Nguyễn Lương Bằng', 'Tân Phú', 'Quận 7',
             'TP.HCM', 10.7298770, 106.7210400, TRUE)
     ON DUPLICATE KEY UPDATE
       label = VALUES(label),
       contact_name = VALUES(contact_name),
       contact_phone = VALUES(contact_phone),
       address_line = VALUES(address_line),
       ward = VALUES(ward),
       district = VALUES(district),
       city = VALUES(city),
       latitude = VALUES(latitude),
       longitude = VALUES(longitude),
       is_default = VALUES(is_default)`,
    [IDS.customerLocation, IDS.customerProfile],
  );
}

async function seedWorker(connection: PoolConnection): Promise<void> {
  await connection.execute(
    `INSERT INTO worker_profiles
     (id, user_id, date_of_birth, gender, identity_number,
      verification_level, verification_status, biography,
      current_address, current_district, current_city,
      latitude, longitude, transport_type, max_travel_km,
      minimum_hourly_rate, rating, completed_jobs,
      cancellation_rate, on_time_rate, available, is_suspended,
      emergency_contact_name, emergency_contact_phone)
     VALUES (?, ?, '1995-05-20', 'FEMALE', '079095000001',
             'V4', 'VERIFIED',
             'Có kinh nghiệm lễ tân sự kiện và dọn dẹp theo giờ.',
             'Quận 7, TP.HCM', 'Quận 7', 'TP.HCM',
             10.7352000, 106.7219000, 'MOTORBIKE', 15,
             70000.00, 4.80, 126, 1.50, 98.00, TRUE, FALSE,
             'Nguyễn Thị Mai', '0900000099')
     ON DUPLICATE KEY UPDATE
       verification_level = VALUES(verification_level),
       verification_status = VALUES(verification_status),
       biography = VALUES(biography),
       current_district = VALUES(current_district),
       current_city = VALUES(current_city),
       latitude = VALUES(latitude),
       longitude = VALUES(longitude),
       transport_type = VALUES(transport_type),
       max_travel_km = VALUES(max_travel_km),
       minimum_hourly_rate = VALUES(minimum_hourly_rate),
       rating = VALUES(rating),
       completed_jobs = VALUES(completed_jobs),
       cancellation_rate = VALUES(cancellation_rate),
       on_time_rate = VALUES(on_time_rate),
       available = VALUES(available),
       is_suspended = VALUES(is_suspended)`,
    [IDS.workerProfile, IDS.workerUser],
  );

  const skills = [
    [
      IDS.workerSkillReception,
      IDS.workerProfile,
      'event_reception',
      'Lễ tân sự kiện',
      'ADVANCED',
      'VERIFIED',
      82,
      4.90,
    ],
    [
      IDS.workerSkillHousekeeping,
      IDS.workerProfile,
      'housekeeping',
      'Giúp việc và dọn dẹp',
      'INTERMEDIATE',
      'VERIFIED',
      44,
      4.70,
    ],
  ];

  for (const skill of skills) {
    await connection.execute(
      `INSERT INTO worker_skills
       (id, worker_id, skill_code, skill_name, proficiency_level,
        verification_status, verified_at, completed_jobs, average_rating)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
       ON DUPLICATE KEY UPDATE
         skill_name = VALUES(skill_name),
         proficiency_level = VALUES(proficiency_level),
         verification_status = VALUES(verification_status),
         verified_at = VALUES(verified_at),
         completed_jobs = VALUES(completed_jobs),
         average_rating = VALUES(average_rating)`,
      skill,
    );
  }

  await connection.execute(
    `INSERT INTO worker_availability
     (id, worker_id, availability_type, day_of_week,
      start_time, end_time, service_areas, is_available)
     VALUES (?, ?, 'WEEKLY', 6, '06:00:00', '22:00:00',
             JSON_ARRAY('Quận 7', 'Nhà Bè', 'Quận 4'), TRUE)
     ON DUPLICATE KEY UPDATE
       availability_type = VALUES(availability_type),
       day_of_week = VALUES(day_of_week),
       start_time = VALUES(start_time),
       end_time = VALUES(end_time),
       service_areas = VALUES(service_areas),
       is_available = VALUES(is_available)`,
    [IDS.workerAvailability, IDS.workerProfile],
  );
}

async function seedCategories(connection: PoolConnection): Promise<void> {
  const categories = [
    [
      IDS.categoryHousekeeping,
      'housekeeping',
      'Giúp việc nhà theo giờ',
      'HOUR',
      2,
      70000,
      'MEDIUM',
      'ASSISTED',
      true,
      true,
    ],
    [
      IDS.categoryCleaning,
      'cleaning',
      'Dọn dẹp và lao công',
      'HOUR',
      2,
      65000,
      'LOW',
      'ASSISTED',
      true,
      false,
    ],
    [
      IDS.categoryEventReception,
      'event_reception',
      'Lễ tân và hỗ trợ sự kiện',
      'SHIFT',
      4,
      600000,
      'MEDIUM',
      'ASSISTED',
      true,
      true,
    ],
    [
      IDS.categoryWarehouse,
      'warehouse_helper',
      'Phụ kho và đóng gói',
      'HOUR',
      4,
      65000,
      'LOW',
      'INSTANT',
      true,
      false,
    ],
    [
      IDS.categoryElderCare,
      'elder_care',
      'Hỗ trợ chăm sóc người cao tuổi',
      'HOUR',
      4,
      90000,
      'HIGH',
      'CONTROLLED',
      true,
      true,
    ],
    [
      IDS.categoryMc,
      'event_mc',
      'MC sự kiện',
      'SHIFT',
      2,
      1500000,
      'HIGH',
      'CONTROLLED',
      true,
      true,
    ],
  ];

  for (const category of categories) {
    await connection.execute(
      `INSERT INTO job_categories
       (id, code, name, pricing_unit, minimum_hours,
        base_rate, risk_level, matching_mode,
        requires_verification, requires_training, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         pricing_unit = VALUES(pricing_unit),
         minimum_hours = VALUES(minimum_hours),
         base_rate = VALUES(base_rate),
         risk_level = VALUES(risk_level),
         matching_mode = VALUES(matching_mode),
         requires_verification = VALUES(requires_verification),
         requires_training = VALUES(requires_training),
         active = TRUE`,
      category,
    );
  }
}

async function seedSampleJob(connection: PoolConnection): Promise<void> {
  await connection.execute(
    `INSERT INTO jobs
     (id, job_code, customer_id, category_id, location_id,
      title, description, status, matching_mode, risk_level,
      headcount, start_at, end_at, break_minutes,
      customer_budget, suggested_price, agreed_price,
      worker_payout_rate, worker_payout_amount,
      platform_fee_amount, dress_code, tools_provided_by,
      special_notes, published_at, verified_at, verified_by_user_id)
     VALUES (?, 'JOB-20260815-001', ?, ?, ?,
             'Lễ tân sự kiện khai trương',
             'Đón khách, hướng dẫn check-in và hỗ trợ khu vực lễ tân.',
             'MATCHING', 'ASSISTED', 'MEDIUM',
             4, '2026-08-15 00:00:00', '2026-08-15 10:00:00', 60,
             600000.00, 680000.00, 680000.00,
             75.00, 510000.00, 170000.00,
             'Áo dài do đơn vị tổ chức cung cấp', 'CUSTOMER',
             'Có ăn trưa, cần đến trước 30 phút.',
             CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       description = VALUES(description),
       status = VALUES(status),
       customer_budget = VALUES(customer_budget),
       suggested_price = VALUES(suggested_price),
       agreed_price = VALUES(agreed_price),
       worker_payout_rate = VALUES(worker_payout_rate),
       worker_payout_amount = VALUES(worker_payout_amount),
       platform_fee_amount = VALUES(platform_fee_amount)`,
    [
      IDS.job,
      IDS.customerProfile,
      IDS.categoryEventReception,
      IDS.customerLocation,
      IDS.operatorUser,
    ],
  );

  const requirements = [
    [
      IDS.requirementSkill,
      IDS.job,
      'SKILL',
      'event_reception',
      'Đã được xác minh kỹ năng lễ tân sự kiện',
      true,
      'INTERMEDIATE',
    ],
    [
      IDS.requirementDress,
      IDS.job,
      'BEHAVIOR',
      'professional_appearance',
      'Tác phong lịch sự và giao tiếp tốt',
      true,
      null,
    ],
  ];

  for (const requirement of requirements) {
    await connection.execute(
      `INSERT INTO job_requirements
       (id, job_id, requirement_type, requirement_code,
        description, mandatory, minimum_level)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         requirement_type = VALUES(requirement_type),
         requirement_code = VALUES(requirement_code),
         description = VALUES(description),
         mandatory = VALUES(mandatory),
         minimum_level = VALUES(minimum_level)`,
      requirement,
    );
  }

  await connection.execute(
    `INSERT INTO pricing_quotes
     (id, job_id, quote_version, quote_status,
      base_amount, time_surcharge, location_surcharge,
      skill_surcharge, urgency_surcharge, risk_surcharge,
      retention_fee, customer_total, worker_payout_rate,
      worker_payout_amount, platform_fee_amount,
      calculation_details, created_by_user_id)
     VALUES (?, ?, 1, 'ACCEPTED',
             520000.00, 50000.00, 30000.00,
             80000.00, 0.00, 0.00,
             0.00, 680000.00, 75.00,
             510000.00, 170000.00,
             JSON_OBJECT(
               'baseRule', 'event_reception_shift',
               'timeReason', 'early_start',
               'locationReason', 'district_7',
               'skillReason', 'verified_reception'
             ), ?)
     ON DUPLICATE KEY UPDATE
       quote_status = VALUES(quote_status),
       base_amount = VALUES(base_amount),
       time_surcharge = VALUES(time_surcharge),
       location_surcharge = VALUES(location_surcharge),
       skill_surcharge = VALUES(skill_surcharge),
       customer_total = VALUES(customer_total),
       worker_payout_rate = VALUES(worker_payout_rate),
       worker_payout_amount = VALUES(worker_payout_amount),
       platform_fee_amount = VALUES(platform_fee_amount),
       calculation_details = VALUES(calculation_details)`,
    [IDS.pricingQuote, IDS.job, IDS.operatorUser],
  );

  await connection.execute(
    `INSERT INTO job_candidates
     (id, job_id, worker_id, status, rank_order,
      total_score, score_breakdown, reasons, warnings,
      proposed_payout)
     VALUES (?, ?, ?, 'ACCEPTED', 1,
             91.00,
             JSON_OBJECT(
               'skill', 25,
               'schedule', 20,
               'location', 14,
               'experience', 10,
               'quality', 9,
               'reliability', 8,
               'price', 3,
               'training', 2
             ),
             JSON_ARRAY(
               'Đã xác minh kỹ năng lễ tân',
               'Trống lịch',
               'Gần địa điểm làm việc'
             ),
             JSON_ARRAY(),
             510000.00)
     ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       rank_order = VALUES(rank_order),
       total_score = VALUES(total_score),
       score_breakdown = VALUES(score_breakdown),
       reasons = VALUES(reasons),
       warnings = VALUES(warnings),
       proposed_payout = VALUES(proposed_payout)`,
    [IDS.candidate, IDS.job, IDS.workerProfile],
  );

  await connection.execute(
    `INSERT INTO assignments
     (id, job_id, worker_id, candidate_id,
      status, agreed_payout, retention_amount)
     VALUES (?, ?, ?, ?, 'CONFIRMED', 510000.00, 0.00)
     ON DUPLICATE KEY UPDATE
       candidate_id = VALUES(candidate_id),
       status = VALUES(status),
       agreed_payout = VALUES(agreed_payout),
       retention_amount = VALUES(retention_amount)`,
    [IDS.assignment, IDS.job, IDS.workerProfile, IDS.candidate],
  );

  await connection.execute(
    `INSERT INTO payments
     (id, job_id, assignment_id, payment_type,
      status, amount, currency, provider)
     VALUES (?, ?, ?, 'CUSTOMER_DEPOSIT',
             'PAID', 680000.00, 'VND', 'MANUAL')
     ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       amount = VALUES(amount),
       currency = VALUES(currency),
       provider = VALUES(provider)`,
    [IDS.paymentDeposit, IDS.job, IDS.assignment],
  );
}

async function seedOperations(connection: PoolConnection): Promise<void> {
  await connection.execute(
    `INSERT INTO support_cases
     (id, case_code, job_id, opened_by_user_id,
      assigned_to_user_id, case_type, priority,
      status, subject, description)
     VALUES (?, 'CASE-20260801-001', ?, ?, ?,
             'JOB_VERIFICATION', 'NORMAL', 'RESOLVED',
             'Xác minh yêu cầu công việc',
             'Đã liên hệ khách hàng và chuẩn hóa yêu cầu lễ tân sự kiện.')
     ON DUPLICATE KEY UPDATE
       assigned_to_user_id = VALUES(assigned_to_user_id),
       case_type = VALUES(case_type),
       priority = VALUES(priority),
       status = VALUES(status),
       subject = VALUES(subject),
       description = VALUES(description)`,
    [
      IDS.supportCase,
      IDS.job,
      IDS.customerUser,
      IDS.operatorUser,
    ],
  );

  await connection.execute(
    `INSERT INTO audit_logs
     (id, actor_user_id, action, entity_type,
      entity_id, after_data)
     VALUES (?, ?, 'SEED_BASELINE', 'JOB', ?,
             JSON_OBJECT(
               'status', 'MATCHING',
               'source', 'baseline-02.1'
             ))
     ON DUPLICATE KEY UPDATE
       actor_user_id = VALUES(actor_user_id),
       action = VALUES(action),
       after_data = VALUES(after_data)`,
    [IDS.auditLog, IDS.adminUser, IDS.job],
  );
}

async function runSeed(): Promise<void> {
  const pool = createPool(getMySqlPoolOptions());
  const connection = await pool.getConnection();

  try {
    console.log('Starting WorkLink seed...');

    await connection.beginTransaction();

    const passwordHash = await hash('Admin@123', 10);

    await seedUsers(connection, passwordHash);
    await seedCustomers(connection);
    await seedWorker(connection);
    await seedCategories(connection);
    await seedSampleJob(connection);
    await seedOperations(connection);

    await connection.commit();

    console.log('WorkLink seed completed successfully.');
    console.log('');
    console.log('Accounts:');
    console.log('  admin@worklink.local');
    console.log('  operator@worklink.local');
    console.log('  customer@worklink.local');
    console.log('  worker@worklink.local');
    console.log('  Password: Admin@123');
  } catch (error: unknown) {
    await connection.rollback();

    console.error('WorkLink seed failed.');

    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

void runSeed();
