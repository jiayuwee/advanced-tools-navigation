declare global {
  interface Window {
    addAdditionalTools: () => Promise<any[]>;
  }
}

export {};