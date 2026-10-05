export const APP = {
  NAME: 'Online Library',
  VERSION: '1.0.0',
};

export const API = {
  PREFIX: '/api',
};

export const AUTH = {
  JWT_EXPIRES_IN: '7d',
  SALT_ROUNDS: 10,
};

export const DATABASE = {
  TABLES: {
    USERS: 'users',
    LIKES: 'likes',
    COMMENTS: 'comments',
    READING_LIST: 'reading_list',
  },
};

export const OPEN_LIBRARY = {
  BASE_URL: 'https://openlibrary.org',
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
  TIMEOUT_MS: 10000,
  RATE_LIMIT: {
    DELAY_MS: 1000,
    MAX_REQUESTS: 60,
    WINDOW_MS: 60000,
  },
};

export const HTTP = {
  STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
} as const;
