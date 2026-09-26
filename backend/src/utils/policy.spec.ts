import { checkNeedManager } from './policy';

describe('นโยบายหมวด 4.2', () => {
  const originalDueDate = new Date('2026-10-01');

  describe('อุปกรณ์ระดับ A', () => {
    it('เลื่อนครั้งแรก 30 วันพอดี หัวหน้างานอนุมัติได้', () => {
      expect(
        checkNeedManager('A', originalDueDate, new Date('2026-10-31'), 0),
      ).toBe(false);
    });

    it('เลื่อนครั้งแรก 31 วัน ต้องให้ผู้จัดการฝ่ายอนุมัติ', () => {
      expect(
        checkNeedManager('A', originalDueDate, new Date('2026-11-01'), 0),
      ).toBe(true);
    });

    it('เลื่อนครั้งที่ 2 ถึงไม่เกิน 30 วัน ต้องให้ผู้จัดการฝ่ายอนุมัติ', () => {
      expect(
        checkNeedManager('A', originalDueDate, new Date('2026-10-25'), 1),
      ).toBe(true);
    });

    it('เลื่อนครั้งที่ 3 ต้องให้ผู้จัดการฝ่ายอนุมัติ', () => {
      expect(
        checkNeedManager('A', originalDueDate, new Date('2026-10-28'), 2),
      ).toBe(true);
    });

    it('นับ 30 วันจากกำหนดเดิมก่อนเลื่อนครั้งแรก ไม่ใช่จากวันที่เลื่อนไปแล้ว', () => {
      expect(
        checkNeedManager('A', originalDueDate, new Date('2026-11-05'), 1),
      ).toBe(true);
    });
  });

  describe('อุปกรณ์ระดับ B และ C', () => {
    it('ระดับ B เลื่อน 60 วัน หัวหน้างานอนุมัติได้', () => {
      expect(
        checkNeedManager('B', originalDueDate, new Date('2026-11-30'), 0),
      ).toBe(false);
    });

    it('ระดับ C เลื่อนครั้งที่ 5 หัวหน้างานอนุมัติได้', () => {
      expect(
        checkNeedManager('C', originalDueDate, new Date('2026-10-10'), 4),
      ).toBe(false);
    });
  });
});
