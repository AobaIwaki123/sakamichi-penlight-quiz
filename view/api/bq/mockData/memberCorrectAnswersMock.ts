import type { MemberCorrectAnswers, CorrectAnswersStats } from '@/types/MemberCorrectAnswers';

/**
 * 開発環境用のメンバー正答数モックデータ
 */
export const memberCorrectAnswersMock: MemberCorrectAnswers[] = [
  {
    id: 1,
    member_id: 1,
    group: 'hinatazaka',
    correct_count: 15,
    total_count: 20,
    created_at: '2025-09-10T10:00:00.000Z',
    updated_at: '2025-09-11T15:30:00.000Z'
  },
  {
    id: 2,
    member_id: 2,
    group: 'hinatazaka',
    correct_count: 8,
    total_count: 12,
    created_at: '2025-09-10T14:00:00.000Z',
    updated_at: '2025-09-11T16:45:00.000Z'
  },
  {
    id: 3,
    member_id: 3,
    group: 'hinatazaka',
    correct_count: 22,
    total_count: 25,
    created_at: '2025-09-09T09:00:00.000Z',
    updated_at: '2025-09-11T18:00:00.000Z'
  },
  {
    id: 4,
    member_id: 4,
    group: 'hinatazaka',
    correct_count: 5,
    total_count: 8,
    created_at: '2025-09-11T08:00:00.000Z',
    updated_at: '2025-09-11T12:30:00.000Z'
  },
  {
    id: 5,
    member_id: 1,
    group: 'sakurazaka',
    correct_count: 12,
    total_count: 18,
    created_at: '2025-09-10T11:00:00.000Z',
    updated_at: '2025-09-11T14:20:00.000Z'
  }
];

/**
 * 開発環境用のメンバー正答数統計モックデータ
 */
export const memberAnswerStatsMock: CorrectAnswersStats[] = memberCorrectAnswersMock.map(record => ({
  member_id: record.member_id,
  group: record.group,
  correct_count: record.correct_count,
  total_count: record.total_count,
  correct_rate: record.total_count > 0 ? record.correct_count / record.total_count : 0,
  last_updated: record.updated_at
}));