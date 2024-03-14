// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Types
import { StatusObjType } from 'src/types/apps/chatTypes'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Chat App Components Imports
import MindMapContent from 'src/views/chat/MindMap/MindMapContent'
import MindMapRight from 'src/views/chat/MindMap/MindMapRight'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

import { GetAllLLMS, ChatChatInit, ChatChatNameList, ChatChatInput, ChatChatOutput, parseMarkdown  } from 'src/functions/ChatBook'

// ** Axios Imports
import axios from 'axios'
import authConfig from 'src/configs/auth'
import { useAuth } from 'src/hooks/useAuth'

const AppChat = () => {

  // ** Hook
  const { t } = useTranslation()
  const auth = useAuth()
  
  const [refreshChatCounter, setRefreshChatCounter] = useState<number>(1)
  const [chatId, setChatId] = useState<number | string>(0)
  const [chatName, setChatName] = useState<string>("GeminiMindMap")
  const [disabledButton, setDisabledButton] = useState<boolean>(false)

  const AllLLMS: any[] = GetAllLLMS()

  useEffect(() => {
    setChatId(AllLLMS[4].id)
    setChatName(AllLLMS[4].name)
    getChatLogList(AllLLMS[4].id)
    console.log("AllLLMS", AllLLMS)
  }, [])

  const getChatLogList = async function (knowledgeId: number | string) {
    if (auth && auth.user) {
      const RS = await axios.get(authConfig.backEndApiChatBook + '/api/chatlog/' + knowledgeId + '/' + auth.user.id + '/0/90', { headers: { Authorization: auth.user.token, 'Content-Type': 'application/json'} }).then(res=>res.data)
      if(RS['data'])  {
        const ChatChatInitList = ChatChatInit(RS['data'].reverse())
        const selectedChat = {
          "chat": {
              "id": 1,
              "userId": auth.user.id,
              "unseenMsgs": 0,
              "chat": ChatChatInitList
          }
        }
        const storeInit = {
          "chats": [],
          "userProfile": {
              "id": auth.user.id,
              "avatar": "/images/avatars/1.png",
              "fullName": "Current User",
          },
          "selectedChat": selectedChat
        }
        setStore(storeInit)
      }
    }
  }

  // ** States
  const [store, setStore] = useState<any>(null)
  const [sendButtonDisable, setSendButtonDisable] = useState<boolean>(false)
  const [sendButtonLoading, setSendButtonLoading] = useState<boolean>(false)
  const [sendButtonText, setSendButtonText] = useState<string>('')
  const [sendInputText, setSendInputText] = useState<string>('')
  const [lastMessage, setLastMessage] = useState("")
  const [lastQuestion, setLastQuestion] = useState("")

  const lastChat = {
    "message": lastMessage,
    "time": String(Date.now()),
    "senderId": 999999,
    "knowledgeId": 0,
    "feedback": {
        "isSent": true,
        "isDelivered": false,
        "isSeen": false
    }
  }

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))

  useEffect(() => {
    if(auth.user && auth.user.id)   {
      const ChatChatText = window.localStorage.getItem("ChatChat")      
      const ChatChatList = ChatChatText ? JSON.parse(ChatChatText) : []
      if(lastMessage && lastMessage!="") {
        ChatChatList.push(lastChat)
        
        const lastMessageArray = parseMarkdown(lastMessage);
        setDisabledButton(false)

        const childrenOne: any[] = [];
        lastMessageArray.map((Item: any)=>{
          const childrenTwo: any[] = [];
          Item.content && Item.content.length>0 && Item.content.map((ItemContent: string)=>{
            childrenTwo.push({"topic": ItemContent,"id": Math.random().toString(16)})
          })
          childrenOne.push({
            "topic": Item.title,
            "id": Math.random().toString(16),
            "direction": 0,
            "expanded": true,
            "children": childrenTwo
          })
        })
        const generateNodes: any = {
          "nodeData": {
            "id": "root",
            "topic": lastQuestion,
            "root": true,
            "children": childrenOne,
            "expanded": true
          },
          "linkData": {}
        }
        
        console.log("Mind Map Nodes lastMessageArray", lastMessageArray);
        console.log("Mind Map Nodes lastMessage************************", lastMessage);
        console.log("Mind Map Nodes lastQuestion************************", lastQuestion);
        console.log("Mind Map Nodes generateNodes:", generateNodes)
        setData(generateNodes)
      }
      const selectedChat = {
        "chat": {
            "id": auth.user.id,
            "userId": auth.user.id,
            "unseenMsgs": 0,
            "chat": ChatChatList
        }
      }
      const storeInit = {
        "chats": [],
        "userProfile": {
            "id": auth.user.id,
            "avatar": "/images/avatars/1.png",
            "fullName": "Current User",
        },
        "selectedChat": selectedChat
      }
      setStore(storeInit)
    }
    else {
      setSendButtonDisable(true)
      setSendButtonLoading(false)
      setSendButtonText(t('Login first') as string)
      console.log("lastChat************************ Not Login");
    }
  }, [refreshChatCounter, lastMessage, auth])

  useEffect(() => {
    const ChatChatNameListData: string[] = ChatChatNameList()
    if(ChatChatNameListData.length == 0) {
      setRefreshChatCounter(refreshChatCounter + 1)
    }
    setSendButtonText(t("Send") as string)
    setSendInputText(t("Your message...") as string)    

  }, [])

  const [data, setData] = useState<any>(null);

  const sendMsg = async (Obj: any) => {
    if(auth.user && auth.user.token)  {
      setSendButtonDisable(true)
      setSendButtonLoading(true)
      setSendButtonText(t("Sending") as string)
      setSendInputText(t("Answering...") as string)
      setLastQuestion(Obj.message)
      ChatChatInput(Obj.message, auth.user.id)
      setRefreshChatCounter(refreshChatCounter + 1)
      const ChatChatOutputStatus = await ChatChatOutput(Obj.message, auth.user.token, auth.user.id, chatId, setLastMessage, Obj.template)
      if(ChatChatOutputStatus) {
        setSendButtonDisable(false)
        setSendButtonLoading(false)
        setRefreshChatCounter(refreshChatCounter + 2)
        setSendButtonText(t("Send") as string)
        setSendInputText(t("Your message...") as string)  
      }
    }
  }

  // ** Vars
  const { skin } = settings
  const mdAbove = useMediaQuery(theme.breakpoints.up('md'))
  const statusObj: StatusObjType = {
    busy: 'error',
    away: 'warning',
    online: 'success',
    offline: 'secondary'
  }

  return (
    <Fragment>
      <Box
      className='app-chat'
      sx={{
        width: '100%',
        display: 'flex',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'background.paper',
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` })
      }}
    >
        <MindMapContent
            data={data}
        />
        <MindMapRight
            store={store}
            hidden={hidden}
            sendMsg={sendMsg}
            mdAbove={mdAbove}
            statusObj={statusObj}
            sendButtonDisable={sendButtonDisable}
            sendButtonLoading={sendButtonLoading}
            sendButtonText={sendButtonText}
            sendInputText={sendInputText}
            chatId={chatId}
            chatName={chatName}
            lastQuestion={lastQuestion}
            disabledButton={disabledButton}
            setDisabledButton={setDisabledButton}
            />
      </Box>
    </Fragment>
  )
}

AppChat.contentHeightFixed = true

export default AppChat