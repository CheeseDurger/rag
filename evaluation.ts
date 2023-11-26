import { loadEvaluator } from "langchain/evaluation";
import { RAG } from "./app/RAG";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { secrets } from "./config/secrets";

async function evaluate() {

  const rag: RAG = await new RAG("data").init();
  const evaluator = await loadEvaluator("labeled_criteria", {
    criteria: "correctness",
    llm: new ChatOpenAI({ openAIApiKey: secrets.openAIAPIKey }),
  });


  const answers: string[] = await rag.complete(secrets.messages.map( message => message.question));

  const evaluations = [];

  for (let i = 0; i < secrets.messages.length; i++) {
    evaluations.push(await evaluator.evaluateStrings({
      input: secrets.messages[i].question,
      prediction: answers[i],
      reference: secrets.messages[i].reference
    }));
    const evaluation = evaluations[i].value.slice(-1);
    console.log("### Question :\n", secrets.messages[i].question);
    console.log("### Réponse :\n", answers[i]);
    const log: string = evaluation === "Y" ? "\x1b[42m ✔ " + evaluation + " \x1b[0m" : "\x1b[41m ❌ " + evaluation + " \x1b[0m";
    console.log("### Evaluation :", log);
    console.log("\n");
  }

}

evaluate();
