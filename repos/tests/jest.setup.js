process.env.NODE_ENV = 'test';
jest.mock('better-sqlite3', () => require('./mocks/better-sqlite3.js'));
