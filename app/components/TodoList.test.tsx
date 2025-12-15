import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from './TodoList';

describe('TodoList', () => {
  beforeEach(() => {
    render(<TodoList />);
  });

  describe('初期表示', () => {
    it('タイトルが表示される', () => {
      expect(screen.getByText('TODO リスト')).toBeInTheDocument();
    });

    it('入力フィールドとボタンが表示される', () => {
      expect(screen.getByPlaceholderText('新しいタスクを入力...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
    });

    it('タスクがない場合、メッセージが表示される', () => {
      expect(screen.getByText('タスクがありません。新しいタスクを追加してください。')).toBeInTheDocument();
    });
  });

  describe('タスクの追加', () => {
    it('入力フィールドにテキストを入力して追加ボタンをクリックするとタスクが追加される', async () => {
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('新しいタスクを入力...');
      const addButton = screen.getByRole('button', { name: '追加' });

      await user.type(input, 'テストタスク1');
      await user.click(addButton);

      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    });

    it('Enterキーを押してもタスクが追加される', async () => {
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('新しいタスクを入力...');

      await user.type(input, 'テストタスク2{Enter}');

      expect(screen.getByText('テストタスク2')).toBeInTheDocument();
    });

    it('空の入力では追加されない', async () => {
      const user = userEvent.setup();
      const addButton = screen.getByRole('button', { name: '追加' });

      await user.click(addButton);

      expect(screen.getByText('タスクがありません。新しいタスクを追加してください。')).toBeInTheDocument();
    });

    it('タスク追加後、入力フィールドがクリアされる', async () => {
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('新しいタスクを入力...') as HTMLInputElement;
      const addButton = screen.getByRole('button', { name: '追加' });

      await user.type(input, 'テストタスク');
      await user.click(addButton);

      expect(input.value).toBe('');
    });

    it('複数のタスクを追加できる', async () => {
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('新しいタスクを入力...');
      const addButton = screen.getByRole('button', { name: '追加' });

      await user.type(input, 'タスク1');
      await user.click(addButton);

      await user.type(input, 'タスク2');
      await user.click(addButton);

      await user.type(input, 'タスク3');
      await user.click(addButton);

      expect(screen.getByText('タスク1')).toBeInTheDocument();
      expect(screen.getByText('タスク2')).toBeInTheDocument();
      expect(screen.getByText('タスク3')).toBeInTheDocument();
    });
  });

  describe('タスクの完了/未完了の切り替え', () => {
    it('チェックボックスをクリックするとタスクが完了状態になる', async () => {
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('新しいタスクを入力...');
      const addButton = screen.getByRole('button', { name: '追加' });

      await user.type(input, '完了テスト');
      await user.click(addButton);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const todoText = screen.getByText('完了テスト');
      expect(todoText).toHaveClass('line-through');
    });

    it('完了状態のタスクを再度クリックすると未完了に戻る', async () => {
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('新しいタスクを入力...');
      const addButton = screen.getByRole('button', { name: '追加' });

      await user.type(input, 'トグルテスト');
      await user.click(addButton);

      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      let todoText = screen.getByText('トグルテスト');
      expect(todoText).toHaveClass('line-through');

      await user.click(checkbox);
      todoText = screen.getByText('トグルテスト');
      expect(todoText).not.toHaveClass('line-through');
    });
  });

  describe('タスクの削除', () => {
    it('削除ボタンをクリックするとタスクが削除される', async () => {
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('新しいタスクを入力...');
      const addButton = screen.getByRole('button', { name: '追加' });

      await user.type(input, '削除テスト');
      await user.click(addButton);

      expect(screen.getByText('削除テスト')).toBeInTheDocument();

      const deleteButton = screen.getByRole('button', { name: '削除' });
      await user.click(deleteButton);

      expect(screen.queryByText('削除テスト')).not.toBeInTheDocument();
    });

    it('複数のタスクから特定のタスクのみ削除される', async () => {
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('新しいタスクを入力...');
      const addButton = screen.getByRole('button', { name: '追加' });

      await user.type(input, 'タスクA');
      await user.click(addButton);

      await user.type(input, 'タスクB');
      await user.click(addButton);

      await user.type(input, 'タスクC');
      await user.click(addButton);

      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      await user.click(deleteButtons[1]);

      expect(screen.getByText('タスクA')).toBeInTheDocument();
      expect(screen.queryByText('タスクB')).not.toBeInTheDocument();
      expect(screen.getByText('タスクC')).toBeInTheDocument();
    });
  });

  describe('統計表示', () => {
    it('タスクの統計が正しく表示される', async () => {
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('新しいタスクを入力...');
      const addButton = screen.getByRole('button', { name: '追加' });

      await user.type(input, 'タスク1');
      await user.click(addButton);

      await user.type(input, 'タスク2');
      await user.click(addButton);

      await user.type(input, 'タスク3');
      await user.click(addButton);

      expect(screen.getByText(/合計: 3 件/)).toBeInTheDocument();
      expect(screen.getByText(/完了: 0 件/)).toBeInTheDocument();
      expect(screen.getByText(/未完了: 3 件/)).toBeInTheDocument();
    });

    it('完了タスクの統計が正しく更新される', async () => {
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('新しいタスクを入力...');
      const addButton = screen.getByRole('button', { name: '追加' });

      await user.type(input, 'タスク1');
      await user.click(addButton);

      await user.type(input, 'タスク2');
      await user.click(addButton);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      expect(screen.getByText(/合計: 2 件/)).toBeInTheDocument();
      expect(screen.getByText(/完了: 1 件/)).toBeInTheDocument();
      expect(screen.getByText(/未完了: 1 件/)).toBeInTheDocument();
    });

    it('タスクがない場合、統計は表示されない', () => {
      expect(screen.queryByText(/合計:/)).not.toBeInTheDocument();
    });
  });
});
