'use client';

import { useState } from 'react';
import { Button, Group, Text, Code, Collapse, Alert } from '@mantine/core';
import { debugPenlightTable } from '@/api/bq/debugPenlight';

/**
 * ペンライトテーブルデバッグ用コンポーネント
 * 開発時のみ表示し、BigQueryテーブルの状況を確認できる
 */
export const PenlightDebug = () => {
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [opened, setOpened] = useState(false);

  const handleDebug = async (dataset: 'hinatazaka' | 'sakurazaka') => {
    setIsLoading(true);
    try {
      console.log(`デバッグ開始: ${dataset}`);
      const result = await debugPenlightTable(dataset);
      setDebugResult({ dataset, ...result });
      setOpened(true);
    } catch (error) {
      console.error('デバッグエラー:', error);
      setDebugResult({
        dataset,
        exists: false,
        error: error instanceof Error ? error.message : String(error)
      });
      setOpened(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 本番環境では表示しない
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={{ padding: '1rem', border: '1px dashed #ccc', margin: '1rem' }}>
      <Text size="lg" fw={600} mb="md">ペンライトテーブルデバッグ</Text>

      <Group mb="md">
        <Button
          onClick={() => handleDebug('hinatazaka')}
          loading={isLoading}
          variant="outline"
          size="sm"
        >
          日向坂46テーブル確認
        </Button>
        <Button
          onClick={() => handleDebug('sakurazaka')}
          loading={isLoading}
          variant="outline"
          size="sm"
        >
          櫻坂46テーブル確認
        </Button>
      </Group>

      <Collapse in={opened}>
        {debugResult && (
          <div>
            <Alert
              color={debugResult.exists ? 'green' : 'red'}
              title={`${debugResult.dataset} テーブル状況`}
              mb="md"
            >
              {debugResult.exists ? 'テーブルが存在します' : 'テーブルが存在しません'}
            </Alert>

            {debugResult.exists && (
              <>
                <Text size="sm" fw={500} mb="xs">データ件数: {debugResult.count}件</Text>

                {debugResult.schema && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">スキーマ:</Text>
                    <Code block mb="md">
                      {debugResult.schema.map((field: any) =>
                        `${field.name}: ${field.type}`
                      ).join('\n')}
                    </Code>
                  </div>
                )}

                {debugResult.sample && debugResult.sample.length > 0 && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">サンプルデータ:</Text>
                    <Code block mb="md">
                      {JSON.stringify(debugResult.sample, null, 2)}
                    </Code>
                  </div>
                )}
              </>
            )}

            {debugResult.error && (
              <div>
                <Text size="sm" fw={500} mb="xs" c="red">エラー:</Text>
                <Code block color="red">
                  {debugResult.error}
                </Code>
              </div>
            )}
          </div>
        )}
      </Collapse>

      <Text size="xs" c="dimmed" mt="md">
        このコンポーネントは開発環境でのみ表示されます。
        <br />
        ブラウザのコンソールでもデバッグ情報を確認できます。
      </Text>
    </div>
  );
};
