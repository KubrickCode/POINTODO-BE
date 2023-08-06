import { TaskEntity } from '../entities/task.entity';

export interface ITaskRepository {
  getTasksLogs(userId: string, taskType: string): Promise<TaskEntity[]>;
  getTaskLogById(id: number): Promise<TaskEntity>;
  createTask(
    userId: string,
    taskType: string,
    name: string,
    description: string,
    importance: number,
  ): Promise<TaskEntity>;
  updateTask(
    id: number,
    name: string,
    description: string,
    importance: number,
  ): Promise<TaskEntity>;
  deleteTask(id: number): Promise<TaskEntity>;
  completeTask(id: number, isRollback?: boolean): Promise<TaskEntity>;
  cancleTaskCompletion(id: number): Promise<TaskEntity>;
  lockTask(id: number): Promise<void>;
}
