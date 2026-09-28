// Run after npm run build: node --test tests/activityNotifications.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const records = [];
globalThis.prismaGlobal = { notification: { create: async ({ data }) => { records.push(data); } } };
const { activityNotifications } = require('../dist/middlewares/activityNotifications');

async function request(path, method, body, statusCode = 200, userId = 'user-a', requestBody = {}) {
  let sent = false;
  const res = { statusCode, json: () => { sent = true; return res; } };
  activityNotifications({ path, method, body: requestBody, user: userId ? { userId } : undefined }, res, () => {});
  res.json(body);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(sent, true);
}

test('each successful edit is saved separately for the authenticated user', async () => {
  records.length = 0;
  const body = { success: true, message: 'Cập nhật công việc thành công', data: { task: { id: 'task-a', title: 'Bài tập' } } };
  await request('/tasks/task-a', 'PATCH', body);
  await request('/tasks/task-a', 'PATCH', body);
  assert.equal(records.length, 2);
  assert.equal(records[0].userId, 'user-a');
  assert.equal(records[0].link, '/tasks');
  assert.match(records[0].message, /Bài tập/);
});

test('reads, failed changes, notification actions and unauthenticated calls do not create activity', async () => {
  records.length = 0;
  await request('/tasks', 'GET', { success: true });
  await request('/tasks/task-a', 'PATCH', { success: false }, 400);
  await request('/notifications/read-all', 'PATCH', { success: true });
  await request('/notifications/generate', 'POST', { success: true });
  await request('/tasks', 'POST', { success: true }, 200, null);
  await request('/ai/schedule', 'POST', { success: true });
  assert.equal(records.length, 0);
});

test('deletes without response data and settings changes create safe messages', async () => {
  records.length = 0;
  await request('/events/event-a', 'DELETE', { success: true, message: 'Đã xóa lịch' });
  await request('/settings/password', 'PATCH', { success: true, message: 'Đã đổi mật khẩu' });
  assert.equal(records.length, 2);
  assert.equal(records[0].type, 'EVENT');
  assert.equal(records[1].message, '');
});

test('response waits for notification persistence', async () => {
  const create = globalThis.prismaGlobal.notification.create;
  let resolve;
  globalThis.prismaGlobal.notification.create = () => new Promise(done => { resolve = done; });
  let sent = false;
  const res = { statusCode: 200, json: () => { sent = true; return res; } };
  activityNotifications({ path: '/profile', method: 'PATCH', user: { userId: 'user-a' } }, res, () => {});
  res.json({ success: true, message: 'Đã cập nhật hồ sơ' });
  assert.equal(sent, false);
  resolve();
  await new Promise(done => setImmediate(done));
  assert.equal(sent, true);
  globalThis.prismaGlobal.notification.create = create;
});

test('automatic semester setup and first class produce only one notification', async () => {
  records.length = 0;
  await request('/timetables', 'POST', { success: true, message: 'Tạo thời khóa biểu thành công' }, 201, 'user-a', { autoCreated: true });
  await request('/timetables/semester-a/items', 'POST', {
    success: true, message: 'Tạo tiết học thành công', data: { item: { id: 'class-a', subjectName: 'Kiểm Tra' } },
  }, 201);
  assert.equal(records.length, 1);
  assert.equal(records[0].title, 'Tạo tiết học thành công');
  assert.equal(records[0].message, '“Kiểm Tra”');
  await request('/timetables', 'POST', { success: true, message: 'Tạo thời khóa biểu thành công' }, 201);
  assert.equal(records.length, 2, 'explicit semester creation still notifies');
});
