  import { setting, log } from './utils'
  import dotenv from 'dotenv';
  import { promisify } from 'util';
  import bcrypt from 'bcrypt';
  import jwt from 'jsonwebtoken';
  import axios from 'axios'

  // @ts-ignore
  import { NextApiRequest } from 'next';
  import useragent from 'useragent';

  dotenv.config();

  const [DataDir, db, userId] = setting()

  console.log("DataDir***********************", DataDir)
  console.log("userId***********************", userId)

  const secretKey: string = process.env.JWT_TOKEN_SECRET_KEY || "ChatBookAI"; 

  const getDbRecord = promisify(db.get.bind(db));
  const getDbRecordALL = promisify(db.all.bind(db));
  
  export const createJwtToken = (userId: string, email: string, role: string) => {
    const token = jwt.sign({ userId, email, role }, secretKey, { expiresIn: '1d' });

    return token;
  };

  export const verifyJwtToken = (token: string) => {
    try {
      const decoded = jwt.verify(token, secretKey);

      return decoded;
    } 
    catch (error) {

      return null;
    }
  };

  export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return hashedPassword;
  };

  export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
    const isMatch = await bcrypt.compare(password, hashedPassword);

    return isMatch;
  };

  export const passwordValidator = (password: string): boolean => {

    // 正则表达式，要求至少包含一个数字、一个字母，且长度至少为八位
    const passwordRegex = /^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/;
  
    return passwordRegex.test(password);
  };

  export async function checkUserToken(token: string) {
    const userTokenData: any = verifyJwtToken(token);
    if(userTokenData) {
        return {"status":"ok", "msg":"User token is valid", "data": userTokenData}
    }
    else {
        return {"status":"error", "msg":"Token is valid"}
    }
  }

  export async function userLoginLog(req: NextApiRequest, email: string, action: string, msg: string) {
    const agent = useragent.parse(req.headers['user-agent']);
    const BrowserType = agent.family
    const BrowserVersion = agent.toVersion()
    const OperatingSystem = agent.os.family
    const Device = agent.device.family
    const ipaddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ipaddress2 = ipaddress.replace('::ffff:','');
    const insertSetting = db.prepare('INSERT OR IGNORE INTO userlog (email, browsertype, browserversion, os, device, location, country, ipaddress, recentactivities, action, msg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    if(ipaddress2 != "::1")  {
      try {
        const response = await axios.get(`https://ipinfo.io/${ipaddress2}/json`);
        const locationInfo = response.data;
        const location = locationInfo.city + ', ' + locationInfo.region + ', ' + locationInfo.country
        const country = locationInfo.country
        insertSetting.run(email, BrowserType, BrowserVersion, OperatingSystem, Device, location, country, ipaddress2, Date.now(), action, msg);
        insertSetting.finalize();
      }
      catch(error: any) {
      }
    }
  }

  export async function checkUserPassword(req: NextApiRequest, email: string, password: string) {
    const getOneUserData: any = await getOneUser(email);
    if(getOneUserData) {
        const isPasswordMatch = await comparePasswords(password, getOneUserData.password);
        if(isPasswordMatch) {
            const msg = "Login successful"
            const createJwtTokenData = createJwtToken(getOneUserData.id, getOneUserData.email, getOneUserData.role)
            userLoginLog(req, email, 'Login Success', msg)

            return {"status":"ok", "msg":"Login successful", "token": createJwtTokenData, "data": {...getOneUserData, password:''}}
        }
        else {
            const msg = "Username not exist or password is error"
            userLoginLog(req, email, 'Login Failed', msg)

            return {"status":"error", "msg":msg}
        }
    }
    else {
        const msg = "Username not exist or password is error"
        userLoginLog(req, email, 'Login Failed', msg)

        return {"status":"error", "msg":msg}
    }
  }

  export async function changeUserPasswordByToken(token: string, data: any) {    
    const checkUserTokenData: any = await checkUserToken(token);
    if(checkUserTokenData && checkUserTokenData.data && checkUserTokenData.data.email && checkUserTokenData.data.role == 'admin') {
      const getOneUserData: any = await getOneUser(checkUserTokenData.data.email);
      
      if(getOneUserData) {
          const isPasswordMatch = await comparePasswords(data.currentPassword, getOneUserData.password);
          if(isPasswordMatch) {
              if(!passwordValidator(data.newPassword)) {
      
                  return {"status":"error", "msg":"The password must contain both letters and numbers, and be at least 8 characters long."}
              }
              const hashedPassword = await hashPassword(data.newPassword);
              const updateSetting = db.prepare('update user set password = ? where email = ?');
              updateSetting.run(hashedPassword, checkUserTokenData.data.email);
              updateSetting.finalize();

              // User password change log
              // ...

              return {"status":"ok", "msg":"Change password successful"}
          }
          else {

              return {"status":"error", "msg":"Username not exist or password is error"}
          }
      }
      else {

          return {"status":"error", "msg":"Username not exist or password is error"}
      }
    }
    else {

      return {"status":"error", "msg":"Token is invalid"}
    }
  }

  export async function changeUserDetail(token: string, data: any) {
    console.log("data", data)
    const checkUserTokenData: any = await checkUserToken(token);
    if(checkUserTokenData && checkUserTokenData.data && checkUserTokenData.data.email && checkUserTokenData.data.role == 'admin') {
      console.log("checkUserTokenData", checkUserTokenData)
      const updateSetting = db.prepare('update user set firstname = ?, lastname = ?, organization = ?, mobile = ?, address = ?, state = ?, country = ?, language = ? where email = ?');
      updateSetting.run(data.firstname, data.lastname, data.organization, data.mobile, data.address, data.state, data.country, data.language, checkUserTokenData.data.email);
      updateSetting.finalize();

      return {"status":"ok", "msg":"Change user information successful"}
    }
    else {

      return {"status":"error", "msg":"Token is invalid"}
    }
  }

  export async function registerUser(email: string, username: string, password: string, confirm_password: string, language: string) {
    try{
        if(password != confirm_password) {

            return {"status":"error", "msg":"The passwords entered twice are different"}
        }
        if(!passwordValidator(password)) {

            return {"status":"error", "msg":"The password must contain both letters and numbers, and be at least 8 characters long."}
        }
        const getOneUserData: any = await getOneUser(email);
        if(getOneUserData) {
          return {"status":"error", "msg":"This email have used before."}
        }
        const hashedPassword = await hashPassword(password);
        const insertSetting = db.prepare('INSERT OR IGNORE INTO user (email, username, password, language, createtime) VALUES (?, ?, ?, ?, ?)');
        insertSetting.run(email, username, hashedPassword, language, Date.now());
        insertSetting.finalize();
    }
    catch (error: any) {
      log('Error registerUser:', error.message);
    }

    return {"status":"ok", "msg":"Register user successful"}
  }

  export async function getOneUser(email: string) {
    const Records: any = await getDbRecord("SELECT * from user where email = ? ", [email]);
 
    return Records ? Records : null;
  }

  export async function getOneUserByToken(token: string) {
    const checkUserTokenData: any = await checkUserToken(token);
    if(checkUserTokenData && checkUserTokenData.data && checkUserTokenData.data.email && checkUserTokenData.data.role == 'admin') {
      const getOneUserData: any = await getOneUser(checkUserTokenData.data.email);
      if(getOneUserData) {

        return {"status":"ok", "msg":"Get one user information", "data": {...getOneUserData, password:''}}
      }
      else {       

        return {"status":"error", "msg":"User not exist", "data": null}
      }
    }
    else {

      return {"status":"error", "msg":"Token is invalid", "data": null}
    }
  }

  export async function getUsers(pageid: number, pagesize: number) {
    const user_status = 1;
    const pageidFiler = Number(pageid) < 0 ? 0 : Number(pageid) || 0;
    const pagesizeFiler = Number(pagesize) < 5 ? 5 : Number(pagesize) || 5;
    const From = pageidFiler * pagesizeFiler;
    console.log("pageidFiler", pageidFiler)
    console.log("pagesizeFiler", pagesizeFiler)

    const Records: any = await getDbRecord("SELECT COUNT(*) AS NUM from user where user_status = ? ", [user_status]);
    const RecordsTotal: number = Records ? Records.NUM : 0;

    const RecordsAll: any[] = await getDbRecordALL(`SELECT * FROM user WHERE user_status = ? ORDER BY id DESC LIMIT ? OFFSET ? `, [user_status, pagesizeFiler, From]) || [];

    const RS: any = {};
    RS['allpages'] = Math.ceil(RecordsTotal/pagesizeFiler);
    RS['data'] = RecordsAll.filter(element => element !== null && element !== undefined && element !== '');
    RS['from'] = From;
    RS['pageid'] = pageidFiler;
    RS['pagesize'] = pagesizeFiler;
    RS['total'] = RecordsTotal;
  
    return RS;
  }

  export async function getUserLogs(email: string, pageid: number, pagesize: number) {
    const pageidFiler = Number(pageid) < 0 ? 0 : Number(pageid) || 0;
    const pagesizeFiler = Number(pagesize) < 5 ? 5 : Number(pagesize) || 5;
    const From = pageidFiler * pagesizeFiler;
    console.log("pageidFiler", pageidFiler)
    console.log("pagesizeFiler", pagesizeFiler)

    const Records: any = await getDbRecord("SELECT COUNT(*) AS NUM from userlog where email = ? ", [email]);
    const RecordsTotal: number = Records ? Records.NUM : 0;

    const RecordsAll: any[] = await getDbRecordALL(`SELECT * FROM userlog WHERE email = ? ORDER BY id DESC LIMIT ? OFFSET ? `, [email, pagesizeFiler, From]) || [];

    const RS: any = {};
    RS['allpages'] = Math.ceil(RecordsTotal/pagesizeFiler);
    RS['data'] = RecordsAll.filter(element => element !== null && element !== undefined && element !== '');
    RS['from'] = From;
    RS['pageid'] = pageidFiler;
    RS['pagesize'] = pagesizeFiler;
    RS['total'] = RecordsTotal;
  
    return RS;
  }
