/**
 * メンバー正答数記録API のテスト
 */

import { recordMemberAnswer, getMemberCorrectAnswers, getMemberAnswerStats } from '@/api/bq';
import type { CreateOrUpdateCorrectAnswersRequest } from '@/types/MemberCorrectAnswers';

// モック環境での実行を保証
process.env.USE_MOCK = 'true';

describe('メンバー正答数記録API', () => {
  describe('recordMemberAnswer', () => {
    test('正解の記録ができること', async () => {
      const request: CreateOrUpdateCorrectAnswersRequest = {
        member_id: 1,
        group: 'hinatazaka',
        is_correct: true
      };

      const result = await recordMemberAnswer(request);

      expect(result).toHaveProperty('id');
      expect(result.member_id).toBe(1);
      expect(result.group).toBe('hinatazaka');
      expect(result.correct_count).toBeGreaterThanOrEqual(1);
      expect(result.total_count).toBeGreaterThanOrEqual(1);
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');
    });

    test('不正解の記録ができること', async () => {
      const request: CreateOrUpdateCorrectAnswersRequest = {
        member_id: 2,
        group: 'hinatazaka',
        is_correct: false
      };

      const result = await recordMemberAnswer(request);

      expect(result).toHaveProperty('id');
      expect(result.member_id).toBe(2);
      expect(result.group).toBe('hinatazaka');
      expect(result.total_count).toBeGreaterThanOrEqual(1);
    });

    test('櫻坂46メンバーの記録ができること', async () => {
      const request: CreateOrUpdateCorrectAnswersRequest = {
        member_id: 1,
        group: 'sakurazaka',
        is_correct: true
      };

      const result = await recordMemberAnswer(request);

      expect(result.member_id).toBe(1);
      expect(result.group).toBe('sakurazaka');
    });
  });

  describe('getMemberCorrectAnswers', () => {
    test('日向坂46の全メンバー記録を取得できること', async () => {
      const results = await getMemberCorrectAnswers('hinatazaka');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // 全てのレコードが日向坂46のものかチェック
      results.forEach(record => {
        expect(record.group).toBe('hinatazaka');
        expect(record).toHaveProperty('member_id');
        expect(record).toHaveProperty('correct_count');
        expect(record).toHaveProperty('total_count');
      });
    });

    test('特定メンバーの記録を取得できること', async () => {
      const memberId = 1;
      const results = await getMemberCorrectAnswers('hinatazaka', memberId);

      expect(Array.isArray(results)).toBe(true);
      
      // 指定したメンバーのレコードのみかチェック
      results.forEach(record => {
        expect(record.member_id).toBe(memberId);
        expect(record.group).toBe('hinatazaka');
      });
    });

    test('櫻坂46の記録を取得できること', async () => {
      const results = await getMemberCorrectAnswers('sakurazaka');

      expect(Array.isArray(results)).toBe(true);
      
      results.forEach(record => {
        expect(record.group).toBe('sakurazaka');
      });
    });
  });

  describe('getMemberAnswerStats', () => {
    test('統計情報を正答率順で取得できること', async () => {
      const stats = await getMemberAnswerStats('hinatazaka', undefined, 'correct_rate');

      expect(Array.isArray(stats)).toBe(true);
      expect(stats.length).toBeGreaterThan(0);
      
      stats.forEach((stat, index) => {
        // 必須フィールドの確認
        expect(stat).toHaveProperty('member_id');
        expect(stat).toHaveProperty('group');
        expect(stat).toHaveProperty('correct_count');
        expect(stat).toHaveProperty('total_count');
        expect(stat).toHaveProperty('correct_rate');
        expect(stat).toHaveProperty('last_updated');
        
        // 正答率の妥当性確認
        expect(stat.correct_rate).toBeGreaterThanOrEqual(0);
        expect(stat.correct_rate).toBeLessThanOrEqual(1);
        
        // ソート順の確認（正答率の降順）
        if (index > 0) {
          expect(stat.correct_rate).toBeLessThanOrEqual(stats[index - 1].correct_rate);
        }
      });
    });

    test('統計情報を正答数順で取得できること', async () => {
      const stats = await getMemberAnswerStats('hinatazaka', undefined, 'correct_count');

      expect(Array.isArray(stats)).toBe(true);
      
      // ソート順の確認（正答数の降順）
      stats.forEach((stat, index) => {
        if (index > 0) {
          expect(stat.correct_count).toBeLessThanOrEqual(stats[index - 1].correct_count);
        }
      });
    });

    test('特定メンバーの統計情報を取得できること', async () => {
      const memberId = 1;
      const stats = await getMemberAnswerStats('hinatazaka', memberId);

      expect(Array.isArray(stats)).toBe(true);
      
      stats.forEach(stat => {
        expect(stat.member_id).toBe(memberId);
      });
    });
  });

  describe('データ整合性テスト', () => {
    test('recordMemberAnswerの結果がgetMemberCorrectAnswersで取得できること', async () => {
      const memberId = 99; // 新しいメンバーIDを使用
      const group = 'hinatazaka';
      
      // 回答を記録
      await recordMemberAnswer({
        member_id: memberId,
        group: group,
        is_correct: true
      });
      
      // 記録した結果を取得
      const results = await getMemberCorrectAnswers(group, memberId);
      
      expect(results.length).toBeGreaterThan(0);
      
      const memberRecord = results.find(r => r.member_id === memberId);
      expect(memberRecord).toBeDefined();
      expect(memberRecord?.correct_count).toBeGreaterThanOrEqual(1);
    });
  });
});