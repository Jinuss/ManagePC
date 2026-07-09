import schedule from 'node-schedule';
import { Notification } from 'electron';
import taskDatabase from '../../database/task.db.js';
import { log } from '../log/logManager.js';

class TaskManager {
  constructor() {
    this.scheduledJobs = new Map();
  }

  async init() {
    const tasks = taskDatabase.getAll();
    tasks.forEach(task => {
      if (task.enabled) {
        this.scheduleTask(task);
      }
    });
    log.info('[TaskManager] Initialized with', tasks.length, 'tasks');
  }

  scheduleTask(task) {
    if (this.scheduledJobs.has(task.id)) {
      this.scheduledJobs.get(task.id).cancel();
    }

    let job = null;

    switch (task.schedule_type) {
      case 'once':
        job = this.scheduleOnce(task);
        break;
      case 'cron':
        job = this.scheduleCron(task);
        break;
      case 'interval':
        job = this.scheduleInterval(task);
        break;
      default:
        log.warn('[TaskManager] Unknown schedule type:', task.schedule_type);
        return;
    }

    if (job) {
      this.scheduledJobs.set(task.id, job);
      log.info('[TaskManager] Scheduled task:', task.id, task.content);
    }
  }

  scheduleOnce(task) {
    log.info('[TaskManager] scheduleOnce - task.trigger_time:', task.trigger_time, '类型:', typeof task.trigger_time);
    const triggerTime = new Date(task.trigger_time);
    log.info('[TaskManager] scheduleOnce - parsed triggerTime:', triggerTime);
    if (triggerTime <= new Date()) {
      log.warn('[TaskManager] Trigger time is in the past:', task.trigger_time);
      return null;
    }
    return schedule.scheduleJob(triggerTime, () => {
      this.executeTask(task);
      taskDatabase.updateTask(task.id, { enabled: false });
      this.scheduledJobs.delete(task.id);
    });
  }

  scheduleCron(task) {
    if (!task.cron_expression) {
      log.warn('[TaskManager] No cron expression for task:', task.id);
      return null;
    }
    try {
      return schedule.scheduleJob(task.cron_expression, () => {
        this.executeTask(task);
      });
    } catch (error) {
      log.error('[TaskManager] Invalid cron expression:', task.cron_expression, error);
      return null;
    }
  }

  scheduleInterval(task) {
    if (!task.repeat_interval || !task.repeat_unit) {
      log.warn('[TaskManager] Missing interval settings for task:', task.id);
      return null;
    }

    const interval = task.repeat_interval;
    const unit = task.repeat_unit;
    const now = new Date();

    const rules = new schedule.RecurrenceRule();
    switch (unit) {
      case 'minutes':
        rules.minute = new schedule.Range(0, 59, interval);
        break;
      case 'hours':
        rules.hour = new schedule.Range(0, 23, interval);
        break;
      case 'days':
        rules.dayOfMonth = new schedule.Range(1, 31, interval);
        break;
      case 'weeks':
        rules.dayOfWeek = new schedule.Range(0, 6, interval);
        break;
      default:
        log.warn('[TaskManager] Unknown repeat unit:', unit);
        return null;
    }

    return schedule.scheduleJob(rules, () => {
      this.executeTask(task);
    });
  }

  executeTask(task) {
    log.info('[TaskManager] Executing task:', task.id, task.content);

    new Notification({
      title: '定时任务提醒',
      body: task.content,
      silent: false,
    }).show();
  }

  addTask(taskData) {
    const task = taskDatabase.create(taskData);
    if (task.enabled) {
      this.scheduleTask(task);
    }
    return task;
  }

  updateTask(id, taskData) {
    const task = taskDatabase.update(id, taskData);
    if (task.enabled) {
      this.scheduleTask(task);
    } else {
      this.cancelTask(id);
    }
    return task;
  }

  deleteTask(id) {
    this.cancelTask(id);
    return taskDatabase.delete(id);
  }

  toggleTask(id, enabled) {
    const task = taskDatabase.toggle(id, enabled);
    if (enabled) {
      this.scheduleTask(task);
    } else {
      this.cancelTask(id);
    }
    return task;
  }

  cancelTask(id) {
    const job = this.scheduledJobs.get(id);
    if (job) {
      job.cancel();
      this.scheduledJobs.delete(id);
      log.info('[TaskManager] Cancelled task:', id);
    }
  }

  getAllTasks() {
    return taskDatabase.getAll();
  }

  getTaskById(id) {
    return taskDatabase.getById(id);
  }

  shutdown() {
    this.scheduledJobs.forEach((job, id) => {
      job.cancel();
    });
    this.scheduledJobs.clear();
    taskDatabase.close();
    log.info('[TaskManager] Shutdown complete');
  }
}

const taskManager = new TaskManager();

export default taskManager;