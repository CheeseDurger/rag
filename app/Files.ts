import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { Document } from "langchain/document";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export class Files {

  /**
   * Constructor
   * 
   * @param path - path of the directory holding the files
   */
  constructor(public readonly path: string) {};

  /**
   * Get an array of chunks from the documents in the directory
   * @returns array of chunks
   */
  public async getContent(): Promise<Document[]> {
    
    const directoryLoader = new DirectoryLoader(
      this.path,
      {
        ".pdf": (path: string) => new PDFLoader(path, { splitPages: false }),
      }
    );
    
    const logger = console.log;
    console.log = () => {};
    const docs = await directoryLoader.load();
    console.log = logger;
    
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,
      chunkOverlap: 1500,
    });
    
    const splitDocs = await textSplitter.splitDocuments(docs);

    return splitDocs;
  };

};
