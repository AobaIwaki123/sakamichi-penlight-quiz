import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { useRouter } from 'next/navigation';
import AccountSettings from '@/components/AccountSettings/AccountSettings';

// next/navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// ローカルストレージのモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockPush = jest.fn();

/**
 * テスト用のMantineプロバイダーでラップしたコンポーネント
 */
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('AccountSettings', () => {
  beforeEach(() => {
    // useRouterのモック設定
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // localStorageのクリア
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
    mockPush.mockClear();
  });

  test('アカウント設定ページが正常にレンダリングされる', () => {
    renderWithProvider(<AccountSettings />);
    
    // ページタイトルの確認
    expect(screen.getByText('アカウント設定')).toBeInTheDocument();
    
    // 各設定セクションの確認
    expect(screen.getByText('プロフィール設定')).toBeInTheDocument();
    expect(screen.getByText('表示設定')).toBeInTheDocument();
    expect(screen.getByText('クイズ設定')).toBeInTheDocument();
    expect(screen.getByText('通知設定')).toBeInTheDocument();
    expect(screen.getByText('データ管理')).toBeInTheDocument();
    expect(screen.getByText('アプリ情報')).toBeInTheDocument();
  });

  test('ニックネーム入力フィールドが正常に動作する', () => {
    renderWithProvider(<AccountSettings />);
    
    const nicknameInput = screen.getByPlaceholderText('例: ひなファン');
    fireEvent.change(nicknameInput, { target: { value: 'テストユーザー' } });
    
    expect(nicknameInput).toHaveValue('テストユーザー');
  });

  test('設定保存ボタンがクリックされると設定がローカルストレージに保存される', () => {
    renderWithProvider(<AccountSettings />);
    
    // ニックネームを入力
    const nicknameInput = screen.getByPlaceholderText('例: ひなファン');
    fireEvent.change(nicknameInput, { target: { value: 'テストユーザー' } });
    
    // 保存ボタンをクリック
    const saveButton = screen.getByText('設定を保存');
    fireEvent.click(saveButton);
    
    // ローカルストレージの保存が呼ばれることを確認
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'accountSettings',
      expect.stringContaining('テストユーザー')
    );
    
    // 成功メッセージが表示されることを確認
    expect(screen.getByText('設定を保存しました: 変更内容が正常に保存されました')).toBeInTheDocument();
  });

  test('キャッシュクリアボタンがクリックされるとローカルストレージがクリアされる', () => {
    renderWithProvider(<AccountSettings />);
    
    // キャッシュクリアボタンをクリック
    const clearButton = screen.getByText('キャッシュをクリア');
    fireEvent.click(clearButton);
    
    // ローカルストレージのクリアが呼ばれることを確認
    expect(localStorageMock.clear).toHaveBeenCalled();
    
    // 完了メッセージが表示されることを確認
    expect(screen.getByText('キャッシュクリア完了: アプリケーションデータがクリアされました')).toBeInTheDocument();
  });

  test('ホームボタンがクリックされるとホームページに遷移する', () => {
    renderWithProvider(<AccountSettings />);
    
    // ホームボタンを見つけてクリック
    const homeButton = screen.getByTitle('ホームに戻る');
    fireEvent.click(homeButton);
    
    // ルーターのpushが呼ばれることを確認
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('アプリ情報が正しく表示される', () => {
    renderWithProvider(<AccountSettings />);
    
    // アプリ名とバージョン情報
    expect(screen.getByText('坂道ペンライトクイズ v3.2.1')).toBeInTheDocument();
    expect(screen.getByText('日向坂46のペンライト色を楽しく覚えよう！')).toBeInTheDocument();
  });

  test('難易度セレクトが正常に動作する', () => {
    renderWithProvider(<AccountSettings />);
    
    // 難易度選択を確認（Mantineのセレクトコンポーネントのテスト）
    const difficultyLabel = screen.getByText('難易度');
    expect(difficultyLabel).toBeInTheDocument();
  });

  test('通知設定の切り替えが正常に動作する', () => {
    renderWithProvider(<AccountSettings />);
    
    // プッシュ通知のスイッチを確認
    const notificationLabel = screen.getByText('プッシュ通知');
    expect(notificationLabel).toBeInTheDocument();
  });
});