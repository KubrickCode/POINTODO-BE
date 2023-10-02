import { TaskType_ } from '@task/domain/entities/Task.entity';
import { TEST1_USER_LOCAL } from './UserMockData';

const taskTypes: TaskType_[] = ['DAILY', 'FREE'];
const randomIndex = Math.floor(Math.random() * taskTypes.length);

export const mockTask = {
  userId: TEST1_USER_LOCAL.id,
  taskType: taskTypes[randomIndex],
  name: 'test',
  description: 'test',
  importance: 0,
};
