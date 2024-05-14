import crypto from 'crypto';
import { OpenAI } from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { connect } from "vectordb";
import { OpenAIEmbeddingFunction } from 'vectordb';
import { load, type Element } from 'cheerio';

import { Message as VercelChatMessage, StreamingTextResponse } from 'ai'
import { BytesOutputParser, StringOutputParser } from '@langchain/core/output_parsers';

import { DataDir } from './const';
import { db, getDbRecord, getDbRecordALL } from './db'

import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ''

export interface Entry {
    [x: string]: any
    link: string
    title: string;
    text: string
}

export interface EntryWithContext {
    [x: string]: any
    link: string
    title: string
    text: string
    context: string
}

export async function createEmbeddingsFromList(data: EntryWithContext[], datasetId: string) {
  const lance_db = await connect(DataDir + '/LanceDb/');

  const embedFunction = new OpenAIEmbeddingFunction('context', OPENAI_API_KEY)

  const allTableExistsList: string[] = await lance_db.tableNames()
  console.log("createEmbeddingsFromList allTableExistsList", allTableExistsList)

  if(allTableExistsList.includes(`website-${datasetId}`))  {
    await lance_db.dropTable(`website-${datasetId}`);
    //console.log("createEmbeddingsFromList dropTable ------------", `website-${datasetId}`)
  }
  const tableData = await lance_db.createTable(`website-${datasetId}`, data, embedFunction)
  console.log("createEmbeddingsFromList tableData", tableData)
  
  console.log('createEmbeddingsFromList Vectors inserted: ', data.length, Array.isArray(data))

  return tableData?.name
}

export async function createEmbeddingsTable(WebsiteUrlList: string[], datasetId: string, _id: string) {
    const lance_db = await connect(DataDir + '/LanceDb/datasetId_' + datasetId + "/" + _id);
  
    const embedFunction = new OpenAIEmbeddingFunction('context', OPENAI_API_KEY)
    const data = contextualize(await getWebsiteUrlContent(WebsiteUrlList), 1, 'link')
    const batchSize = 1;
  
    //console.log("contextualize data", data.slice(0, Math.min(batchSize, data.length)))
    const allTableExistsList: string[] = await lance_db.tableNames()
    console.log("tableNamesData", allTableExistsList)

    //const tableData = allTableExistsList.includes(`website-${_id}`) ? ( await lance_db.openTable(`website-${_id}`, embedFunction) ) : ( await lance_db.createTable(`website-${_id}`, [data[0]], embedFunction) )
    //await lance_db.dropTable(`website-${_id}`);
    const tableData = await lance_db.createTable(`website-${_id}`, data, embedFunction)
    console.log("tableData", tableData)
    
    for (var i = batchSize; i < data.length; i += batchSize) {
      await tableData.add(data.slice(i, Math.min(i + batchSize, data.length)))
      console.log("batchSize i", i)
    }
  
    console.log('Vectors inserted: ', data.length, Array.isArray(data))
  
    return {name: tableData.name, data}
}
  
// Each article line has a small text column, we include previous lines in order to
// have more context information when creating embeddings
export function contextualize(rows: Entry[], contextSize: number, groupColumn: string): EntryWithContext[] {
    const grouped: { [key: string]: any } = []
  
    rows.forEach(row => {
      if (!grouped[row[groupColumn]]) {
        grouped[row[groupColumn]] = []
      }
      
      grouped[row[groupColumn]].push(row)
    })
  
    const data: EntryWithContext[] = []
  
    Object.keys(grouped).forEach(key => {
      for (let i = 0; i < grouped[key].length; i++) {
        const start = i - contextSize > 0 ? i - contextSize : 0
        grouped[key][i].context = grouped[key].slice(start, i + 1).map((r: Entry) => r.text).join(' ')
      }
  
      data.push(...grouped[key])
    })
  
    return data
}

export async function getWebsiteUrlContent(links: string[]): Promise<Entry[]> {
    let allEntries: Entry[] = [];

    for (const link of links) {
        console.log('Scraping: ', link);

        try {
            const response = await fetch(link, {
            });

            const html = await response.text()

            const $ = load(html);

            const contentArray: string[] = [];

            $('p').each((index: number, element: Element) => {
                contentArray.push($(element).text().trim());
            });
            //console.log("contentArray", contentArray)

            const title = $('title').text().trim()
            //console.log("title", title)

            const content = contentArray
                .join('\n')
                .split('\n')
                .filter(line => line.length > 0)
                .map(line => ({ link: link, title, text: line }));

            //console.log('Content:', content)

            allEntries = allEntries.concat(content);

            //console.log('allEntries:', allEntries)

        } catch (error) {
            console.error(`Error processing ${link}:`, error);
        }
    }

    return allEntries;
}

