// ** React Imports
import { Fragment, useState, useEffect } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'

// ** Axios Imports
import axios from 'axios'
import authConfig from 'src/configs/auth'
import { useRouter } from 'next/router'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import toast from 'react-hot-toast'

// ** Third Party Import
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'
import { CheckPermission } from 'src/functions/ChatBook'


const SettingForm = (props: any) => {
  // ** Props
  const { knowledgeId, knowledgeName, userId } = props
  
  // ** Hook
  const { t } = useTranslation()
  const auth = useAuth()
  const router = useRouter()
  useEffect(() => {
    CheckPermission(auth, router, false)
  }, [])

  const openApiBaseText = "Example: https://api.openai.com/v1";
    
  // ** State
  const [uploadingButton, setUploadingButton] = useState<string>(`${t('Submit')}`)
  const [isDisabledButton, setIsDisabledButton] = useState<boolean>(false)
  
  const [openApiBase, setOpenApiBase] = useState<string>("")
  const [openApiBaseError, setOpenApiBaseError] = useState<string | null>(null)
  const handleopenApiBaseChange = (event: any) => {
    setOpenApiBase(event.target.value);
    setOpenApiBaseError("")
  };

  const [openApiKey, setOpenApiKey] = useState<string>("")
  const [openApiKeyError, setOpenApiKeyError] = useState<string | null>(null)
  const handleOpenApiKeyChange = (event: any) => {
    setOpenApiKey(event.target.value);
    if(event.target.value == "") {
        setOpenApiKeyError(`${t('This field cannot be empty')}`)
    }
    else {
        setOpenApiKeyError("")
    }
  };
  
  const [inputTemperature, setInputTemperature] = useState<number>(0.5)
  const [inputTemperatureError, setInputTemperatureError] = useState<string | null>(null)
  const handleInputTemperatureChange = (event: any) => {
    setInputTemperature(Number(event.target.value));
    if(Number(event.target.value) < 0) {
        setInputTemperatureError(`${t('The number entered must be more greater or equal to 0')}`)
    }
    else if(Number(event.target.value) >= 1) {
        setInputTemperatureError(`${t('The number entered must be less than or equal to 1')}`)
    }
    else {
        setInputTemperatureError("")
    }
  };

  const [inputModelName, setInputModelName] = useState<string>("gpt-3.5-turbo")
  const [inputModelNameError, setInputModelNameError] = useState<string | null>(null)
  const handleInputModelNameChange = (event: any) => {
    setInputModelName(event.target.value);
    if(event.target.value == "") {
        setInputModelNameError(`${t('This field cannot be empty')}`)
    }
    else {
        setInputModelNameError("")
    }
  };

  const handleGetData = async () => {
    if(auth.user)   {
        const GetData: any = await axios.get(authConfig.backEndApiChatBook + '/api/getopenai/' + knowledgeId, { headers: { Authorization: auth.user.token, 'Content-Type': 'application/json'} }).then(res => res.data)
        console.log("GetData:", GetData)
        setOpenApiBase(GetData?.OPENAI_API_BASE ?? '')
        setOpenApiKey(GetData?.OPENAI_API_KEY ?? '')
        setInputTemperature(GetData.Temperature ?? '0')
        setInputModelName(GetData.ModelName || 'gpt-3.5-turbo')
    }
  }

  useEffect(()=>{
    handleGetData()
  }, [knowledgeId])
  
  const handleSubmit = async () => {
    if(openApiKey == "") {
        toast.error(t("Open AI Api cannot be empty") as string, { duration: 4000 })
        setIsDisabledButton(false)
        setUploadingButton(`${t('Submit')}`)

        return
    }
    if(inputModelName == "") {
        toast.error(t("Model Name Api cannot be empty") as string, { duration: 4000 })
        setIsDisabledButton(false)
        setUploadingButton(`${t('Submit')}`)

        return
    }
    if(inputTemperature < 0 || inputTemperature > 1) {
        toast.error(t("Temperature must in the range 0~1") as string, { duration: 4000 })
        setIsDisabledButton(false)
        setUploadingButton(`${t('Submit')}`)

        return
    }

    if(auth.user)   {
        const PostParams = {OPENAI_API_BASE: openApiBase, OPENAI_API_KEY: openApiKey, ModelName: inputModelName, Temperature: inputTemperature, userId: userId, knowledgeId: knowledgeId }
        const FormSubmit: any = await axios.post(authConfig.backEndApiChatBook + '/api/setopenai', PostParams, { headers: { Authorization: auth.user.token, 'Content-Type': 'application/json'} }).then(res => res.data)
        console.log("FormSubmit:", FormSubmit)
        if(FormSubmit?.status == "ok") {
            toast.success(t(FormSubmit.msg) as string, { duration: 4000 })
        }
        else {
            toast.error(t(FormSubmit.msg) as string, { duration: 4000 })
            
            if(FormSubmit && FormSubmit.msg=='Token is invalid') {
                CheckPermission(auth, router, true)
            }
        }
    }

  }

  return (
    <Fragment>
        {auth.user && auth.user.email ?
        <Card>
        <CardHeader title={`${knowledgeName}`} />
        <CardContent>
            <Grid container spacing={5}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label={`${t('OPENAI_API_BASE')}`}
                        placeholder={`${t('OPENAI_API_BASE')}`}
                        value={openApiBase}
                        onChange={handleopenApiBaseChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                <Icon icon='mdi:account-outline' />
                                </InputAdornment>
                            )
                        }}
                        error={!!openApiBaseError}
                        helperText={openApiBaseText}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label={`${t('OPENAI_API_KEY')}`}
                        placeholder={`${t('OPENAI_API_KEY')}`}
                        value={openApiKey}
                        onChange={handleOpenApiKeyChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                <Icon icon='mdi:account-outline' />
                                </InputAdornment>
                            )
                        }}
                        error={!!openApiKeyError}
                        helperText={openApiKeyError}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        type='number'
                        label={`${t('Temperature')}`}
                        placeholder={`${t('Temperature')}`}
                        value={inputTemperature}
                        onChange={handleInputTemperatureChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                <Icon icon='mdi:account-outline' />
                                </InputAdornment>
                            )
                        }}
                        error={!!inputTemperatureError}
                        helperText={inputTemperatureError}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label={`${t('ModelName')}`}
                        placeholder={`${t('ModelName')}`}
                        value={inputModelName}
                        onChange={handleInputModelNameChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                <Icon icon='mdi:account-outline' />
                                </InputAdornment>
                            )
                        }}
                        error={!!inputModelNameError}
                        helperText={inputModelNameError}
                    />
                </Grid>

                <Grid item xs={12} container justifyContent="flex-end">
                    <Button type='submit' variant='contained' size='large' onClick={handleSubmit} disabled={isDisabledButton} >
                        {uploadingButton}
                    </Button>
                </Grid>
            </Grid>
        </CardContent>
        </Card>
        :
        null
        }        
    </Fragment>
  )
}


export default SettingForm
