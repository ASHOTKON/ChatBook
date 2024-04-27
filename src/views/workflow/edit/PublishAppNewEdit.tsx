import { useEffect, memo } from 'react'

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
import Avatar from '@mui/material/Avatar'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import Slider from '@mui/material/Slider'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'

import { llms } from 'src/functions/llms'

import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close';

const PublishAppNewEdit = (props: any) => {
    // ** Props
    const {pageData, setPageData, handleSubmit } = props

    // ** Hook
    const { t } = useTranslation()
    const auth = useAuth()
    const router = useRouter()
    useEffect(() => {
        CheckPermission(auth, router, false)
    }, [auth, router])


    return (
        <Dialog fullWidth open={pageData.open} onClose={
            () => { setPageData( (prevState: any) => ({ ...prevState, open: false }) ) }
        }>
            <DialogTitle>
                <Box display="flex" alignItems="center">
                <Avatar src={'/imgs/modal/shareFill.svg'} variant="rounded" sx={{ width: '25px', height: '25px', pl: 1}} />
                <Typography sx={{pl: 2}}>{t("Create Link") as string}</Typography>
                <Box position={'absolute'} right={'5px'} top={'1px'}>
                    <IconButton size="small" edge="end" onClick={
                        () => { setPageData( (prevState: any) => ({ ...prevState, open: false }) ) }
                    } aria-label="close">
                    <CloseIcon />
                    </IconButton>
                </Box>
                </Box>
            </DialogTitle>
            <DialogContent sx={{  }}>
                <Grid item xs={12}>
                    <Grid container alignItems="center">
                        <Grid item xs={4}>
                            <InputLabel id='demo-dialog-select-label'>{t("Name")}</InputLabel>
                        </Grid>
                        <Grid item xs={8} sx={{pt: 6, pl: 2}}>
                            <TextField
                                size="small"
                                value={pageData.name}
                                sx={{ width: '100%', resize: 'both', '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                                placeholder={t(pageData.placeholder) as string}
                                onChange={(e: any) => {
                                  setPageData( (prevState: any) => ({ ...prevState, name: e.target.value }) )
                                }}
                              />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container alignItems="center">
                        <Grid item xs={4}>
                            <InputLabel id='demo-dialog-select-label'>{t("maxToken")}</InputLabel>
                        </Grid>
                        <Grid item xs={8} sx={{pt: 6, pl: 2}}>
                            <TextField
                                type="number"
                                size="small"
                                inputProps={{ min: 0, max: 160000 }} 
                                value={pageData.maxToken}
                                sx={{ width: '100%', resize: 'both', '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                                placeholder={t(pageData.placeholder) as string}
                                onChange={(e: any) => {
                                  setPageData( (prevState: any) => ({ ...prevState, maxToken: e.target.value }) )
                                }}
                              />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container alignItems="center">
                        <Grid item xs={4}>
                            <InputLabel id='demo-dialog-select-label'>{t("ipLimitPerMinute")}</InputLabel>
                        </Grid>
                        <Grid item xs={8} sx={{pt: 6, pl: 2}}>
                            <TextField
                                type="number"
                                size="small"
                                inputProps={{ min: 0, max: 100 }} 
                                value={pageData.ipLimitPerMinute}
                                sx={{ width: '100%', resize: 'both', '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                                placeholder={t(pageData.placeholder) as string}
                                onChange={(e: any) => {
                                  setPageData( (prevState: any) => ({ ...prevState, ipLimitPerMinute: e.target.value }) )
                                }}
                              />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container alignItems="center">
                        <Grid item xs={4}>
                            <InputLabel id='demo-dialog-select-label'>{t("expiredTime")}</InputLabel>
                        </Grid>
                        <Grid item xs={8} sx={{pt: 6, pl: 2}}>
                            <TextField
                                size="small"
                                value={pageData.expiredTime}
                                sx={{ width: '100%', resize: 'both', '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                                placeholder={t(pageData.placeholder) as string}
                                onChange={(e: any) => {
                                  setPageData( (prevState: any) => ({ ...prevState, expiredTime: e.target.value }) )
                                }}
                              />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container alignItems="center">
                        <Grid item xs={4}>
                            <InputLabel id='demo-dialog-select-label'>{t("returnReference")}</InputLabel>
                        </Grid>
                        <Grid item xs={8} sx={{pt: 6, pl: 2}}>
                            <Switch 
                                checked={pageData.returnReference == 1 ? true : false} 
                                onChange={(e: any) => {
                                    setPageData( (prevState: any) => ({ ...prevState, returnReference: e.target.checked ? 1 : 0 }) )
                                }} 
                            />
                        </Grid>
                    </Grid>
                </Grid>

            </DialogContent>
            <DialogActions>
                <Button size="small" variant='outlined' onClick={
                    () => { setPageData( (prevState: any) => ({ ...prevState, open: false }) ) }
                }>
                {t("Close")}
                </Button>
                <Button size="small" variant='contained' onClick={
                    () => { handleSubmit() }
                }>
                {t("Add")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default memo(PublishAppNewEdit);

/*

                <Grid item xs={12}>
                    <Grid container alignItems="center">
                        <Grid item xs={4}>
                            <InputLabel id='demo-dialog-select-label'>{t("authCheck")}</InputLabel>
                        </Grid>
                        <Grid item xs={8} sx={{pt: 6, pl: 2}}>
                            <TextField
                                size="small"
                                value={pageData.authCheck}
                                sx={{ width: '100%', resize: 'both', '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                                placeholder={t(pageData.placeholder) as string}
                                onChange={(e: any) => {
                                  setPageData( (prevState: any) => ({ ...prevState, authCheck: e.target.value }) )
                                }}
                              />
                        </Grid>
                    </Grid>
                </Grid>
*/