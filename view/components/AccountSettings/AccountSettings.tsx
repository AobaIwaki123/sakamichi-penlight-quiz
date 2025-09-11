"use client";

import { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Group,
  Switch,
  Select,
  TextInput,
  Button,
  Text,
  Space,
  Stack,
  Divider,
  Badge,
  ActionIcon,
  Alert,
} from '@mantine/core';
import {
  IconUser,
  IconPalette,
  IconBell,
  IconDatabase,
  IconHome,
  IconInfoCircle,
  IconTrash,
  IconCheck,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useMantineColorScheme } from '@mantine/core';

/**
 * アカウント設定メインコンポーネント
 * ユーザーの各種設定を管理する
 */
export default function AccountSettings() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  
  // ローカル状態管理
  const [nickname, setNickname] = useState('');
  const [notifications_enabled, setNotificationsEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('normal');
  const [saveMessage, setSaveMessage] = useState('');
  const [clearMessage, setClearMessage] = useState('');

  /**
   * ホームページに戻る
   */
  const handleBackToHome = () => {
    router.push('/');
  };

  /**
   * キャッシュをクリアする
   */
  const handleClearCache = () => {
    // ローカルストレージとキャッシュをクリア
    localStorage.clear();
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      });
    }
    
    setClearMessage('キャッシュクリア完了: アプリケーションデータがクリアされました');
    // 3秒後にメッセージを消去
    setTimeout(() => setClearMessage(''), 3000);
  };

  /**
   * 設定を保存する
   */
  const handleSaveSettings = () => {
    // 設定をローカルストレージに保存（実際のアプリでは適切なストレージを使用）
    const settings = {
      nickname,
      notificationsEnabled: notifications_enabled,
      difficulty,
      theme: colorScheme,
    };
    
    localStorage.setItem('accountSettings', JSON.stringify(settings));
    
    setSaveMessage('設定を保存しました: 変更内容が正常に保存されました');
    // 3秒後にメッセージを消去
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <Container size="sm" py="xl">
      {/* ページヘッダー */}
      <Group justify="space-between" mb="lg">
        <Title order={2}>
          <Group>
            <IconUser size={28} />
            アカウント設定
          </Group>
        </Title>
        <ActionIcon
          variant="light"
          size="lg"
          onClick={handleBackToHome}
          title="ホームに戻る"
        >
          <IconHome size={20} />
        </ActionIcon>
      </Group>

      <Stack gap="lg">
        {/* プロフィール設定 */}
        <Paper shadow="sm" p="lg" radius="md">
          <Title order={3} size="h4" mb="md">
            <Group>
              <IconUser size={20} />
              プロフィール設定
            </Group>
          </Title>
          
          <TextInput
            label="ニックネーム"
            description="クイズで表示される名前を設定できます"
            placeholder="例: ひなファン"
            value={nickname}
            onChange={(event) => setNickname(event.currentTarget.value)}
          />
        </Paper>

        {/* テーマ設定 */}
        <Paper shadow="sm" p="lg" radius="md">
          <Title order={3} size="h4" mb="md">
            <Group>
              <IconPalette size={20} />
              表示設定
            </Group>
          </Title>
          
          <Group justify="space-between">
            <div>
              <Text fw={500}>ダークモード</Text>
              <Text size="sm" c="dimmed">
                アプリの外観を変更します
              </Text>
            </div>
            <Switch
              checked={colorScheme === 'dark'}
              onChange={() => toggleColorScheme()}
              size="md"
            />
          </Group>
          
          <Space h="sm" />
          
          <Badge
            color={colorScheme === 'dark' ? 'dark' : 'blue'}
            variant="light"
            size="sm"
          >
            現在: {colorScheme === 'dark' ? 'ダークモード' : 'ライトモード'}
          </Badge>
        </Paper>

        {/* クイズ設定 */}
        <Paper shadow="sm" p="lg" radius="md">
          <Title order={3} size="h4" mb="md">
            クイズ設定
          </Title>
          
          <Select
            label="難易度"
            description="クイズの難易度を選択できます"
            data={[
              { value: 'easy', label: 'かんたん - 人気メンバー中心' },
              { value: 'normal', label: 'ふつう - 全メンバー' },
              { value: 'hard', label: 'むずかしい - 卒業生含む' },
            ]}
            value={difficulty}
            onChange={(value) => setDifficulty(value || 'normal')}
          />
        </Paper>

        {/* 通知設定 */}
        <Paper shadow="sm" p="lg" radius="md">
          <Title order={3} size="h4" mb="md">
            <Group>
              <IconBell size={20} />
              通知設定
            </Group>
          </Title>
          
          <Group justify="space-between">
            <div>
              <Text fw={500}>プッシュ通知</Text>
              <Text size="sm" c="dimmed">
                新機能やイベントの通知を受け取る
              </Text>
            </div>
            <Switch
              checked={notifications_enabled}
              onChange={(event) => setNotificationsEnabled(event.currentTarget.checked)}
              size="md"
            />
          </Group>
        </Paper>

        {/* データ管理 */}
        <Paper shadow="sm" p="lg" radius="md">
          <Title order={3} size="h4" mb="md">
            <Group>
              <IconDatabase size={20} />
              データ管理
            </Group>
          </Title>
          
          <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="md">
            キャッシュをクリアすると、保存されたデータや設定がリセットされます。
          </Alert>
          
          <Button
            variant="outline"
            color="orange"
            leftSection={<IconTrash size={16} />}
            onClick={handleClearCache}
          >
            キャッシュをクリア
          </Button>
        </Paper>

        <Divider />

        {/* メッセージ表示エリア */}
        {saveMessage && (
          <Alert
            icon={<IconCheck size={16} />}
            title="成功"
            color="green"
            mb="md"
          >
            {saveMessage}
          </Alert>
        )}
        
        {clearMessage && (
          <Alert
            icon={<IconCheck size={16} />}
            title="完了"
            color="blue"
            mb="md"
          >
            {clearMessage}
          </Alert>
        )}

        {/* 保存ボタン */}
        <Group justify="center" mt="md">
          <Button
            size="lg"
            onClick={handleSaveSettings}
          >
            設定を保存
          </Button>
        </Group>

        {/* アプリ情報 */}
        <Paper shadow="sm" p="lg" radius="md" bg="gray.0">
          <Title order={4} mb="xs">アプリ情報</Title>
          <Text size="sm" c="dimmed">
            坂道ペンライトクイズ v3.2.1
          </Text>
          <Text size="sm" c="dimmed">
            日向坂46のペンライト色を楽しく覚えよう！
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            環境: {process.env.NODE_ENV || 'production'}
          </Text>
          <Text size="xs" c="dimmed">
            ビルド日時: {new Date().toLocaleDateString('ja-JP')}
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
}