"use server";

/**
 * BigQuery API のパフォーマンステスト用関数
 * 最適化前後の性能を比較するためのテストツール
 */

import { getCompleteDataByGroup, getCompleteDataByGroupOptimized } from './index';
import type { Group } from './common/queryUtils';

/**
 * パフォーマンステスト結果
 */
interface PerformanceTestResult {
  /** テスト名 */
  testName: string;
  /** 実行時間（ミリ秒） */
  executionTime: number;
  /** 取得データ数 */
  dataCount: {
    members: number;
    colors: number;
    total: number;
  };
  /** エラー情報（失敗時） */
  error?: string;
}

/**
 * 単一グループのパフォーマンステストを実行
 * 
 * @param group 対象グループ
 * @param iterations テスト回数（デフォルト: 3）
 * @returns テスト結果の配列
 */
export async function runPerformanceTest(
  group: Group,
  iterations: number = 3
): Promise<{
  traditional: PerformanceTestResult[];
  optimized: PerformanceTestResult[];
  summary: {
    traditionalAvg: number;
    optimizedAvg: number;
    improvement: number; // 改善率（%）
  };
}> {
  console.log(`🚀 ${group}グループのパフォーマンステスト開始 (${iterations}回実行)`);
  
  const traditionalResults: PerformanceTestResult[] = [];
  const optimizedResults: PerformanceTestResult[] = [];
  
  // 従来の方法でのテスト
  console.log('📊 従来の方法でテスト実行中...');
  for (let i = 0; i < iterations; i++) {
    const result = await testTraditionalMethod(group, i + 1);
    traditionalResults.push(result);
    console.log(`  - 実行${i + 1}: ${result.executionTime.toFixed(2)}ms`);
  }
  
  // 最適化された方法でのテスト
  console.log('⚡ 最適化された方法でテスト実行中...');
  for (let i = 0; i < iterations; i++) {
    const result = await testOptimizedMethod(group, i + 1);
    optimizedResults.push(result);
    console.log(`  - 実行${i + 1}: ${result.executionTime.toFixed(2)}ms`);
  }
  
  // 結果の集計
  const traditionalAvg = traditionalResults.reduce((sum, r) => sum + r.executionTime, 0) / iterations;
  const optimizedAvg = optimizedResults.reduce((sum, r) => sum + r.executionTime, 0) / iterations;
  const improvement = ((traditionalAvg - optimizedAvg) / traditionalAvg) * 100;
  
  const summary = {
    traditionalAvg,
    optimizedAvg,
    improvement
  };
  
  console.log('📈 テスト結果サマリー:');
  console.log(`  - 従来の方法平均: ${traditionalAvg.toFixed(2)}ms`);
  console.log(`  - 最適化後平均: ${optimizedAvg.toFixed(2)}ms`);
  console.log(`  - 改善率: ${improvement.toFixed(1)}%`);
  
  return {
    traditional: traditionalResults,
    optimized: optimizedResults,
    summary
  };
}

/**
 * 従来の方法でのデータ取得テスト
 */
async function testTraditionalMethod(group: Group, iteration: number): Promise<PerformanceTestResult> {
  const startTime = performance.now();
  
  try {
    const { members, colors } = await getCompleteDataByGroup(group);
    const endTime = performance.now();
    
    return {
      testName: `Traditional-${group}-${iteration}`,
      executionTime: endTime - startTime,
      dataCount: {
        members: members.length,
        colors: colors.length,
        total: members.length + colors.length
      }
    };
  } catch (error) {
    const endTime = performance.now();
    
    return {
      testName: `Traditional-${group}-${iteration}`,
      executionTime: endTime - startTime,
      dataCount: { members: 0, colors: 0, total: 0 },
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 最適化された方法でのデータ取得テスト
 */
async function testOptimizedMethod(group: Group, iteration: number): Promise<PerformanceTestResult> {
  const startTime = performance.now();
  
  try {
    const { members, colors } = await getCompleteDataByGroupOptimized(group, {
      activeOnly: false,
      memberLimit: 200,
      penlightLimit: 100
    });
    const endTime = performance.now();
    
    return {
      testName: `Optimized-${group}-${iteration}`,
      executionTime: endTime - startTime,
      dataCount: {
        members: members.length,
        colors: colors.length,
        total: members.length + colors.length
      }
    };
  } catch (error) {
    const endTime = performance.now();
    
    return {
      testName: `Optimized-${group}-${iteration}`,
      executionTime: endTime - startTime,
      dataCount: { members: 0, colors: 0, total: 0 },
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 全グループでのパフォーマンステストを実行
 * 
 * @param iterations テスト回数（デフォルト: 3）
 * @returns 全グループのテスト結果
 */
export async function runFullPerformanceTest(iterations: number = 3): Promise<{
  hinatazaka: Awaited<ReturnType<typeof runPerformanceTest>>;
  sakurazaka: Awaited<ReturnType<typeof runPerformanceTest>>;
  overall: {
    traditionalTotalAvg: number;
    optimizedTotalAvg: number;
    overallImprovement: number;
  };
}> {
  console.log('🎯 全グループでのパフォーマンステスト開始');
  
  const hinatazakaResult = await runPerformanceTest('hinatazaka', iterations);
  const sakurazakaResult = await runPerformanceTest('sakurazaka', iterations);
  
  // 全体の平均を計算
  const traditionalTotalAvg = (hinatazakaResult.summary.traditionalAvg + sakurazakaResult.summary.traditionalAvg) / 2;
  const optimizedTotalAvg = (hinatazakaResult.summary.optimizedAvg + sakurazakaResult.summary.optimizedAvg) / 2;
  const overallImprovement = ((traditionalTotalAvg - optimizedTotalAvg) / traditionalTotalAvg) * 100;
  
  console.log('🏆 全体結果:');
  console.log(`  - 従来の方法全体平均: ${traditionalTotalAvg.toFixed(2)}ms`);
  console.log(`  - 最適化後全体平均: ${optimizedTotalAvg.toFixed(2)}ms`);
  console.log(`  - 全体改善率: ${overallImprovement.toFixed(1)}%`);
  
  return {
    hinatazaka: hinatazakaResult,
    sakurazaka: sakurazakaResult,
    overall: {
      traditionalTotalAvg,
      optimizedTotalAvg,
      overallImprovement
    }
  };
}

/**
 * 開発環境でのテスト実行用関数
 * モック環境では実行せず、本番環境でのみテストを実行
 */
export async function runPerformanceTestSafe(): Promise<void> {
  const { getApiEnvironment } = await import('./common/errorHandling');
  const environment = getApiEnvironment();
  
  if (environment.useMock) {
    console.log('⚠️  モック環境のため、パフォーマンステストをスキップします');
    return;
  }
  
  try {
    await runFullPerformanceTest(2); // 本番環境では軽めのテスト
  } catch (error) {
    console.error('❌ パフォーマンステストでエラーが発生:', error);
  }
}