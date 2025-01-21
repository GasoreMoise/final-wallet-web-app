declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    // Add other environment variables you might use here
  }
}

interface Window {
  process: {
    env: NodeJS.ProcessEnv;
  };
}
