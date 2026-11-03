import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isTasks,
  readTasks,
  writeTasks,
  TASKS_STORAGE_KEY,
} from '../src/storage/tasks.ts';

const task = { id: 'one', title: 'Buy milk', done: false };

test('first launch starts with an empty list', async () => {
  assert.deepEqual(await readTasks({ getItem: async () => null }), []);
});

test('create, edit, complete, reopen and delete survive storage round trips', async () => {
  let stored = null;
  const storage = {
    getItem: async (key) => {
      assert.equal(key, TASKS_STORAGE_KEY);
      return stored;
    },
    setItem: async (key, value) => {
      assert.equal(key, TASKS_STORAGE_KEY);
      stored = value;
    },
  };
  for (const tasks of [
    [task],
    [{ ...task, title: 'Buy oat milk' }],
    [{ ...task, done: true }],
    [{ ...task, done: false }],
    [],
  ]) {
    await writeTasks(storage, tasks);
    assert.deepEqual(await readTasks(storage), tasks);
  }
});

test('invalid and duplicate tasks are rejected at the persistence boundary', async () => {
  const invalid = [
    null,
    {},
    [null],
    [{ ...task, id: '' }],
    [{ ...task, id: ' ' }],
    [{ ...task, title: '  ' }],
    [{ ...task, title: 'x'.repeat(201) }],
    [{ ...task, done: 'false' }],
    [task, task],
  ];
  for (const value of invalid) {
    assert.equal(isTasks(value), false);
    await assert.rejects(
      writeTasks({ setItem: async () => assert.fail('must not write') }, value),
    );
  }
  assert.equal(isTasks([{ ...task, title: 'x'.repeat(200) }]), true);
  assert.equal(isTasks([{ ...task, title: 'Read 📚' }]), true);
});

test('corrupt saved data is reported without rewriting it', async () => {
  for (const stored of [
    '{broken',
    '{}',
    '[null]',
    JSON.stringify([task, task]),
  ]) {
    await assert.rejects(readTasks({ getItem: async () => stored }));
  }
});

test('read failures propagate so the app can offer retry', async () => {
  await assert.rejects(
    readTasks({
      getItem: async () => {
        throw new Error('offline');
      },
    }),
    /offline/,
  );
});

test('failed writes preserve the previously saved list and can be retried', async () => {
  let stored = JSON.stringify([task]);
  let failing = true;
  const storage = {
    getItem: async () => stored,
    setItem: async (_key, value) => {
      if (failing) throw new Error('storage full');
      stored = value;
    },
  };
  await assert.rejects(writeTasks(storage, []), /storage full/);
  assert.deepEqual(await readTasks(storage), [task]);
  failing = false;
  await writeTasks(storage, []);
  assert.deepEqual(await readTasks(storage), []);
});
