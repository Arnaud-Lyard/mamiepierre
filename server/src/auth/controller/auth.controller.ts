import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { CookieOptions, NextFunction, Request, Response } from 'express';
import {
  checkIfEmailExist,
  createUser,
  findByEmail,
  findUserByPasswordResetToken,
  findUserByVerificationCode,
  signTokens,
  switchVerificationCode,
  updateResetPasswordToken,
  updateUserPassword,
  verifyUser,
} from '../../user/service/user.service';
import AppError from '../../utils/appError';
import Email from '../../utils/email';
import {
  ForgotPasswordInput,
  LoginUserInput,
  RegisterUserInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '../schema/auth.schema';

const cookiesOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
};

if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true;

const accessTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + Number(process.env.ACCESS_TOKEN_EXPIRES_IN) * 60 * 1000
  ),
  maxAge: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) * 60 * 1000,
};

export const registerUserHandler = async (
  req: Request<{}, {}, RegisterUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const isEmailExist = await checkIfEmailExist(req.body.email);
    if (isEmailExist !== null) {
      return res.status(409).json({
        status: 'fail',
        message: 'Email already exist, please use another email address',
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const verifyCode = crypto.randomBytes(32).toString('hex');
    const verificationCode = crypto
      .createHash('sha256')
      .update(verifyCode)
      .digest('hex');

    const user = await createUser({
      username: req.body.username,
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
      verificationCode,
    });

    const redirectUrl = `${process.env.CLIENT_URL}/verify-email/${verifyCode}`;

    try {
      const mail = await new Email(user, redirectUrl).sendVerificationCode(
        req.language
      );

      await switchVerificationCode({ userId: user.id, verificationCode });

      res.status(201).json({
        status: 'success',
        message:
          req.language === 'fr'
            ? 'Un email avec un code de vérification a été envoyé à votre email'
            : 'An email with a verification code has been sent to your email',
      });
    } catch (error) {
      await switchVerificationCode({ userId: user.id, verificationCode: null });
      return res.status(500).json({
        status: 'error',
        message:
          req.language === 'fr'
            ? 'Erreur lors de l envoi de l email, veuillez réessayer.'
            : 'There was an error sending email, please try again',
      });
    }
  } catch (err: any) {
    next(err);
  }
};

export const loginUserHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await findByEmail(email.toLowerCase());

    if (!user) {
      return next(
        new AppError(
          400,
          req.language === 'fr'
            ? 'Email ou mot de passe invalide.'
            : 'Invalid email or password.'
        )
      );
    }

    // Check if user is verified
    if (!user.verified) {
      return next(
        new AppError(
          401,
          req.language === 'fr'
            ? "Votre compte n'est pas vérifié, veuillez vérifier vos e-mails pour vous connecter."
            : 'You are not verified, please verify your email to login.'
        )
      );
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(
        new AppError(
          400,
          req.language === 'fr'
            ? 'Email ou mot de passe invalide.'
            : 'Invalid email or password.'
        )
      );
    }

    // Sign Tokens
    const { access_token } = await signTokens(user);
    res.cookie('access_token', access_token, accessTokenCookieOptions);
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    res.status(200).json({
      status: 'success',
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

function logout(res: Response) {
  res.cookie('access_token', '', { maxAge: 1 });
  res.cookie('logged_in', '', { maxAge: 1 });
}

export const logoutUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logout(res);

    res.status(200).json({
      status: 'success',
    });
  } catch (err: any) {
    next(err);
  }
};

export const verifyEmailHandler = async (
  req: Request<VerifyEmailInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const verificationCode = crypto
      .createHash('sha256')
      .update(req.params.verificationCode)
      .digest('hex');

    const user = await findUserByVerificationCode(verificationCode);
    if (!user) {
      return next(
        new AppError(
          401,
          req.language === 'fr'
            ? 'Impossible de vérifier votre email.'
            : 'Could not verify email.'
        )
      );
    }
    await verifyUser(user.id);

    res.status(200).json({
      status: 'success',
      message:
        req.language === 'fr'
          ? 'Email vérifié avec succès'
          : 'Email verified successfully',
    });
  } catch (err: any) {
    next(err);
  }
};

export const forgotPasswordHandler = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    ForgotPasswordInput
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await findByEmail(req.body.email.toLowerCase());
    const message =
      req.language === 'fr'
        ? 'Nous avons envoyé un email avec un lien pour réinitialiser votre mot de passe. Veuillez vérifier votre email.'
        : 'We have sent an email with a link to reset your password. Please check your email.';
    if (!user) {
      return res.status(200).json({
        status: 'success',
        message,
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        status: 'fail',
        message:
          req.language === 'fr'
            ? "Vous ne pouvez pas réinitialiser votre mot de passe tant que votre compte n'est pas vérifié."
            : "You can't reset password until you verify your email.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await updateResetPasswordToken({
      userId: user.id,
      passwordResetToken,
      passwordResetAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
      const url = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      await new Email(user, url).sendPasswordResetToken(req.language);

      res.status(200).json({
        status: 'success',
        message,
      });
    } catch (err: any) {
      await updateResetPasswordToken({
        userId: user.id,
        passwordResetToken: null,
        passwordResetAt: null,
      });
      return res.status(500).json({
        status: 'error',
        message:
          req.language === 'fr'
            ? 'Erreur lors de l envoi de l email.'
            : 'There was an error sending email.',
      });
    }
  } catch (err: any) {
    next(err);
  }
};

export const resetPasswordHandler = async (
  req: Request<
    ResetPasswordInput['params'],
    Record<string, never>,
    ResetPasswordInput['body']
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.password !== req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message:
          req.language === 'fr'
            ? 'Les mots de passe ne correspondent pas.'
            : 'Password and confirm password does not match.',
      });
    }
    // Get the user from the collection
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await findUserByPasswordResetToken({
      passwordResetToken,
    });

    if (!user) {
      return res.status(403).json({
        status: 'fail',
        message:
          req.language === 'fr'
            ? 'Le token est invalide ou a expiré.'
            : 'The token has expired or is invalid.',
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    // Change password data
    await updateUserPassword({
      userId: user.id,
      hashedPassword,
      passwordResetToken: null,
      passwordResetAt: null,
    });

    logout(res);
    res.status(200).json({
      status: 'success',
      message:
        req.language === 'fr'
          ? 'Réinitialisation du mot de passe réussie'
          : 'Password reset successfully',
    });
  } catch (err: any) {
    next(err);
  }
};