export async function getWebsiteUrlContext(links: string[]): Promise<Entry[]> {
  const data = contextualize(await getWebsiteUrlContent(links), 1, 'link')
  return data
}


//检索数据

const REPHRASE_TEMPLATE = `Rephrase the follow-up question to make it a standalone inquiry, maintaining its original language. You'll be provided with a conversation history and a follow-up question.

Instructions:
1. Review the conversation provided below, including both user and AI messages.
2. Examine the follow-up question included in the conversation.
3. Reconstruct the follow-up question to be self-contained, without requiring context from the previous conversation. Ensure it remains in the same language as the original.

Conversation:
###
{chatHistory}
###

User's Follow-Up Question:
### 
{input}
###

Your Response:`

const QA_TEMPLATE = `Based on the information provided below from a website, act as a guide to assist someone navigating through the website.

Instructions:
1. Review the conversation history and the contextual information extracted from the website.
2. Assume the role of a helpful agent and respond to the user's input accordingly.
3. Provide guidance, explanations, or assistance as needed, leveraging the website context to enhance your responses.

Conversation History:
###
{chatHistory}
###

Context from Website:
###
{context}
###

User's Input: 
###
{input}
###

Your Response:`


function formatMessage(message: VercelChatMessage) {
    return `${message.role}: ${message.content}`;
};

async function rephraseInput(model: ChatOpenAI, chatHistory: string[], input: string) {
    if (chatHistory.length === 0) return input;

    const rephrasePrompt = PromptTemplate.fromTemplate(REPHRASE_TEMPLATE);

    const stringOutputParser = new StringOutputParser();

    const rephraseChain = rephrasePrompt.pipe(model).pipe(stringOutputParser)

    return rephraseChain.invoke({
        chatHistory: chatHistory.join('\n'),
        input,
    });
}

async function retrieveContext(query: string, table: string, k = 3): Promise<EntryWithContext[]> {
    const db = await connect(DataDir + '/LanceDb/')
    
    const embedFunction = new OpenAIEmbeddingFunction('context', OPENAI_API_KEY)
    
    const tbl = await db.openTable(table, embedFunction)
    
    //console.log('Query: ', query)
    
    return await tbl
      .search(query)
      .select(['link', 'title', 'text', 'context'])
      .limit(k)
      .execute() as EntryWithContext[]
}

export async function ChatDatasetId(messages: any[], datasetId: string) {

    const model = new ChatOpenAI({
        modelName: "gpt-3.5-turbo",
        temperature : Number(0.1),
        openAIApiKey: OPENAI_API_KEY,
        streaming: true,
    });

    const maxDocs = 3

    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    
    const currentMessageContent = messages[messages.length - 1].content;

    //console.log("Current message:", currentMessageContent)

    const rephrasedInput = await rephraseInput(model, formattedPreviousMessages, currentMessageContent);

    const context = await (async () => {
        const result = await retrieveContext(rephrasedInput, datasetId, maxDocs)
        //console.log("result:", result, "\n")
        return result.map(c => {
            if (c.title) return `${c.title}\n${c.context}`
            return c.context
        }).join('\n\n---\n\n').substring(0, 3750) // need to make sure our prompt is not larger than max size
    })()
    //console.log("Context:", context)

    // Chat models stream message chunks rather than bytes, so this
    // output parser handles serialization and encoding.
    
    const rephrasePrompt = PromptTemplate.fromTemplate(QA_TEMPLATE);
    const stringOutputParser = new StringOutputParser();
    const rephraseChain = rephrasePrompt.pipe(model).pipe(stringOutputParser)
    return rephraseChain.invoke({
        chatHistory: formattedPreviousMessages.join('\n'),
        context, 
        input: rephrasedInput,
    });

    /*
    const qaPrompt = PromptTemplate.fromTemplate(QA_TEMPLATE);
    const outputParser = new BytesOutputParser();
    const qaChain = qaPrompt.pipe(model).pipe(outputParser);
    //console.log("qaChain:", qaChain, "\n")
    const stream = await qaChain.stream({
        chatHistory: formattedPreviousMessages.join('\n'),
        context, 
        input: rephrasedInput,
    });
    return new StreamingTextResponse(stream)
    //以上代码可以在Nextjs中实现流式输出,如果要更换为Node Express中,要如何实现流式输出
    */
    /*
    const qaPrompt = PromptTemplate.fromTemplate(QA_TEMPLATE);
    const outputParser = new BytesOutputParser();
    const qaChain = qaPrompt.pipe(model).pipe(outputParser);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const stream = await qaChain.stream({
        chatHistory: formattedPreviousMessages.join('\n'),
        context, 
        input: rephrasedInput,
    });

    stream.on('data', (chunk) => {
        res.write(chunk);
    });

    stream.on('end', () => {
        res.end();
    });

    stream.on('error', (err) => {
        console.error(err);
        res.status(500).end('An error occurred');
    });
    */
}