import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../constants.js';
import taskManager from '../task/taskManager.js';
import { log } from '../log/logManager';

export const registerTaskHandlers = () => {
  ipcMain.handle(IPC_CHANNELS.TASK_GET_ALL, async () => {
    try {
      log.info('[TaskIPC] 获取所有定时任务');
      const tasks = taskManager.getAllTasks();
      log.info('[TaskIPC] 成功获取定时任务列表，数量: ' + tasks.length);
      return {
        success: true,
        data: tasks,
      };
    } catch (error) {
      log.error('[TaskIPC] 获取定时任务列表失败: ' + error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.TASK_GET_BY_ID, async (event, id) => {
    try {
      log.info('[TaskIPC] 根据ID获取定时任务，ID: ' + id);
      const task = taskManager.getTaskById(id);
      if (!task) {
        log.warn('[TaskIPC] 未找到指定ID的定时任务，ID: ' + id);
      } else {
        log.info('[TaskIPC] 成功获取定时任务，ID: ' + id);
      }
      return {
        success: true,
        data: task,
      };
    } catch (error) {
      log.error('[TaskIPC] 根据ID获取定时任务失败，ID: ' + id + ', 错误: ' + error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.TASK_ADD, async (event, taskData) => {
    try {
      log.info('[TaskIPC] 添加新定时任务，任务内容: ' + (taskData.content || '无'));
      const task = taskManager.addTask(taskData);
      log.info('[TaskIPC] 成功添加定时任务，任务ID: ' + task.id);
      return {
        success: true,
        data: task,
      };
    } catch (error) {
      log.error('[TaskIPC] 添加定时任务失败，错误: ' + error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.TASK_UPDATE, async (event, id, taskData) => {
    try {
      log.info('[TaskIPC] 更新定时任务，任务ID: ' + id);
      const task = taskManager.updateTask(id, taskData);
      log.info('[TaskIPC] 成功更新定时任务，任务ID: ' + id);
      return {
        success: true,
        data: task,
      };
    } catch (error) {
      log.error('[TaskIPC] 更新定时任务失败，任务ID: ' + id + ', 错误: ' + error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.TASK_DELETE, async (event, id) => {
    try {
      log.info('[TaskIPC] 删除定时任务，任务ID: ' + id);
      const result = taskManager.deleteTask(id);
      log.info('[TaskIPC] 成功删除定时任务，任务ID: ' + id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      log.error('[TaskIPC] 删除定时任务失败，任务ID: ' + id + ', 错误: ' + error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.TASK_TOGGLE, async (event, id, enabled) => {
    try {
      log.info('[TaskIPC] 切换定时任务状态，任务ID: ' + id + ', 启用状态: ' + enabled);
      const task = taskManager.toggleTask(id, enabled);
      log.info('[TaskIPC] 成功切换定时任务状态，任务ID: ' + id + ', 当前状态: ' + task.enabled);
      return {
        success: true,
        data: task,
      };
    } catch (error) {
      log.error('[TaskIPC] 切换定时任务状态失败，任务ID: ' + id + ', 错误: ' + error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  });
};