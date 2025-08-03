// We cannot employ vitest because tests must call require() dynamically.
const config = {
  testEnvironment: 'node',
};
export default config;
