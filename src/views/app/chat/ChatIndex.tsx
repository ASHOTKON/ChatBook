// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import toast from 'react-hot-toast'
import { getNanoid } from 'src/functions/app/string.tools';

// ** Types
import { StatusObjType } from 'src/types/apps/chatTypes'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Chat App Components Imports
import ChatContent from 'src/views/app/chat/ChatContent'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

import { ChatChatList, ChatChatInit, ChatChatNameList, ChatChatInput, ChatAiOutputV1, DeleteChatChat, DeleteChatChatHistory, DeleteChatChatByChatlogId, DeleteChatChatHistoryByChatlogId  } from 'src/functions/ChatBook'

// ** Axios Imports
import axios from 'axios'
import authConfig from 'src/configs/auth'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import { CheckPermission } from 'src/functions/ChatBook'

const AppChat = (props: any) => {
  // ** Hook
  const { t } = useTranslation()
  const auth = useAuth()
  const router = useRouter()
  const { app } = props

  const [refreshChatCounter, setRefreshChatCounter] = useState<number>(1)
  const [chatId, setChatId] = useState<number | string>(-1)
  const [chatName, setChatName] = useState<string>("")
  const [historyCounter, setHistoryCounter] = useState<number>(0)

  useEffect(() => {
    CheckPermission(auth, router, false)
  }, [])

  useEffect(() => {
    if(app._id) {
        setChatId('ChatApp')
        setChatName('ChatApp')
        const WelcomeText = GetWelcomeTextFromApp(app)
        console.log("WelcomeText", WelcomeText)
        getChatLogList(app._id, WelcomeText)
    }
  }, [app])

  const getChatLogList = async function (appId: string, appTemplate: string) {
    if (auth && auth.user) {
      const RS = await axios.get(authConfig.backEndApiChatBook + '/api/app/chatlog/' + appId + '/0/90', { headers: { Authorization: auth.user.token, 'Content-Type': 'application/json'} }).then(res=>res.data)
      if(RS['data'])  {
        const ChatChatInitList = ChatChatInit(RS['data'].reverse(), appTemplate)
        setHistoryCounter(ChatChatInitList.length)
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

  const ClearButtonClick = async function () {
    if (auth && auth.user && app && app.id) {
      DeleteChatChat()
      const selectedChat = {
        "chat": {
            "id": auth.user.id,
            "userId": auth.user.id,
            "unseenMsgs": 0,
            "chat": []
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
      DeleteChatChatHistory(auth.user.id, chatId, app.id)
      const data: any = {appId: app._id}
      await axios.post(authConfig.backEndApiChatBook + '/api/app/chatlog/clear/', data, { headers: { Authorization: auth.user.token, 'Content-Type': 'application/json'} }).then(res=>res.data)
      setHistoryCounter(0)
    }
  }

  const handleDeleteOneChatLogById = async function (chatlogId: string) {
    if (auth && auth.user && app && app._id) {
      DeleteChatChatByChatlogId(chatlogId)
      DeleteChatChatHistoryByChatlogId(auth.user.id, chatId, app.id, chatlogId)
      const data: any = {chatlogId: chatlogId, appId: app._id}
      const RS = await axios.post(authConfig.backEndApiChatBook + '/api/app/chatlog/delete', data, { headers: { Authorization: auth.user.token, 'Content-Type': 'application/json'} }).then(res=>res.data)
      if(RS && RS.status == 'ok') { 
        setRefreshChatCounter(refreshChatCounter + 1)
        toast.success(t(RS.msg) as string, { duration: 2500 })
      }
      else {
        toast.error(t(RS.msg) as string, { duration: 2500 })
      }
    }
  }
  
  // ** States
  const [store, setStore] = useState<any>(null)
  const [sendButtonDisable, setSendButtonDisable] = useState<boolean>(false)
  const [sendButtonLoading, setSendButtonLoading] = useState<boolean>(false)
  const [sendButtonText, setSendButtonText] = useState<string>('')
  const [sendInputText, setSendInputText] = useState<string>('')
  const [processingMessage, setProcessingMessage] = useState("")
  const [finishedMessage, setFinishedMessage] = useState("")
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [GetSystemPromptFromAppValue, setGetSystemPromptFromAppValue] = useState<string>("");
  
  const lastChat = {
    "message": processingMessage,
    "time": Date.now(),
    "senderId": 999999,
    "responseTime": responseTime,
    "history": [],
    "feedback": {
        "isSent": true,
        "isDelivered": false,
        "isSeen": false
    }
  }

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const hidden = false

  useEffect(() => {
    if(auth.user && auth.user.id)   {
      const ChatChatListValue = ChatChatList()
      const ShowData = processingMessage && processingMessage!="" ? processingMessage : finishedMessage
      if(processingMessage && processingMessage!="") {
        
        //流式输出的时候,进来显示
        ChatChatListValue.push(lastChat)
      }
      const selectedChat = {
        "chat": {
            "id": auth.user.id,
            "userId": auth.user.id,
            "unseenMsgs": 0,
            "chat": ChatChatListValue
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
      setHistoryCounter(ChatChatListValue.length)
    }
    else {
      setSendButtonDisable(true)
      setSendButtonLoading(false)
      setSendButtonText(t('Login first') as string)
    }
  }, [refreshChatCounter, processingMessage, auth])

  useEffect(() => {
    const ChatChatNameListData: string[] = ChatChatNameList()
    if(ChatChatNameListData.length == 0) {
      setRefreshChatCounter(refreshChatCounter + 1)
    }
    setSendButtonText(t("Send") as string)
    setSendInputText(t("Your message...") as string)    
    const GetSystemPromptFromAppValueTemp = GetSystemPromptFromApp(app)
    setGetSystemPromptFromAppValue(GetSystemPromptFromAppValueTemp)
  }, [])

  const GetSystemPromptFromApp = (app: any) => {
    const AiNode = app.modules.filter((item: any)=>item.type == 'chatNode')
    if(AiNode && AiNode[0] && AiNode[0].data && AiNode[0].data.inputs) {
      const systemPromptList = AiNode[0].data.inputs.filter((itemNode: any)=>itemNode.key == 'systemPrompt')
      if(systemPromptList && systemPromptList[0] && systemPromptList[0]['value']) {
        const systemPromptText = systemPromptList[0]['value']
        return systemPromptText
      }
    }
    return ''
  }

  const GetWelcomeTextFromApp = (app: any) => {
    const AiNode = app.modules.filter((item: any)=>item.type == 'userGuide')
    if(AiNode && AiNode[0] && AiNode[0].data && AiNode[0].data.inputs) {
      console.log("WelcomeText", AiNode)
      const systemPromptList = AiNode[0].data.inputs.filter((itemNode: any)=>itemNode.key == 'welcomeText')
      if(systemPromptList && systemPromptList[0] && systemPromptList[0]['value']) {
        const systemPromptText = systemPromptList[0]['value']
        return systemPromptText
      }
    }
    return ''
  }


  const sendMsg = async (Obj: any) => {
    if(auth.user && auth.user.token && app && app.id)  {
      setSendButtonDisable(true)
      setSendButtonLoading(true)
      setSendButtonText(t("Sending") as string)
      setSendInputText(t("Answering...") as string)
      const _id = getNanoid(32)
      ChatChatInput(_id, Obj.send, Obj.message, auth.user.id, 0, [])
      setRefreshChatCounter(refreshChatCounter + 1)
      const startTime = performance.now()
      const ChatAiOutputV1Status = await ChatAiOutputV1(_id, Obj.message, auth.user.token, auth.user.id, chatId, app.id, setProcessingMessage, GetSystemPromptFromAppValue, setFinishedMessage)
      const endTime = performance.now();
      setResponseTime(endTime - startTime);
      if(ChatAiOutputV1Status) {
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
      <ChatContent
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
        email={auth?.user?.email}
        ClearButtonClick={ClearButtonClick}
        ClearButtonName={t('Clear')}
        historyCounter={historyCounter}
        app={app}
        GetSystemPromptFromAppValue={GetSystemPromptFromAppValue}
        handleDeleteOneChatLogById={handleDeleteOneChatLogById}
      />
      </Box>
    </Fragment>
  )
}

export default AppChat