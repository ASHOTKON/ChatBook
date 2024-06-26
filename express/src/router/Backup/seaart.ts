  // app.ts
  import express from 'express';

  import { checkUserToken, checkUserTokenXWE, checkUserTokenXWENotCostAmount } from '../../utils/user';

  import { getUserImagesSeaArt, getUserImagesAll, generateImageSeaArt, getTokenSeaArt, checkImageProcessSeaArt, outputImageSeaArt } from '../../utils/Backup/seaart';

  const app = express();
  
  app.post('/api/getUserImagesSeaArt', async (req, res) => {
    const { authorization } = req.headers;
    const { pageid, pagesize } = req.body;
    const checkUserTokenData = await checkUserToken(authorization);
    if(checkUserTokenData && checkUserTokenData.data && checkUserTokenData.data.id && ( checkUserTokenData.data.role == 'admin' || checkUserTokenData.data.role == 'user') ) {
      const generateimageData = await getUserImagesSeaArt(checkUserTokenData.data.id, pageid, pagesize);
      //console.log("generateimageData", generateimageData);
      res.status(200).json(generateimageData).end();
    }
    else {
        res.status(200).json({"status":"error", "msg":"Token is invalid", "data": null}).end();
    }
  });

  app.post('/api/getUserImagesSeaArtAll', async (req, res) => {
    const { pageid, pagesize } = req.body;
    const getUserImagesAllData = await getUserImagesAll(pageid, pagesize);
    //console.log("getUserImagesAllData", getUserImagesAllData);
    res.status(200).json(getUserImagesAllData).end();
  });

  app.post('/api/generateImageSeaArt', async (req, res) => {
    const { authorization } = req.headers;
    const checkUserTokenData = await checkUserToken(authorization);
    if(checkUserTokenData && checkUserTokenData.data && checkUserTokenData.data.email && ( checkUserTokenData.data.role == 'admin' || checkUserTokenData.data.role == 'user') ) {
      const generateImageSeaArtData = await generateImageSeaArt(checkUserTokenData, req.body);
      //console.log("generateImageSeaArtData", generateImageSeaArtData);
      res.status(200).json(generateImageSeaArtData).end();
    }
    else {
        res.status(200).json({"status":"error", "msg":"Token is invalid", "data": null}).end();
    }
  });

  app.post('/api/generateImageSeaArtXWE', async (req, res) => {
    const { authorization } = req.headers;
    const checkUserTokenData = await checkUserTokenXWE(authorization);
    console.log("checkUserTokenData", checkUserTokenData)
    if(checkUserTokenData && checkUserTokenData.data && checkUserTokenData.data.email && ( checkUserTokenData.data.role == 'admin' || checkUserTokenData.data.role == 'user') ) {
      const generateImageSeaArtData = await generateImageSeaArt(checkUserTokenData, req.body);
      //console.log("generateImageSeaArtData", generateImageSeaArtData);
      res.status(200).json(generateImageSeaArtData).end();
    }
    else {
        res.status(200).json({"status":"error", "msg":"Token is invalid", "data": null}).end();
    }
  });

  app.post('/api/getUserImagesSeaArtXWE', async (req, res) => {
    const { pageid, pagesize } = req.body;
    const { authorization } = req.headers;
    const checkUserTokenData = await checkUserTokenXWENotCostAmount(authorization);
    console.log("checkUserTokenData", checkUserTokenData)
    if(checkUserTokenData && checkUserTokenData.data && checkUserTokenData.data.email && ( checkUserTokenData.data.role == 'admin' || checkUserTokenData.data.role == 'user') ) {
      const generateimageData = await getUserImagesSeaArt(checkUserTokenData.data.id, pageid, pagesize);
      //console.log("generateimageData", generateimageData);
      res.status(200).json(generateimageData).end();
    }
    else {
        res.status(200).json({"status":"error", "msg":"Token is invalid", "data": null}).end();
    }
  });

  app.get('/api/getTokenSeaArt', async (req, res) => {
    const getTokenSeaArtData = await getTokenSeaArt();
    //console.log("getTokenSeaArtData", getTokenSeaArtData);
    res.status(200).json(getTokenSeaArtData).end();
  });

  app.get('/api/checkImageProcessSeaArt', async (req, res) => {
    const checkImageProcessSeaArtData = await checkImageProcessSeaArt(["cn211rde878c73ch5hhg"]);
    //console.log("checkImageProcessSeaArtData", checkImageProcessSeaArtData);
    res.status(200).json(checkImageProcessSeaArtData).end();
  });

  app.get('/api/image/seaart/:file', async (req, res) => {
    const { file } = req.params;
    if(file && file != "undefined") {
        outputImageSeaArt(res, file);
    }
    else {
        console.log("seaart file not exist", file)
        res.end();
    }
  });
  

  export default app;
