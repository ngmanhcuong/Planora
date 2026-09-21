import assert from 'node:assert/strict';
import express from 'express';
import { prisma } from '../src/config/prisma';
import router from '../src/modules/admin/team.routes';

async function main() {
  let candidates = [{ id: 'busy', _count: { tasks: 5 } }, { id: 'free', _count: { tasks: 1 } }];
  let where: any;
  let updated: any;
  let created: any;
  (prisma.user.findMany as any) = async (args: any) => { where = args.where; return candidates; };
  (prisma.task.create as any) = async ({ data }: any) => { created = data; return { id: 'task', ...data }; };
  (prisma.task.updateMany as any) = async (args: any) => { updated = args; return { count: args.where.id === 'missing' ? 0 : 1 }; };
  const app = express(); app.use(express.json());
  app.use((req, _res, next) => { req.user = { userId: 'admin', role: req.headers['x-role'] || 'ADMIN' } as any; next(); });
  app.use(router);
  const server = app.listen(0);
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as any).port}`;
  const request = (path: string, method: string, body: unknown, role = 'ADMIN') => fetch(base + path, { method, headers: { 'Content-Type': 'application/json', 'x-role': role }, body: JSON.stringify(body) });
  const body = { title: ' Test task ', priority: 'HIGH', dueDate: '2026-10-01T00:00:00.000Z' };
  try {
    assert.equal((await request('/tasks', 'POST', body, 'USER')).status, 403);
    assert.equal((await request('/tasks', 'POST', { ...body, title: ' ' })).status, 400);
    assert.equal((await request('/tasks', 'POST', body)).status, 201);
    assert.equal(created.userId, 'free'); assert.equal(created.title, 'Test task'); assert.equal(where.status, 'ACTIVE');
    candidates = [{ id: 'chosen', _count: { tasks: 7 } }];
    assert.equal((await request('/tasks', 'POST', { ...body, assigneeId: 'chosen', role: 'USER' })).status, 201);
    assert.equal(where.id, 'chosen'); assert.equal(where.role, 'USER');
    candidates = [];
    assert.equal((await request('/tasks', 'POST', body)).status, 400);
    assert.equal((await request('/tasks/task', 'PATCH', { status: 'COMPLETED' })).status, 200);
    assert.ok(updated.data.completedAt instanceof Date);
    assert.equal((await request('/tasks/task', 'PATCH', { status: 'TODO' })).status, 200);
    assert.equal(updated.data.completedAt, null);
    assert.equal((await request('/tasks/missing', 'PATCH', { status: 'TODO' })).status, 404);
    assert.equal((await request('/tasks/task', 'PATCH', { status: 'INVALID' })).status, 400);
    console.log('PASS: authorization, validation, automatic/manual assignment, empty team, completion/reopen, missing task.');
  } finally { server.close(); await prisma.$disconnect(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
