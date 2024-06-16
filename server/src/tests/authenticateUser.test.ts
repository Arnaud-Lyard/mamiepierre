import { authenticateUser } from '../middleware/authenticateUser';
import { findUniqueUser } from '../user/service/user.service';
import { verifyJwt } from '../utils/jwt';
import AppError from '../utils/appError';
import { Request, Response } from 'express';

jest.mock('../user/service/user.service');
jest.mock('../utils/jwt');

describe('authenticateUser middleware', () => {
  const lang = 'en';

  const req = {
    headers: {},
    cookies: {},
    language: lang,
  } as Request;

  const res = {} as Response;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next with error if no access token provided', async () => {
    await authenticateUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new AppError(401, 'You are not logged in.')
    );
  });

  it('should call next with error if invalid access token provided', async () => {
    req.headers.authorization = 'Bearer invalid_token';
    await authenticateUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new AppError(401, `Invalid token or user doesn't exist.`)
    );
  });

  it('should call next with error if user not found', async () => {
    const fakeUserId = 'fakeUserId';
    const fakeAccessToken = 'fakeAccessToken';
    req.headers.authorization = `Bearer ${fakeAccessToken}`;
    (verifyJwt as jest.Mock).mockReturnValue({ sub: fakeUserId });
    (findUniqueUser as jest.Mock).mockResolvedValue(null);

    await authenticateUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new AppError(401, `Invalid token or session has expired.`)
    );
  });

  it('should call next without error if valid access token and user found', async () => {
    const fakeUserId = 'fakeUserId';
    const fakeAccessToken = 'fakeAccessToken';
    req.headers.authorization = `Bearer ${fakeAccessToken}`;
    (verifyJwt as jest.Mock).mockReturnValue({ sub: fakeUserId });
    (findUniqueUser as jest.Mock).mockResolvedValue({ userId: fakeUserId });

    await authenticateUser(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
