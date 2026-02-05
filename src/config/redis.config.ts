export const redisConfig = {
  constants: {
    ACCESS_TOKENS: 'access_tokens',

    REFRESH_TOKEN: 'ref_',
    USER_REFRESH_TOKENS: 'user_refresh_tokens_',

    REFRESH_TOKEN_DURATION: 60 * 60 * 24 * 365,
    REFRESH_TOKEN_LENGTH: 96,

    RESET_TOKEN_DURATION: 60 * 15,
    RESET_USER_PREFIX: 'reset_user_',
    RESET_TOKEN_PREFIX: 'reset_',
    RESET_ATTEMPT_PREFIX: 'reset_attempts_',

    RESET_COOLDOWN: 60 * 1,
    RESET_ATTEMPT_LIMIT: 5,
    RESET_ATTEMPT_WINDOW: 60 * 60,

    RESEND_VERIFY_ATTEMPT_PREFIX: 'resend_verify_',
    FAILED_ATTEMPT_PREFIX: 'failed_attempts_',

    LOCKOUT_DURATION: 24 * 60 * 60,
    FAILED_ATTEMPT_LIMIT: 5,

    VERIFY_TOKEN: 'verify_',
    VERIFY_TOKEN_DURATION: 60 * 15,
    VERIFY_TOKEN_LENGTH: 96,

    DAILY_TX_LIMIT_PREFIX: 'limit_',
    BLACKLIST_PREFIX: 'blacklist_',
  },

  prefix: {
    refreshToken: (token: string) => `ref_${token}`,
    userRefreshTokens: (userId: string) => `user_refresh_tokens_${userId}`,
    resetToken: (tokenHash: string) => `reset_${tokenHash}`,
    resetAttempt: (email: string) => `reset_attempts_${email.toLowerCase()}`,
    resetCooldown: (userId: string) => `reset_user_${userId}`,
    resendVerifyAttempt: (email: string) =>
      `resend_verify_${email.toLowerCase()}`,
    resetUser: (email: string) => `reset_user_${email.toLowerCase()}`,
    failedAttempt: (email: string) => `failed_attempts_${email.toLowerCase()}`,
    verifyToken: (token: string) => `verify_${token}`,
    dailyTxLimit: (userId: string) => `limit_${userId}`,
    blacklist: (token: string) => `blacklist_${token}`,
  },

  func: {
    refExpInDays: () => `${(365).toFixed(0)}d`,
    resetExpInMins: () => `15 minutes`,
    verifyExpInMins: () => `15 minutes`,
    getLockoutDuration: () => `24 hours`,
  },
};
