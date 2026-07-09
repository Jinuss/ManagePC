import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../../main/constants";

export const taskAPI = {
  /**
   * 获取所有定时任务
   * @returns {Promise<Object>} - 包含任务列表的响应对象
   */
  getAll: () => ipcRenderer.invoke(IPC_CHANNELS.TASK_GET_ALL),

  /**
   * 根据ID获取任务
   * @param {number} id - 任务ID
   * @returns {Promise<Object>} - 任务信息响应对象
   */
  getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.TASK_GET_BY_ID, id),

  /**
   * 添加新任务
   * @param {Object} taskData - 任务数据
   * @param {string} taskData.content - 任务内容
   * @param {string} taskData.scheduleType - 触发类型
   * @param {string} [taskData.cronExpression] - Cron表达式
   * @param {string} [taskData.triggerTime] - 触发时间
   * @param {number} [taskData.repeatInterval] - 重复间隔
   * @param {string} [taskData.repeatUnit] - 重复单位
   * @param {boolean} [taskData.enabled] - 是否启用
   * @returns {Promise<Object>} - 添加结果响应对象
   */
  add: (taskData) => ipcRenderer.invoke(IPC_CHANNELS.TASK_ADD, taskData),

  /**
   * 更新任务
   * @param {number} id - 任务ID
   * @param {Object} taskData - 任务数据
   * @returns {Promise<Object>} - 更新结果响应对象
   */
  update: (id, taskData) => ipcRenderer.invoke(IPC_CHANNELS.TASK_UPDATE, id, taskData),

  /**
   * 删除任务
   * @param {number} id - 任务ID
   * @returns {Promise<Object>} - 删除结果响应对象
   */
  delete: (id) => ipcRenderer.invoke(IPC_CHANNELS.TASK_DELETE, id),

  /**
   * 启用/禁用任务
   * @param {number} id - 任务ID
   * @param {boolean} enabled - 是否启用
   * @returns {Promise<Object>} - 操作结果响应对象
   */
  toggle: (id, enabled) => ipcRenderer.invoke(IPC_CHANNELS.TASK_TOGGLE, id, enabled),
};