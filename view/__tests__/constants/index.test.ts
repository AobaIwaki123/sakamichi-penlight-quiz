/**
 * 定数のテスト
 * アプリケーション定数の値と整合性を検証
 */

import {
  SUPPORTED_GROUPS,
  DEFAULT_GROUP,
  HINATAZAKA_PENLIGHT_COLORS,
  HINATAZAKA_FILTERS,
  GENERATION_MAP,
  GENERATION_REVERSE_MAP,
  APP_CONFIG,
  STORAGE_KEYS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  DEBUG_ENABLED,
  USE_MOCK_DATA,
  isHinatazaka,
  isGraduated,
  isValidGeneration,
  getPenlightColorById,
  getPenlightColorByName,
} from '@/constants';

describe('定数テスト', () => {
  describe('基本定数', () => {
    test('サポートされているグループが正しく定義されている', () => {
      expect(SUPPORTED_GROUPS).toEqual(['hinatazaka']);
      expect(SUPPORTED_GROUPS.length).toBe(1);
      expect(Array.isArray(SUPPORTED_GROUPS)).toBe(true);
    });

    test('デフォルトグループが正しく設定されている', () => {
      expect(DEFAULT_GROUP).toBe('hinatazaka');
      expect(SUPPORTED_GROUPS.includes(DEFAULT_GROUP)).toBe(true);
    });
  });

  describe('日向坂46定数', () => {
    test('ペンライト色が正しく定義されている', () => {
      expect(HINATAZAKA_PENLIGHT_COLORS).toHaveLength(15);
      
      // 最初の色をテスト
      const firstColor = HINATAZAKA_PENLIGHT_COLORS[0];
      expect(firstColor).toEqual({
        id: 0,
        name_ja: 'パステルブルー',
        name_en: 'pastel_blue',
        color: '#09b8ff'
      });

      // 最後の色をテスト
      const lastColor = HINATAZAKA_PENLIGHT_COLORS[14];
      expect(lastColor).toEqual({
        id: 14,
        name_ja: 'ブルー',
        name_en: 'blue',
        color: '#1d72fe'
      });

      // 全ての色にIDが連番で割り当てられているかテスト
      HINATAZAKA_PENLIGHT_COLORS.forEach((color, index) => {
        expect(color.id).toBe(index);
        expect(typeof color.name_ja).toBe('string');
        expect(typeof color.name_en).toBe('string');
        expect(color.color).toMatch(/^#[0-9a-fA-F]{5,6}$/);
      });
    });

    test('フィルターが正しく定義されている', () => {
      expect(HINATAZAKA_FILTERS).toHaveLength(6);
      
      const expectedFilters = [
        { type: '1期生', defaultChecked: true },
        { type: '2期生', defaultChecked: true },
        { type: '3期生', defaultChecked: true },
        { type: '4期生', defaultChecked: true },
        { type: '5期生', defaultChecked: true },
        { type: '卒業生', defaultChecked: false },
      ];

      expect(HINATAZAKA_FILTERS).toEqual(expectedFilters);

      // 卒業生のみデフォルトでチェックされていないことを確認
      const graduatedFilter = HINATAZAKA_FILTERS.find(f => f.type === '卒業生');
      expect(graduatedFilter?.defaultChecked).toBe(false);

      // 他の期生はデフォルトでチェックされていることを確認
      const activeFilters = HINATAZAKA_FILTERS.filter(f => f.type !== '卒業生');
      activeFilters.forEach(filter => {
        expect(filter.defaultChecked).toBe(true);
      });
    });

    test('期生マッピングが正しく定義されている', () => {
      const expectedMapping = {
        '1期生': '1st',
        '2期生': '2nd',
        '3期生': '3rd',
        '4期生': '4th',
        '5期生': '5th',
        '卒業生': 'graduated',
      };

      expect(GENERATION_MAP).toEqual(expectedMapping);
      expect(Object.keys(GENERATION_MAP)).toHaveLength(6);

      // 逆マッピングのテスト
      const expectedReverseMapping = {
        '1st': '1期生',
        '2nd': '2期生',
        '3rd': '3期生',
        '4th': '4期生',
        '5th': '5期生',
        'graduated': '卒業生',
      };

      expect(GENERATION_REVERSE_MAP).toEqual(expectedReverseMapping);
      
      // 相互マッピングの整合性テスト
      Object.entries(GENERATION_MAP).forEach(([japanese, english]) => {
        expect(GENERATION_REVERSE_MAP[english]).toBe(japanese);
      });
    });
  });

  describe('アプリケーション設定', () => {
    test('アプリ設定が正しく定義されている', () => {
      expect(APP_CONFIG.name).toBe('坂道ペンライトクイズ');
      expect(APP_CONFIG.description).toBe('日向坂46メンバーのペンライト色を当てるクイズアプリ');
      expect(APP_CONFIG.version).toBe('1.0.0');
      expect(APP_CONFIG.author).toBe('Sakamichi Quiz Team');
      
      // 全てのプロパティが文字列であることを確認
      Object.values(APP_CONFIG).forEach(value => {
        expect(typeof value).toBe('string');
      });
    });

    test('ストレージキーが重複していない', () => {
      const keys = Object.values(STORAGE_KEYS);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);

      // プレフィックスが統一されていることを確認
      keys.forEach(key => {
        expect(key).toMatch(/^sakamichi-quiz-/);
      });
    });

    test('APIエンドポイントが正しく定義されている', () => {
      expect(API_ENDPOINTS.HINATAZAKA_MEMBERS).toBe('/api/bq/getHinatazakaMember');
      
      // 全てのエンドポイントが'/'で始まることを確認
      Object.values(API_ENDPOINTS).forEach(endpoint => {
        expect(endpoint).toMatch(/^\/api\//);
      });
    });
  });

  describe('メッセージ定数', () => {
    test('エラーメッセージが日本語で定義されている', () => {
      const errorMessages = Object.values(ERROR_MESSAGES);
      expect(errorMessages.length).toBeGreaterThan(0);
      
      errorMessages.forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
        // 日本語文字が含まれていることを簡単にチェック
        expect(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(message)).toBe(true);
      });

      // 主要なエラーメッセージの存在確認
      expect(ERROR_MESSAGES.NETWORK_ERROR).toContain('ネットワークエラー');
      expect(ERROR_MESSAGES.DATA_FETCH_ERROR).toContain('データの取得に失敗');
      expect(ERROR_MESSAGES.UNSUPPORTED_GROUP).toContain('未対応のグループ');
    });

    test('成功メッセージが日本語で定義されている', () => {
      const successMessages = Object.values(SUCCESS_MESSAGES);
      expect(successMessages.length).toBeGreaterThan(0);
      
      successMessages.forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
        // 日本語文字が含まれていることを簡単にチェック
        expect(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(message)).toBe(true);
      });
    });
  });

  describe('環境変数定数', () => {
    test('環境判定が正しく動作する', () => {
      // NODE_ENVに基づく判定のテスト
      expect(typeof IS_DEVELOPMENT).toBe('boolean');
      expect(typeof IS_PRODUCTION).toBe('boolean');
      expect(typeof DEBUG_ENABLED).toBe('boolean');
      expect(typeof USE_MOCK_DATA).toBe('boolean');

      // 相互排他的であることを確認（開発環境のテスト実行時）
      if (process.env.NODE_ENV === 'test') {
        expect(IS_DEVELOPMENT).toBe(false);
        expect(IS_PRODUCTION).toBe(false);
      }
    });
  });

  describe('ユーティリティ関数', () => {
    test('isHinatazaka関数が正しく動作する', () => {
      expect(isHinatazaka('hinatazaka')).toBe(true);
      expect(isHinatazaka('nogizaka')).toBe(false);
      expect(isHinatazaka('sakurazaka')).toBe(false);
    });

    test('isGraduated関数が正しく動作する', () => {
      expect(isGraduated('卒業生')).toBe(true);
      expect(isGraduated('graduated')).toBe(true);
      expect(isGraduated('1期生')).toBe(false);
      expect(isGraduated('1st')).toBe(false);
      expect(isGraduated('')).toBe(false);
    });

    test('isValidGeneration関数が正しく動作する', () => {
      // 日本語表記のテスト
      expect(isValidGeneration('1期生')).toBe(true);
      expect(isValidGeneration('2期生')).toBe(true);
      expect(isValidGeneration('卒業生')).toBe(true);
      
      // 英語表記のテスト
      expect(isValidGeneration('1st')).toBe(true);
      expect(isValidGeneration('2nd')).toBe(true);
      expect(isValidGeneration('graduated')).toBe(true);
      
      // 無効な値のテスト
      expect(isValidGeneration('6期生')).toBe(false);
      expect(isValidGeneration('invalid')).toBe(false);
      expect(isValidGeneration('')).toBe(false);
    });

    test('getPenlightColorById関数が正しく動作する', () => {
      // 存在するIDのテスト
      const color0 = getPenlightColorById(0);
      expect(color0).toEqual({
        id: 0,
        name_ja: 'パステルブルー',
        name_en: 'pastel_blue',
        color: '#09b8ff'
      });

      const color14 = getPenlightColorById(14);
      expect(color14?.name_ja).toBe('ブルー');

      // 存在しないIDのテスト
      expect(getPenlightColorById(15)).toBeUndefined();
      expect(getPenlightColorById(-1)).toBeUndefined();
      expect(getPenlightColorById(999)).toBeUndefined();
    });

    test('getPenlightColorByName関数が正しく動作する', () => {
      // 存在する名前のテスト
      const blueColor = getPenlightColorByName('パステルブルー');
      expect(blueColor).toEqual({
        id: 0,
        name_ja: 'パステルブルー',
        name_en: 'pastel_blue',
        color: '#09b8ff'
      });

      const redColor = getPenlightColorByName('レッド');
      expect(redColor?.id).toBe(7);

      // 存在しない名前のテスト
      expect(getPenlightColorByName('存在しない色')).toBeUndefined();
      expect(getPenlightColorByName('')).toBeUndefined();
    });
  });

  describe('定数の整合性テスト', () => {
    test('フィルターと期生マッピングの整合性', () => {
      const filterTypes = HINATAZAKA_FILTERS.map(f => f.type);
      const mappingKeys = Object.keys(GENERATION_MAP);
      
      // フィルターの全ての型が期生マッピングに存在することを確認
      filterTypes.forEach(type => {
        expect(mappingKeys.includes(type)).toBe(true);
      });
    });

    test('ペンライト色のIDが連続していることを確認', () => {
      const ids = HINATAZAKA_PENLIGHT_COLORS.map(color => color.id);
      const sortedIds = [...ids].sort((a, b) => a - b);
      
      expect(ids).toEqual(sortedIds); // 元々ソートされていることを確認
      
      // 連続した数値であることを確認
      for (let i = 0; i < ids.length; i++) {
        expect(ids[i]).toBe(i);
      }
    });

    test('ペンライト色の名前が重複していないことを確認', () => {
      const japaneseNames = HINATAZAKA_PENLIGHT_COLORS.map(color => color.name_ja);
      const englishNames = HINATAZAKA_PENLIGHT_COLORS.map(color => color.name_en);
      const colorCodes = HINATAZAKA_PENLIGHT_COLORS.map(color => color.color);
      
      expect(new Set(japaneseNames).size).toBe(japaneseNames.length);
      expect(new Set(englishNames).size).toBe(englishNames.length);
      expect(new Set(colorCodes).size).toBe(colorCodes.length);
    });
  });
});