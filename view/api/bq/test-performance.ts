/**
 * BigQuery パフォーマンステスト
 * 最適化前後の性能を比較測定するためのテストスクリプト
 */

import { getHinatazakaMember } from './getHinatazakaMember';
import { getHinatazakaPenlight } from './getHinatazakaPenlight';
import { fetchMemberAndPenlightData } from './common/batchQuery';
import { getCompleteDataByGroup } from './index';

/**
 * パフォーマンステストの結果
 */
interface PerformanceTestResult {
  testName: string;
  executionTime: number;
  success: boolean;
  dataCount: {
    members?: number;
    penlight?: number;
  };
  error?: string;
}

/**
 * 単一のパフォーマンステストを実行
 */
async function runPerformanceTest(
  testName: string,
  testFunction: () => Promise<any>
): Promise<PerformanceTestResult> {
  console.log(`\n🧪 ${testName} 開始...`);
  const startTime = performance.now();

  try {
    const result = await testFunction();
    const executionTime = performance.now() - startTime;

    // データカウントを取得
    let dataCount: { members?: number; penlight?: number } = {};
    if (result && typeof result === 'object') {
      if (Array.isArray(result)) {
        dataCount = { members: result.length };
      } else if (result.members && result.colors) {
        dataCount = { 
          members: result.members.length, 
          penlight: result.colors.length 
        };
      }
    }

    console.log(`✅ ${testName} 完了: ${executionTime.toFixed(2)}ms`);
    return {
      testName,
      executionTime,
      success: true,
      dataCount
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.log(`❌ ${testName} 失敗: ${executionTime.toFixed(2)}ms - ${errorMessage}`);
    return {
      testName,
      executionTime,
      success: false,
      dataCount: {},
      error: errorMessage
    };
  }
}

/**
 * BigQuery パフォーマンステストスイートを実行
 */
export async function runBigQueryPerformanceTests(): Promise<PerformanceTestResult[]> {
  console.log('🚀 BigQuery パフォーマンステスト開始');
  console.log('=' .repeat(60));

  const results: PerformanceTestResult[] = [];

  // テスト1: 従来のメンバーデータ取得
  results.push(await runPerformanceTest(
    '従来方式: メンバーデータ取得',
    () => getHinatazakaMember()
  ));

  // テスト2: 従来のペンライトデータ取得
  results.push(await runPerformanceTest(
    '従来方式: ペンライトデータ取得',
    () => getHinatazakaPenlight()
  ));

  // テスト3: 従来の並列取得
  results.push(await runPerformanceTest(
    '従来方式: 並列データ取得',
    async () => {
      const [members, penlight] = await Promise.all([
        getHinatazakaMember(),
        getHinatazakaPenlight()
      ]);
      return { members, colors: penlight };
    }
  ));

  // テスト4: 最適化されたバッチ取得
  results.push(await runPerformanceTest(
    '最適化版: バッチデータ取得',
    () => fetchMemberAndPenlightData('hinatazaka')
  ));

  // テスト5: 統合API関数
  results.push(await runPerformanceTest(
    '最適化版: 統合API関数',
    () => getCompleteDataByGroup('hinatazaka')
  ));

  // 結果の分析と表示
  console.log('\n📊 パフォーマンステスト結果');
  console.log('=' .repeat(60));

  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const dataInfo = result.success 
      ? `(メンバー: ${result.dataCount.members || 0}, ペンライト: ${result.dataCount.penlight || 0})`
      : `(エラー: ${result.error})`;
    
    console.log(`${index + 1}. ${status} ${result.testName}: ${result.executionTime.toFixed(2)}ms ${dataInfo}`);
  });

  // パフォーマンス改善の分析
  const traditionalParallel = results.find(r => r.testName.includes('従来方式: 並列データ取得'));
  const optimizedBatch = results.find(r => r.testName.includes('最適化版: バッチデータ取得'));

  if (traditionalParallel?.success && optimizedBatch?.success) {
    const improvement = traditionalParallel.executionTime - optimizedBatch.executionTime;
    const improvementPercent = (improvement / traditionalParallel.executionTime) * 100;
    
    console.log('\n🎯 パフォーマンス改善分析');
    console.log('-' .repeat(40));
    console.log(`従来方式: ${traditionalParallel.executionTime.toFixed(2)}ms`);
    console.log(`最適化版: ${optimizedBatch.executionTime.toFixed(2)}ms`);
    console.log(`改善時間: ${improvement.toFixed(2)}ms`);
    console.log(`改善率: ${improvementPercent.toFixed(1)}%`);
    
    if (improvement > 0) {
      console.log('✨ 最適化により性能が向上しました！');
    } else {
      console.log('⚠️ 最適化の効果が限定的です。環境や条件を確認してください。');
    }
  }

  console.log('\n🏁 パフォーマンステスト完了');
  return results;
}

/**
 * メイン実行関数（スクリプトとして実行する場合）
 */
if (require.main === module) {
  runBigQueryPerformanceTests()
    .then(() => {
      console.log('テスト完了');
      process.exit(0);
    })
    .catch(error => {
      console.error('テスト実行中にエラーが発生:', error);
      process.exit(1);
    });
}