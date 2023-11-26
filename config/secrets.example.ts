// Rename this file `secrets.ts` and fill the values

export const secrets = {
  openAIAPIKey: "your openai api key",
  vectorStorePath: "path to your Faiss vector store - already existing or to be created",
  messages: [
    {
      question: "your prompt 1",
      reference: `a good answer for prompt 1`,
    },
    {
      question: "your prompt 2",
      reference: `a good answer for prompt 2`,
    },
  ],
};
