// We cannot employ vitest because test must call require() dynamically.
const config = {
  testEnvironment: 'node',
};
export default config;
