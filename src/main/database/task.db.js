import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { log } from '../modules/log/logManager';

const DB_PATH = path.join(app.getPath('userData'), 'tasks.db');

class TaskDatabase {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(DB_PATH);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        schedule_type TEXT NOT NULL DEFAULT 'once',
        cron_expression TEXT,
        trigger_time DATETIME,
        repeat_interval INTEGER,
        repeat_unit TEXT,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  getAll() {
    const stmt = this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
    const tasks = stmt.all();
    log.info('[TaskDB] 获取所有任务，数量:', tasks.length);
    return tasks;
  }

  getById(id) {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = stmt.get(id);
    log.info('[TaskDB] 根据ID获取任务，ID:', id, 'task:', JSON.stringify(task));
    return task;
  }

  create(data) {
    log.info('[TaskDB] 创建任务，triggerTime:', data.triggerTime, '类型:', typeof data.triggerTime);
    const stmt = this.db.prepare(`
      INSERT INTO tasks (content, schedule_type, cron_expression, trigger_time, repeat_interval, repeat_unit, enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.content,
      data.scheduleType || 'once',
      data.cronExpression || null,
      data.triggerTime || null,
      data.repeatInterval || null,
      data.repeatUnit || null,
      data.enabled !== undefined ? (data.enabled ? 1 : 0) : 1
    );
    const createdTask = this.getById(info.lastInsertRowid);
    log.info('[TaskDB] 创建成功，task:', JSON.stringify(createdTask));
    return createdTask;
  }

  update(id, data) {
    log.info('[TaskDB] 更新任务，ID:', id, 'data:', data);
    const existingTask = this.getById(id);
    if (!existingTask) {
      log.warn('[TaskDB] 更新任务失败，未找到任务，ID:', id);
      return null;
    }
    const mappedData = {};
    const fieldMap = {
      content: 'content',
      scheduleType: 'schedule_type',
      cronExpression: 'cron_expression',
      triggerTime: 'trigger_time',
      repeatInterval: 'repeat_interval',
      repeatUnit: 'repeat_unit',
      enabled: 'enabled',
    };
    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        mappedData[dbField] = key === 'enabled' ? (data[key] ? 1 : 0) : data[key];
      }
    }
    const mergedData = { ...existingTask, ...mappedData };
    const stmt = this.db.prepare(`
      UPDATE tasks SET 
        content = ?,
        schedule_type = ?,
        cron_expression = ?,
        trigger_time = ?,
        repeat_interval = ?,
        repeat_unit = ?,
        enabled = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      mergedData.content,
      mergedData.schedule_type,
      mergedData.cron_expression,
      mergedData.trigger_time,
      mergedData.repeat_interval,
      mergedData.repeat_unit,
      mergedData.enabled,
      id
    );
    const updatedTask = this.getById(id);
    log.info('[TaskDB] 更新成功，task:', JSON.stringify(updatedTask));
    return updatedTask;
  }

  delete(id) {
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id).changes > 0;
    log.info('[TaskDB] 删除任务，ID:', id,);
    return result;
  }

  toggle(id, enabled) {
    const stmt = this.db.prepare('UPDATE tasks SET enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(enabled ? 1 : 0, id);
    log.info('[TaskDB] 切换任务状态，ID:', id);
    return this.getById(id);
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

const taskDatabase = new TaskDatabase();

export default taskDatabase;