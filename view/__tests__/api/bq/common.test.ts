/**
 * BigQuery API共通ユーティリティのテスト
 */

import {
  validateMemberData,
  validatePenlightData,
  buildMemberQuery,
  buildPenlightQuery,
  BIGQUERY_CONFIG,
  TABLE_NAMES
} from '@/api/bq/common/queryUtils';

import {
  getApiEnvironment,
  createApiError,
  ApiErrorCode
} from '@/api/bq/common/errorHandling';

describe('BigQuery API共通ユーティリティ', () => {

  describe('validateMemberData', () => {
    test('有効なメンバーデータを正しく検証する', () => {
      const mockData = [{
        id: 1,
        name: 'テストメンバー',
        nickname: 'テスト',
        emoji: '🌟',
        gen: '1期生',
        graduated: false,
        penlight1_id: 1,
        penlight2_id: 2,
        type: 'test',
        url: 'https://example.com/test.jpg'
      }];

      const result = validateMemberData(mockData);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        name: 'テストメンバー',
        penlight1_id: 1,
        penlight2_id: 2
      });
    });

    test('必須フィールドが不足している場合エラーをスローする', () => {
      const invalidData = [{
        id: 1,
        name: 'テストメンバー'
        // penlight1_id, penlight2_id が不足
      }];

      expect(() => validateMemberData(invalidData)).toThrow();
    });

    test('配列以外のデータでエラーをスローする', () => {
      expect(() => validateMemberData('invalid' as any)).toThrow();
      expect(() => validateMemberData(null as any)).toThrow();
    });
  });

  describe('validatePenlightData', () => {
    test('有効なペンライトデータを正しく検証する', () => {
      const mockData = [{
        id: 1,
        name_ja: '青',
        name_en: 'Blue',
        color: '#0000ff'
      }];

      const result = validatePenlightData(mockData);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        name_ja: '青',
        name_en: 'Blue',
        color: '#0000ff'
      });
    });

    test('必須フィールドが不足している場合エラーをスローする', () => {
      const invalidData = [{
        id: 1,
        name_ja: '青'
        // name_en, color が不足
      }];

      expect(() => validatePenlightData(invalidData)).toThrow();
    });
  });

  describe('buildMemberQuery', () => {
    test('日向坂46用の正しいクエリを生成する', () => {
      const query = buildMemberQuery('hinatazaka');
      expect(query).toContain('hinatazaka_member_master');
      expect(query).toContain('sakamichipenlightquiz.sakamichi');
      expect(query).toContain('ORDER BY');
      expect(query).toContain('gen ASC');
      expect(query).toContain('id ASC');
    });

    test('櫻坂46用の正しいクエリを生成する', () => {
      const query = buildMemberQuery('sakurazaka');
      expect(query).toContain('sakurazaka_member_master');
      expect(query).toContain('sakamichipenlightquiz.sakamichi');
    });
  });

  describe('buildPenlightQuery', () => {
    test('日向坂46用の正しいペンライトクエリを生成する', () => {
      const query = buildPenlightQuery('hinatazaka');
      expect(query).toContain('hinatazaka_penlight');
      expect(query).toContain('name_ja');
      expect(query).toContain('name_en');
      expect(query).toContain('color');
      expect(query).toContain('ORDER BY');
      expect(query).toContain('id ASC');
    });

    test('櫻坂46用の正しいペンライトクエリを生成する', () => {
      const query = buildPenlightQuery('sakurazaka');
      expect(query).toContain('sakurazaka_penlight');
    });
  });

  describe('設定値の確認', () => {
    test('BIGQUERY_CONFIG が正しく設定されている', () => {
      expect(BIGQUERY_CONFIG.projectId).toBe('sakamichipenlightquiz');
      expect(BIGQUERY_CONFIG.dataset).toBe('sakamichi');
      expect(BIGQUERY_CONFIG.location).toBe('US');
    });

    test('TABLE_NAMES が正しく設定されている', () => {
      expect(TABLE_NAMES.hinatazaka.member).toBe('hinatazaka_member_master');
      expect(TABLE_NAMES.hinatazaka.penlight).toBe('hinatazaka_penlight');
      expect(TABLE_NAMES.sakurazaka.member).toBe('sakurazaka_member_master');
      expect(TABLE_NAMES.sakurazaka.penlight).toBe('sakurazaka_penlight');
    });
  });
});

describe('エラーハンドリング', () => {
  describe('getApiEnvironment', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    test('USE_MOCK=true の場合', () => {
      const mockEnv = {
        ...originalEnv,
        USE_MOCK: 'true',
        NODE_ENV: 'test' as const
      };
      process.env = mockEnv as any;
      
      const env = getApiEnvironment();
      expect(env.useMock).toBe(true);
      expect(env.environment).toBe('test');
    });

    test('USE_MOCK=false の場合', () => {
      const mockEnv = {
        ...originalEnv,
        USE_MOCK: 'false',
        NODE_ENV: 'production' as const
      };
      process.env = mockEnv as any;
      
      const env = getApiEnvironment();
      expect(env.useMock).toBe(false);
      expect(env.environment).toBe('production');
    });
  });

  describe('createApiError', () => {
    test('基本的なAPIエラーを作成する', () => {
      const error = createApiError(
        ApiErrorCode.BIGQUERY_CONNECTION_ERROR,
        'テストエラー'
      );

      expect(error.code).toBe(ApiErrorCode.BIGQUERY_CONNECTION_ERROR);
      expect(error.message).toBe('テストエラー');
      expect(error.cause).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    test('詳細情報付きのAPIエラーを作成する', () => {
      const originalError = new Error('元のエラー');
      const details = { key: 'value' };
      
      const error = createApiError(
        ApiErrorCode.DATA_VALIDATION_ERROR,
        '詳細付きエラー',
        originalError,
        details
      );

      expect(error.code).toBe(ApiErrorCode.DATA_VALIDATION_ERROR);
      expect(error.message).toBe('詳細付きエラー');
      expect(error.cause).toBe(originalError);
      expect(error.details).toBe(details);
    });
  });
});

describe('統合テスト', () => {
  test('全グループに対するクエリ生成が一貫している', () => {
    const groups: Array<'hinatazaka' | 'sakurazaka'> = ['hinatazaka', 'sakurazaka'];
    
    groups.forEach(group => {
      const memberQuery = buildMemberQuery(group);
      const penlightQuery = buildPenlightQuery(group);
      
      // 基本的な構造チェック
      expect(memberQuery).toContain(TABLE_NAMES[group].member);
      expect(penlightQuery).toContain(TABLE_NAMES[group].penlight);
      
      // プロジェクト・データセット名の一貫性
      expect(memberQuery).toContain(BIGQUERY_CONFIG.projectId);
      expect(memberQuery).toContain(BIGQUERY_CONFIG.dataset);
      expect(penlightQuery).toContain(BIGQUERY_CONFIG.projectId);
      expect(penlightQuery).toContain(BIGQUERY_CONFIG.dataset);
    });
  });
});
