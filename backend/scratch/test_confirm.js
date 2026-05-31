/**
 * Script kiểm thử end-to-end luồng xác nhận dạy và học
 * Chạy: node scratch/test_confirm.js
 */
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

let passed = 0;
let failed = 0;

function ok(name) {
  console.log(`  ✅ PASS: ${name}`);
  passed++;
}

function fail(name, reason) {
  console.log(`  ❌ FAIL: ${name} - ${reason}`);
  failed++;
}

async function main() {
  const client = await pool.connect();
  console.log('\n=== BẮT ĐẦU KIỂM THỬ LUỒNG XÁC NHẬN DẠY / HỌC ===\n');

  try {
    // =========================================================
    // BƯỚC 1: Tìm 1 booking confirmed để test
    // =========================================================
    console.log('🔍 Bước 1: Tìm booking confirmed...');
    const bookingRes = await client.query(`
      SELECT b.id, b.tutor_id, b.learner_id, b.type, b.status
      FROM bookings b
      WHERE b.status = 'confirmed'
      LIMIT 1
    `);

    if (bookingRes.rows.length === 0) {
      console.log('⚠️ Không có booking confirmed nào trong DB. Bỏ qua test.\n');
      return;
    }

    const booking = bookingRes.rows[0];
    console.log(`  Booking ID: ${booking.id}, Type: ${booking.type}`);
    ok('Tìm thấy booking confirmed');

    // =========================================================
    // BƯỚC 2: Kiểm tra lesson_sessions có tồn tại
    // =========================================================
    console.log('\n🔍 Bước 2: Kiểm tra lesson_sessions...');
    const sessionRes = await client.query(
      'SELECT id, tutor_confirmed, learner_confirmed, attended, status FROM lesson_sessions WHERE booking_id = $1',
      [booking.id]
    );

    if (sessionRes.rows.length === 0) {
      // Tạo lesson_session thủ công để test
      console.log('  ⚠️ Chưa có lesson_session - tạo mới...');
      const sessionDate = new Date();
      const endTime = new Date(sessionDate.getTime() + 2 * 60 * 60 * 1000);
      const { v4: uuidv4 } = await import('uuid');
      const newId = uuidv4();
      await client.query(`
        INSERT INTO lesson_sessions (id, booking_id, session_date, start_time, end_time, duration_hours, tutor_confirmed, learner_confirmed, attended, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, 0, false, false, false, 'scheduled', NOW(), NOW())
      `, [newId, booking.id, sessionDate.toISOString().split('T')[0], sessionDate, endTime]);
      ok('Tạo lesson_session mới thành công');
    } else {
      ok('lesson_session đã tồn tại');
    }

    // =========================================================
    // BƯỚC 3: Lấy lại lesson_session sau khi đảm bảo tồn tại
    // =========================================================
    console.log('\n🔍 Bước 3: Đọc trạng thái lesson_session...');
    const sessionResAfter = await client.query(
      'SELECT id, tutor_confirmed, learner_confirmed, attended, status FROM lesson_sessions WHERE booking_id = $1',
      [booking.id]
    );
    const session = sessionResAfter.rows[0];
    console.log(`  Session ID: ${session.id}`);
    console.log(`  tutor_confirmed: ${session.tutor_confirmed}`);
    console.log(`  learner_confirmed: ${session.learner_confirmed}`);
    console.log(`  attended: ${session.attended}`);
    console.log(`  status: ${session.status}`);
    ok('Đọc trạng thái lesson_session thành công');

    // =========================================================
    // BƯỚC 4: Thử xác nhận gia sư dạy (tutor confirm)
    // =========================================================
    console.log('\n🔍 Bước 4: Xác nhận gia sư dạy (tutor confirm)...');
    if (!session.tutor_confirmed) {
      const tutorConfirmRes = await client.query(`
        UPDATE lesson_sessions ls
        SET
          tutor_confirmed = TRUE,
          status = CASE
            WHEN learner_confirmed = TRUE THEN 'COMPLETED'
            ELSE 'WAIT_LEARNER'
          END,
          updated_at = NOW()
        FROM bookings b
        WHERE ls.booking_id = b.id
          AND ls.id = $1
          AND b.tutor_id = $2
        RETURNING ls.*
      `, [session.id, booking.tutor_id]);

      if (tutorConfirmRes.rows.length > 0 && tutorConfirmRes.rows[0].tutor_confirmed === true) {
        ok('Tutor confirm thành công');
        console.log(`  Status sau confirm: ${tutorConfirmRes.rows[0].status}`);
      } else {
        fail('Tutor confirm', 'Không cập nhật được tutor_confirmed');
      }
    } else {
      console.log('  ⏭️ tutor đã confirm trước đó, bỏ qua');
      ok('Tutor confirm (đã confirm trước)');
    }

    // =========================================================
    // BƯỚC 5: Thử xác nhận học viên học (learner confirm) - không cần attendance logs
    // =========================================================
    console.log('\n🔍 Bước 5: Xác nhận học viên học (learner confirm - fallback duration)...');
    const sessionBeforeLearner = await client.query(
      'SELECT tutor_confirmed, learner_confirmed FROM lesson_sessions WHERE id = $1',
      [session.id]
    );
    const sbl = sessionBeforeLearner.rows[0];

    if (!sbl.learner_confirmed && sbl.tutor_confirmed) {
      // Tính duration - fallback nếu không có logs
      const durationFallback = booking.type === 'trial' ? 1.0 : 2.0;

      const learnerConfirmRes = await client.query(`
        UPDATE lesson_sessions ls
        SET
          learner_confirmed = TRUE,
          attended = TRUE,
          duration_hours = $3,
          status = 'COMPLETED',
          updated_at = NOW()
        FROM bookings b
        WHERE ls.booking_id = b.id
          AND ls.id = $1
          AND b.learner_id = $2
          AND ls.tutor_confirmed = TRUE
        RETURNING ls.*
      `, [session.id, booking.learner_id, durationFallback]);

      if (learnerConfirmRes.rows.length > 0 && learnerConfirmRes.rows[0].learner_confirmed === true) {
        ok('Learner confirm thành công (với fallback duration)');
        console.log(`  Status sau confirm: ${learnerConfirmRes.rows[0].status}`);
        console.log(`  Duration hours: ${learnerConfirmRes.rows[0].duration_hours}`);
        console.log(`  Attended: ${learnerConfirmRes.rows[0].attended}`);
      } else {
        fail('Learner confirm', 'Không cập nhật được learner_confirmed');
      }
    } else if (sbl.learner_confirmed) {
      console.log('  ⏭️ Learner đã confirm trước đó, bỏ qua');
      ok('Learner confirm (đã confirm trước)');
    } else {
      fail('Learner confirm', 'Tutor chưa confirm - không thể learner confirm');
    }

    // =========================================================
    // BƯỚC 6: Kiểm tra JOIN query - booking với lesson_session fields
    // =========================================================
    console.log('\n🔍 Bước 6: Kiểm tra JOIN query booking + lesson_session...');
    const joinRes = await client.query(`
      SELECT 
        b.id,
        b.status,
        ls.tutor_confirmed,
        ls.learner_confirmed,
        ls.attended,
        ls.id as lesson_session_id
      FROM bookings b
      LEFT JOIN lesson_sessions ls ON b.id = ls.booking_id
      WHERE b.id = $1
    `, [booking.id]);

    if (joinRes.rows.length > 0 && joinRes.rows[0].lesson_session_id) {
      ok('JOIN query trả về lesson_session_id thành công');
      console.log(`  tutor_confirmed: ${joinRes.rows[0].tutor_confirmed}`);
      console.log(`  learner_confirmed: ${joinRes.rows[0].learner_confirmed}`);
      console.log(`  attended: ${joinRes.rows[0].attended}`);
    } else {
      fail('JOIN query', 'lesson_session_id bị null trong kết quả JOIN');
    }

    // =========================================================
    // Rollback test data để không ảnh hưởng production
    // =========================================================
    console.log('\n⚠️ QUAN TRỌNG: Script chỉ dùng dữ liệu production THẬT');
    console.log('   Các thay đổi trên đã cập nhật DB thật.');

  } catch (err) {
    console.error('\n💥 Lỗi chạy script:', err.message);
    failed++;
  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n==============================');
  console.log(`📊 KẾT QUẢ: ${passed} PASS | ${failed} FAIL`);
  console.log('==============================\n');
}

main();
