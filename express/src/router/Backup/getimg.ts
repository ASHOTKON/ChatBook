  // app.ts
  import express from 'express';

  import { checkUserToken } from '../../utils/user';

  import { getModels, getModelDetail, generateImageGetImg, getModelsToGenereateImage, TextToImageALL, TextToImageAllLatentConsistency, Base64ToImg, getUserImagesGetImg, getUserImagesGetImgAll } from '../../utils/Backup/getimg';

  const app = express();

  app.get('/api/getModels', async (req, res) => {
    const getModelsData = await getModels();
    //console.log("getModels", getModelsData)
    res.status(200).json(getModelsData).end();
    /*
    const { authorization } = req.headers;
    const checkUserTokenData = await checkUserToken(authorization);
    if(checkUserTokenData && checkUserTokenData.data && checkUserTokenData.data.email && checkUserTokenData.data.role == 'admin') {
        res.status(200).json({});
    }
    else if(checkUserTokenData && checkUserTokenData.data && checkUserTokenData.data.email && checkUserTokenData.data.role == 'user') {
        res.status(200).json({});
    }
    else {
        res.status(200).json({"status":"error", "msg":"Token is invalid", "data": null});
    }
    res.end();
    */
  });

  app.get('/api/getModelsToGenereateImage', async (req, res) => {
    const getModelsToGenereateImageData = await getModelsToGenereateImage();
    //console.log("getModelsToGenereateImageData", getModelsToGenereateImageData)
    res.status(200).json(getModelsToGenereateImageData).end();
  });

  app.get('/api/getModelDetail/:id', async (req, res) => {
    const { id } = req.params;
    const getModelDetailData = await getModelDetail(id);
    //console.log("getModelDetailData", getModelDetailData)
    res.status(200).json(getModelDetailData).end();
  });

  app.get('/api/TextToImageALL', async (req, res) => {
    const TextToImageALLData = await TextToImageALL();
    //console.log("TextToImageALLData", TextToImageALLData);
    let TextToImageALLDataHtml = '';
    TextToImageALLData.map((FileName)=>{
        if(FileName) {
            TextToImageALLDataHtml += "<img src='/api/image/"+FileName+"' border=0 width=600>";
        }
    })
    res.status(200).send(TextToImageALLDataHtml).end();
  });

  app.get('/api/TextToImageAllLatentConsistency', async (req, res) => {
    const TextToImageAllLatentConsistencyData = await TextToImageAllLatentConsistency();
    //console.log("TextToImageAllLatentConsistencyData", TextToImageAllLatentConsistencyData);
    let TextToImageAllLatentConsistencyDataHtml = '';
    TextToImageAllLatentConsistencyData.map((FileName)=>{
        if(FileName) {
            TextToImageAllLatentConsistencyDataHtml += "<img src='/api/image/"+FileName+"' border=0 width=600>";
        }
    })
    res.status(200).send(TextToImageAllLatentConsistencyDataHtml).end();
  });

  app.get('/api/Base64ToImg', async (req, res) => {
    const Base64IMG = ""
    const Base64ToImgData = await Base64ToImg(Base64IMG, 'absolute-reality-v1-8-1');
    //console.log("Base64ToImgData", Base64ToImgData)
    res.status(200).json(Base64ToImgData).end();
  });

  app.post('/api/generateImageGetImg', async (req, res) => {
    const { authorization } = req.headers;
    const checkUserTokenData = await checkUserToken(authorization);
    if(checkUserTokenData && checkUserTokenData.data && checkUserTokenData.data.email && ( checkUserTokenData.data.role == 'admin' || checkUserTokenData.data.role == 'user') ) {
      const generateimageData = await generateImageGetImg(checkUserTokenData, req.body);
      //console.log("generateimageData", generateimageData);
      res.status(200).json(generateimageData).end();
    }
    else {
        res.status(200).json({"status":"error", "msg":"Token is invalid", "data": null}).end();
    }
  });

  app.post('/api/getUserImagesGetImg', async (req, res) => {
    const { authorization } = req.headers;
    const { pageid, pagesize } = req.body;
    const checkUserTokenData = await checkUserToken(authorization);
    if(checkUserTokenData && checkUserTokenData.data && checkUserTokenData.data.id && ( checkUserTokenData.data.role == 'admin' || checkUserTokenData.data.role == 'user') ) {
      const generateimageData = await getUserImagesGetImg(checkUserTokenData.data.id, pageid, pagesize);
      //console.log("generateimageData", generateimageData);
      res.status(200).json(generateimageData).end();
    }
    else {
        res.status(200).json({"status":"error", "msg":"Token is invalid", "data": null}).end();
    }
  });

  app.post('/api/getUserImagesGetImgAll', async (req, res) => {
    const { pageid, pagesize } = req.body;
    const getUserImagesAllData = await getUserImagesGetImgAll(pageid, pagesize);
    //console.log("getUserImagesAllData", getUserImagesAllData);
    res.status(200).json(getUserImagesAllData).end();
  });



  
  export default app;
