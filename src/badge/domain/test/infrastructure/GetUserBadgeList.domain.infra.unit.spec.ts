import { TEST1_USER_LOCAL } from '@shared/test/UserMockData';
import { IUserBadgeRepository } from '@badge/domain/interfaces/UserBadge.repository.interface';
import { mockUserBadgeRepository } from './UserBadgeRepository.mock';

describe('getUserBadgeList', () => {
  const userBadgeRepository: IUserBadgeRepository = mockUserBadgeRepository;

  it('유저 뱃지 리스트 반환 성공', async () => {
    const userId = TEST1_USER_LOCAL.id;

    const userBadgeList: Array<{ badgeId: number }> = [{ badgeId: 1 }];

    jest
      .spyOn(userBadgeRepository, 'getUserBadgeList')
      .mockResolvedValue(userBadgeList);

    const result = await userBadgeRepository.getUserBadgeList(userId);

    expect(result).toEqual(userBadgeList);
    expect(userBadgeRepository.getUserBadgeList).toHaveBeenCalledWith(userId);
  });
});
