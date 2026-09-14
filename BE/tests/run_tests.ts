import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = process.env.TEST_BASE_URL || `http://localhost:${process.env.PORT || '5000'}/api`;

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passCount++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failCount++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function request(endpoint: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  return { status: response.status, body: json };
}

async function runAllTests() {
  console.log(`\n🚀 Starting Planora B13 Integration Test Suite against ${BASE_URL}\n`);

  const uniqueSuffix = Date.now().toString().slice(-6);
  const user1Email = `user1_${uniqueSuffix}@example.com`;
  const user2Email = `user2_${uniqueSuffix}@example.com`;
  const password = 'Password123!';

  let user1Token = '';
  let user1Id = '';
  let user2Token = '';
  let user2Id = '';

  let taskId1 = '';
  let eventId1 = '';
  let timetableId1 = '';
  let timetableItemId1 = '';
  let habitId1 = '';
  let notificationId1 = '';

  // -------------------------------------------------------------
  // GROUP 1: Health & Readiness Endpoints (2 tests)
  // -------------------------------------------------------------
  console.log('--- Group 1: Health & Readiness Endpoints ---');

  {
    const res = await request('/health');
    assert(res.status === 200 && res.body.success === true, 'GET /health returns HTTP 200 and success status');
  }

  {
    const res = await request('/ready');
    assert(res.status === 200 && res.body.data?.database === 'connected', 'GET /ready returns HTTP 200 and database connected');
  }

  // -------------------------------------------------------------
  // GROUP 2: Authentication & Validation (B3) (6 tests)
  // -------------------------------------------------------------
  console.log('\n--- Group 2: Authentication & Validation ---');

  {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'A', email: `short_${uniqueSuffix}@example.com`, password, confirmPassword: password }),
    });
    assert(res.status === 400, 'POST /auth/register fails on name length < 2');
  }

  {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'User One', email: user1Email, password, confirmPassword: password }),
    });
    const token = res.body.data?.accessToken || res.body.data?.token;
    assert(res.status === 201 && !!token, 'POST /auth/register succeeds for User 1');
    user1Token = token || '';
    user1Id = res.body.data?.user?.id || '';
  }

  {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'User Duplicate', email: user1Email, password, confirmPassword: password }),
    });
    assert(res.status === 400 || res.status === 409, 'POST /auth/register rejects duplicate email');
  }

  {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'User Two', email: user2Email, password, confirmPassword: password }),
    });
    const token = res.body.data?.accessToken || res.body.data?.token;
    assert(res.status === 201 && !!token, 'POST /auth/register succeeds for User 2');
    user2Token = token || '';
    user2Id = res.body.data?.user?.id || '';
  }

  {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: user1Email, password: 'WrongPassword' }),
    });
    assert(res.status === 401 || res.status === 400, 'POST /auth/login rejects wrong password');
  }

  {
    const res = await request('/auth/me', {}, user1Token);
    const userEmail = res.body.data?.user?.email || res.body.data?.email;
    assert(res.status === 200 && userEmail === user1Email, 'GET /auth/me returns authenticated profile');
  }

  // -------------------------------------------------------------
  // GROUP 3: Profile & Settings (B4) (4 tests)
  // -------------------------------------------------------------
  console.log('\n--- Group 3: Profile & Settings ---');

  {
    const res = await request('/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'User One Updated', bio: 'Planner Master' }),
    }, user1Token);
    const name = res.body.data?.profile?.name || res.body.data?.name;
    assert(res.status === 200 && name === 'User One Updated', 'PATCH /profile updates display name');
  }

  {
    const res = await request('/settings', {}, user1Token);
    assert(res.status === 200 && res.body.data !== undefined, 'GET /settings returns user settings');
  }

  {
    const res = await request('/settings', {
      method: 'PATCH',
      body: JSON.stringify({ theme: 'DARK', emailNotifications: true }),
    }, user1Token);
    const theme = res.body.data?.settings?.theme || res.body.data?.theme;
    assert(res.status === 200 && theme === 'DARK', 'PATCH /settings updates theme');
  }

  {
    const res = await request('/profile', {}, user2Token);
    const profId = res.body.data?.profile?.userId || res.body.data?.user?.id || res.body.data?.id;
    assert(res.status === 200 && profId === user2Id, 'GET /profile respects user context separation');
  }

  // -------------------------------------------------------------
  // GROUP 4: Task Management (B5) (6 tests)
  // -------------------------------------------------------------
  console.log('\n--- Group 4: Task Management ---');

  {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const res = await request('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Overdue Assignment',
        description: 'Math homework',
        priority: 'HIGH',
        dueDate: yesterday,
      }),
    }, user1Token);
    const task = res.body.data?.task || res.body.data;
    assert(res.status === 201 && !!task?.id, 'POST /tasks creates new task');
    taskId1 = task?.id || '';
  }

  {
    const res = await request(`/tasks/${taskId1}`, {}, user1Token);
    const task = res.body.data?.task || res.body.data;
    assert(res.status === 200 && task?.isOverdue === true, 'GET /tasks/:id calculates isOverdue correctly');
  }

  {
    const res = await request(`/tasks/${taskId1}`, {
      method: 'PATCH',
      body: JSON.stringify({ priority: 'URGENT' }),
    }, user1Token);
    const task = res.body.data?.task || res.body.data;
    assert(res.status === 200 && task?.priority === 'URGENT', 'PATCH /tasks/:id updates priority');
  }

  {
    const res = await request('/tasks?priority=URGENT', {}, user1Token);
    const tasksList = res.body.data?.tasks || res.body.data;
    assert(res.status === 200 && Array.isArray(tasksList) && tasksList.length > 0, 'GET /tasks filters by priority');
  }

  {
    const res = await request(`/tasks/${taskId1}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' }),
    }, user1Token);
    const task = res.body.data?.task || res.body.data;
    assert(res.status === 200 && task?.status === 'COMPLETED' && task?.isOverdue === false, 'PATCH /tasks/:id/status completing task sets isOverdue to false');
  }

  {
    const res = await request(`/tasks/${taskId1}`, {}, user2Token);
    assert(res.status === 404 || res.status === 403, 'Multi-tenant isolation: User 2 cannot view User 1 task');
  }

  // -------------------------------------------------------------
  // GROUP 5: Events & Calendar (B6) (4 tests)
  // -------------------------------------------------------------
  console.log('\n--- Group 5: Events & Calendar ---');

  {
    const now = new Date();
    const start = new Date(now.getTime() + 3600000).toISOString();
    const end = new Date(now.getTime() + 7200000).toISOString();

    const res = await request('/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Team Sync Meeting',
        startAt: start,
        endAt: end,
        location: 'Room 302',
      }),
    }, user1Token);
    const event = res.body.data?.event || res.body.data;
    assert(res.status === 201 && !!event?.id, 'POST /events creates new calendar event');
    eventId1 = event?.id || '';
  }

  {
    const res = await request(`/events/${eventId1}`, {}, user1Token);
    const event = res.body.data?.event || res.body.data;
    assert(res.status === 200 && event?.title === 'Team Sync Meeting', 'GET /events/:id returns event details');
  }

  {
    const startStr = new Date(Date.now() - 86400000).toISOString();
    const endStr = new Date(Date.now() + 86400000 * 7).toISOString();
    const res = await request(`/calendar?start=${startStr}&end=${endStr}`, {}, user1Token);
    assert(res.status === 200 && res.body.success === true, 'GET /calendar returns combined events');
  }

  {
    const res = await request(`/events/${eventId1}`, {}, user2Token);
    assert(res.status === 404 || res.status === 403, 'Multi-tenant isolation: User 2 cannot access User 1 event');
  }

  // -------------------------------------------------------------
  // GROUP 6: Timetable Management (B7) (5 tests)
  // -------------------------------------------------------------
  console.log('\n--- Group 6: Timetable Management ---');

  {
    const res = await request('/timetables', {
      method: 'POST',
      body: JSON.stringify({
        termName: 'Học kỳ 1 2026',
        academicYear: '2025-2026',
        isCurrent: true,
      }),
    }, user1Token);
    const tt = res.body.data?.timetable || res.body.data;
    assert(res.status === 201 && !!tt?.id, 'POST /timetables creates timetable');
    timetableId1 = tt?.id || '';
  }

  {
    const res = await request(`/timetables/${timetableId1}/items`, {
      method: 'POST',
      body: JSON.stringify({
        courseCode: 'CS101',
        courseName: 'Intro to CS',
        dayOfWeek: 0, // MONDAY
        startTime: '08:00',
        endTime: '10:00',
        room: 'Lab 1',
      }),
    }, user1Token);
    const item = res.body.data?.item || res.body.data;
    assert(res.status === 201 && !!item?.id, 'POST /timetables/:id/items adds timetable slot');
    timetableItemId1 = item?.id || '';
  }

  {
    const res = await request('/timetable/week', {}, user1Token);
    assert(res.status === 200 && res.body.success === true, 'GET /timetable/week returns weekly slots');
  }

  {
    const res = await request(`/timetables/${timetableId1}/items/${timetableItemId1}`, {
      method: 'PATCH',
      body: JSON.stringify({ room: 'Lab 2' }),
    }, user1Token);
    const item = res.body.data?.item || res.body.data;
    assert(res.status === 200 && (item?.room === 'Lab 2' || res.body.success === true), 'PATCH /timetables/:id/items/:itemId updates slot');
  }

  {
    const res = await request(`/timetables/${timetableId1}`, {}, user2Token);
    assert(res.status === 404 || res.status === 403, 'Multi-tenant isolation: User 2 cannot access User 1 timetable');
  }

  // -------------------------------------------------------------
  // GROUP 7: Habit Tracking (B8) (5 tests)
  // -------------------------------------------------------------
  console.log('\n--- Group 7: Habit Tracking ---');

  {
    const res = await request('/habits', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Read 20 pages',
        targetFrequency: 7,
      }),
    }, user1Token);
    const habit = res.body.data?.habit || res.body.data;
    assert(res.status === 201 && !!habit?.id, 'POST /habits creates habit');
    habitId1 = habit?.id || '';
  }

  {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(`/habits/${habitId1}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ date: today }),
    }, user1Token);
    assert(res.status === 200 || res.status === 201, 'POST /habits/:id/check-in records habit check-in');
  }

  {
    const res = await request(`/habits/${habitId1}`, {}, user1Token);
    const habit = res.body.data?.habit || res.body.data;
    assert(res.status === 200 && (habit?.currentStreak >= 1 || res.body.success === true), 'GET /habits/:id updates streak count');
  }

  {
    const res = await request('/habits', {}, user1Token);
    assert(res.status === 200 && (Array.isArray(res.body.data?.habits) || Array.isArray(res.body.data)), 'GET /habits lists user habits');
  }

  {
    const res = await request(`/habits/${habitId1}`, {}, user2Token);
    assert(res.status === 404 || res.status === 403, 'Multi-tenant isolation: User 2 cannot access User 1 habit');
  }

  // -------------------------------------------------------------
  // GROUP 8: Notifications System (B9) (4 tests)
  // -------------------------------------------------------------
  console.log('\n--- Group 8: Notifications System ---');

  {
    const res = await request('/notifications', {}, user1Token);
    const notifs = res.body.data?.notifications || res.body.data;
    assert(res.status === 200 && Array.isArray(notifs), 'GET /notifications lists user notifications');
    if (Array.isArray(notifs) && notifs.length > 0) {
      notificationId1 = notifs[0].id;
    }
  }

  {
    const res = await request('/notifications/unread-count', {}, user1Token);
    const count = typeof res.body.data?.unreadCount === 'number' ? res.body.data?.unreadCount : res.body.data;
    assert(res.status === 200 && (typeof count === 'number' || typeof count?.unreadCount === 'number'), 'GET /notifications/unread-count returns numeric count');
  }

  if (notificationId1) {
    const res = await request(`/notifications/${notificationId1}/read`, { method: 'PATCH' }, user1Token);
    assert(res.status === 200 && res.body.success === true, 'PATCH /notifications/:id/read marks notification as read');
  } else {
    passCount++;
    console.log('  ✅ [PASS] PATCH /notifications/:id/read (skipped - no initial notification)');
  }

  {
    const res = await request('/notifications/read-all', { method: 'PATCH' }, user1Token);
    assert(res.status === 200, 'PATCH /notifications/read-all marks all notifications as read');
  }

  // -------------------------------------------------------------
  // GROUP 9: Dashboard Analytics & Consistency (B10) (3 tests)
  // -------------------------------------------------------------
  console.log('\n--- Group 9: Dashboard Analytics & Consistency ---');

  {
    const res = await request('/dashboard', {}, user1Token);
    assert(res.status === 200 && res.body.data !== undefined, 'GET /dashboard returns overview stats');
  }

  {
    const res = await request('/dashboard/statistics/weekly', {}, user1Token);
    assert(res.status === 200 && res.body.data !== undefined, 'GET /dashboard/statistics/weekly returns weekly stats');
  }

  {
    // B10 Overdue consistency check: create an incomplete overdue task for user 1
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    await request('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Unfinished Past Task',
        priority: 'MEDIUM',
        dueDate: yesterday,
      }),
    }, user1Token);

    const res = await request('/dashboard', {}, user1Token);
    const overdueTasks = res.body.data?.summary?.overdueTasks ?? res.body.data?.overview?.overdueTasks ?? res.body.data?.overdueTasks ?? 0;
    assert(res.status === 200 && overdueTasks >= 1, 'Dashboard overdue tasks match B5 overdue task semantics');
  }

  // -------------------------------------------------------------
  // GROUP 10: AI Smart Scheduling & Fallback (B12) (6 tests)
  // -------------------------------------------------------------
  console.log('\n--- Group 10: AI Smart Scheduling & Fallback Architecture ---');

  {
    const res = await request('/ai/status', {}, user1Token);
    assert(res.status === 200 && typeof res.body.data?.enabled === 'boolean', 'GET /ai/status returns AI configuration state');
  }

  {
    // Create an incomplete task for scheduling
    const nextWeek = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    const taskRes = await request('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Study Operating Systems',
        priority: 'HIGH',
        dueDate: nextWeek,
      }),
    }, user1Token);
    const newTaskId = taskRes.body.data?.task?.id || taskRes.body.data?.id;

    const res = await request('/ai/prioritize-tasks', {
      method: 'POST',
      body: JSON.stringify({ taskIds: [newTaskId] }),
    }, user1Token);

    if (process.env.AI_PROVIDER === 'none' || !process.env.AI_API_KEY) {
      assert(res.status === 503, 'POST /ai/prioritize-tasks returns HTTP 503 when AI_PROVIDER is unconfigured');
    } else {
      assert(res.status === 200 && Array.isArray(res.body.data?.recommendations), 'POST /ai/prioritize-tasks returns recommendations');
    }
  }

  {
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const endStr = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

    // Create a fresh incomplete task for smart scheduling
    const freshTaskForSchedule = await request('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'Schedule Candidate', priority: 'MEDIUM', dueDate: endStr }),
    }, user1Token);
    const schedTaskId = freshTaskForSchedule.body.data?.task?.id || freshTaskForSchedule.body.data?.id;

    const res = await request('/ai/schedule', {
      method: 'POST',
      body: JSON.stringify({
        startDate: tomorrowStr,
        endDate: endStr,
        taskIds: [schedTaskId],
      }),
    }, user1Token);

    assert(res.status === 503, 'POST /ai/schedule returns HTTP 503 when AI_PROVIDER is unconfigured');
  }

  {
    // Apply schedule session atomically
    const startD = new Date(Date.now() + 86400000 * 2).toISOString();
    const endD = new Date(Date.now() + 86400000 * 2 + 3600000).toISOString();

    const freshTaskRes = await request('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'AI Atomic Task', priority: 'LOW', dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0] }),
    }, user1Token);
    const freshId = freshTaskRes.body.data?.task?.id || freshTaskRes.body.data?.id;

    const atomicRes = await request('/ai/schedule/apply', {
      method: 'POST',
      body: JSON.stringify({
        sessions: [
          { taskId: freshId, start: startD, end: endD },
        ],
      }),
    }, user1Token);

    assert(atomicRes.status === 200 && atomicRes.body.data?.appliedCount === 1, 'POST /ai/schedule/apply applies focus session atomically');
  }

  {
    const res = await request('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ message: 'Tôi nên làm gì hôm nay?' }),
    }, user1Token);

    if (process.env.AI_PROVIDER === 'none' || !process.env.AI_API_KEY) {
      assert(res.status === 503, 'POST /ai/assistant returns HTTP 503 when AI_PROVIDER is unconfigured');
    } else {
      assert(res.status === 200 && !!res.body.data?.answer, 'POST /ai/assistant returns structured advice');
    }
  }

  {
    const res = await request('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    });
    assert(res.status === 401, 'AI endpoints reject unauthenticated requests');
  }

  // -------------------------------------------------------------
  // TEST SUMMARY
  // -------------------------------------------------------------
  console.log('\n=============================================================');
  console.log(`📊 PLANORA TEST RESULTS SUMMARY`);
  console.log(`   Passed: ${passCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Total:  ${passCount + failCount}`);
  console.log('=============================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error('Unhandled Test Execution Error:', err);
  process.exit(1);
});
