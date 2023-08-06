import { Injectable } from '@nestjs/common';
import { TasksLogs } from '@prisma/client';
import { PrismaService } from '@shared/service/prisma.service';
import { TaskEntity } from '@task/domain/entities/task.entity';
import { ITaskRepository } from '@task/domain/interfaces/task.repository.interface';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTasksLogs(userId: string, taskType: string): Promise<TaskEntity[]> {
    const query = `
      SELECT * FROM "TasksLogs"
      WHERE "userId" = $1::uuid
      AND "taskType" = $2
    `;
    const values = [userId, taskType];
    const tasksLogs = await this.prisma.$queryRawUnsafe<TasksLogs[]>(
      query,
      ...values,
    );
    return tasksLogs;
  }

  async getTaskLogById(id: number): Promise<TaskEntity> {
    const query = `
      SELECT * FROM "TasksLogs"
      WHERE id = $1
    `;
    const values = [id];
    const taskLog = await this.prisma.$queryRawUnsafe<TasksLogs>(
      query,
      ...values,
    );
    return taskLog[0];
  }

  async createTask(
    userId: string,
    taskType: string,
    name: string,
    description: string,
    importance: number,
  ): Promise<TaskEntity> {
    const query = `
      INSERT INTO "TasksLogs" ("userId", "taskType", name, description, importance)
      VALUES ($1::uuid, $2, $3, $4 ,$5)
      RETURNING *
    `;
    const values = [userId, taskType, name, description, importance];
    const newTasksLogs = await this.prisma.$queryRawUnsafe<TasksLogs>(
      query,
      ...values,
    );
    return newTasksLogs[0];
  }

  async updateTask(
    id: number,
    name: string,
    description: string,
    importance: number,
  ): Promise<TaskEntity> {
    const updateFields: string[] = [];
    const values: (number | string)[] = [];
    let placeholderIndex = 1;

    if (name) {
      updateFields.push(`name = $${placeholderIndex}`);
      values.push(name);
      placeholderIndex++;
    }

    if (description) {
      updateFields.push(`description = $${placeholderIndex}`);
      values.push(description);
      placeholderIndex++;
    }

    if (importance !== undefined) {
      updateFields.push(`importance = $${placeholderIndex}`);
      values.push(importance);
      placeholderIndex++;
    }

    values.push(id);
    placeholderIndex++;

    const query = `
      UPDATE "TasksLogs"
      SET ${updateFields.join(', ')}
      WHERE id = $${placeholderIndex - 1}
      RETURNING *
    `;

    const updatedTaskLog = await this.prisma.$queryRawUnsafe<TasksLogs>(
      query,
      ...values,
    );
    return updatedTaskLog[0];
  }

  async deleteTask(id: number): Promise<TaskEntity> {
    const query = `
      DELETE FROM "TasksLogs"
      WHERE id = $1
      RETURNING *
    `;
    const values = [id];
    const deletedTaskLog = await this.prisma.$queryRawUnsafe<TasksLogs>(
      query,
      ...values,
    );
    return deletedTaskLog[0];
  }

  async completeTask(id: number, isRollback?: boolean): Promise<TaskEntity> {
    const completeQuery = `
        UPDATE "TasksLogs"
        SET completion = completion ${isRollback ? '- 1' : '+ 1'}
        WHERE id = $1
        RETURNING *
      `;
    const completeValues = [id];
    const completedTaskLog = await this.prisma.$queryRawUnsafe<TasksLogs>(
      completeQuery,
      ...completeValues,
    );

    return completedTaskLog[0];
  }

  async lockTask(id: number): Promise<TaskEntity> {
    const query = `
        UPDATE "TasksLogs"
        SET version = 1
        WHERE id = $1
        RETURNING *
      `;
    const values = [id];
    const lockedTaskLog = await this.prisma.$queryRawUnsafe<TasksLogs>(
      query,
      ...values,
    );

    return lockedTaskLog[0];
  }
}
