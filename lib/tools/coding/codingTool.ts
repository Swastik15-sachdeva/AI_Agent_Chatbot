export const codingTool = {
  name: 'write_code',
  description: 'Write or format code blocks for the user.',
  execute: async (args: { language: string; code: string; explanation: string }) => {
    return {
      success: true,
      language: args.language,
      code: args.code,
      explanation: args.explanation
    };
  }
};
