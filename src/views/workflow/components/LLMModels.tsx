import { useState, useEffect, memo, Fragment } from 'react'

import axios from 'axios'
import authConfig from 'src/configs/auth'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import { CheckPermission } from 'src/functions/ChatBook'
import { useTranslation } from 'react-i18next'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Slider from '@mui/material/Slider'

import Divider from '@mui/material/Divider'
import toast from 'react-hot-toast'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

import { llms } from 'src/functions/llms'

import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close';


const LLMModels = (props: any) => {
    // ** Props
    const {TTSOpen, handleTTSClose, item, TTSValue, setTTSValue, TTSSpeed, setTTSSpeed } = props

    // ** Hook
    const { t } = useTranslation()
    const auth = useAuth()
    const router = useRouter()
    useEffect(() => {
        CheckPermission(auth, router, false)
    }, [])

    return (
        <Dialog maxWidth='xs' fullWidth open={TTSOpen} onClose={handleTTSClose}>
            <DialogTitle>
                <Box display="flex" alignItems="center">
                <Avatar src={'/icons/core/app/simpleMode/tts.svg'} variant="rounded" sx={{ width: '25px', height: '25px', pl: 1}} />
                <Typography sx={{pl: 2}}>{t(item.label) as string}</Typography>
                <Box position={'absolute'} right={'5px'} top={'1px'}>
                    <IconButton size="small" edge="end" onClick={handleTTSClose} aria-label="close">
                    <CloseIcon />
                    </IconButton>
                </Box>
                </Box>
            </DialogTitle>
            <DialogContent sx={{  }}>
                <Grid item xs={12}>
                <FormControl sx={{ mt: 4, mr: 4 }}>
                    <InputLabel id='demo-dialog-select-label'>{t("TTSModel")}</InputLabel>
                    <Select 
                    size="small" 
                    label={t("Tts")}
                    labelId='demo-dialog-select-label' 
                    id='demo-dialog-select' 
                    defaultValue={TTSValue} 
                    value={TTSValue}
                    fullWidth
                    onChange={(e: any) => {
                        if(e.target.value) {
                        setTTSValue(e.target.value as string)
                        }
                    }}
                    >
                    <MenuItem value={"Disabled"}>{t("Disabled")}</MenuItem>
                    <MenuItem value={"AudioBrowser"}>{t("AudioBrowser")}</MenuItem>
                    {llms && llms.audioSpeechModels && llms.audioSpeechModels[0] && llms.audioSpeechModels[0].voices && llms.audioSpeechModels[0].voices.map((item: any, index: number)=>{
                        return <MenuItem value={item.value} key={`voices_${index}`}>{item.label}</MenuItem>
                    })}
                    </Select>
                </FormControl>
                </Grid>
                <Grid item xs={11.8} pt={8}>
                <Typography sx={{ fontWeight: 500 }}>{t("TTSSpeed")}</Typography>
                <Slider
                size="small"
                min={0.3}
                max={2}
                step={0.1}
                onChange={(e: any) => {
                    if(e.target.value) {
                    setTTSSpeed(Number(e.target.value as string))
                    }
                }}
                value={TTSSpeed}
                valueLabelDisplay='on'
                aria-labelledby="custom-marks-slider"
                marks={[
                    {
                    value: 0.3,
                    label: '0.3'
                    },
                    {
                    value: 2,
                    label: '2'
                    }
                    ]}
                />
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button size="small" variant='contained' startIcon={<Icon icon='arcticons:ds-audio' />}>
                {t("TrialListening")}
                </Button>
                <Button size="small" variant='outlined' onClick={handleTTSClose}>
                {t("Comfirm")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default memo(LLMModels);
