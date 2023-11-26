import { VectorStoreRetriever } from "langchain/vectorstores/base";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { formatDocumentsAsString } from "langchain/util/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PromptTemplate } from "langchain/prompts";
import { RunnableSequence, RunnablePassthrough } from "langchain/schema/runnable";
import { StringOutputParser } from "langchain/schema/output_parser";
import { FaissStore } from "langchain/vectorstores/faiss";

import { secrets } from "../config/secrets";
import { Files } from "./Files";


export class RAG {
  private readonly path: string;
  private readonly model: ChatOpenAI;
  private retriever: VectorStoreRetriever | undefined = undefined;

  /**
   * @warning Method `init()` should always be called after the `constructor()`
   * @param path - path to the pdf files to embed
   */
  constructor(path: string) {
    this.path = path;
    this.model = new ChatOpenAI({ openAIApiKey: secrets.openAIAPIKey });
  };

  /**
   * Set the remaining async configurations
   * @returns this
   */
  public async init(): Promise<RAG> {
    
    let vectorStore: FaissStore;
    try {
      vectorStore = await FaissStore.load(secrets.vectorStorePath, new OpenAIEmbeddings({ openAIApiKey: secrets.openAIAPIKey }));
    } catch (error) {
      const docs = await new Files(this.path).getContent();
      vectorStore = await FaissStore.fromDocuments(docs, new OpenAIEmbeddings({ openAIApiKey: secrets.openAIAPIKey }));
      await vectorStore.save(secrets.vectorStorePath);
    }

    this.retriever = vectorStore.asRetriever(4);
    return this;
  };

  /**
   * Get LLM completions from an array of questions
   * @param questions array of questions
   */
  public async complete(questions: string[]): Promise<string[]> {

    // Guard clause: class must be init
    if (!this.retriever) {
      console.error("ERROR: class RAG must be init");
      throw new Error("ERROR: class RAG must be init");
    }

    const prompt =
      PromptTemplate.fromTemplate(`Répond à la question suivante en te basant seulement sur ce contexte :
    {context}
    
    Question : {question}`);

    const chain = RunnableSequence.from([
      {
        context: this.retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      this.model,
      new StringOutputParser(),
    ]);

    return await Promise.all(questions.map(async (question) => {
      return await chain.invoke(question);
    }));

  };

};
