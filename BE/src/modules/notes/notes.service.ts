import { prisma } from '../../config/prisma';
import type { z } from 'zod';
import type { createNoteSchema, updateNoteSchema } from './notes.schemas';

type CreateNoteInput = z.infer<typeof createNoteSchema>;
type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export class NotesService {
  static list(userId: string) {
    return prisma.note.findMany({
      where: { userId },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static create(userId: string, input: CreateNoteInput) {
    return prisma.note.create({ data: { userId, ...input } });
  }

  static async update(userId: string, noteId: string, input: UpdateNoteInput) {
    const note = await prisma.note.findFirst({ where: { id: noteId, userId }, select: { id: true } });
    if (!note) throw new Error('Không tìm thấy ghi chú');
    return prisma.note.update({ where: { id: noteId }, data: input });
  }

  static async remove(userId: string, noteId: string) {
    const note = await prisma.note.findFirst({ where: { id: noteId, userId }, select: { id: true } });
    if (!note) throw new Error('Không tìm thấy ghi chú');
    await prisma.note.delete({ where: { id: noteId } });
  }
}
