import jwt from 'jsonwebtoken'
import { Router } from 'express'
import dotEnv from 'dotenv'
import { compare, toHash } from './utils';
import { LoginRequest, SignupRequest, User } from './types';
import { pool } from '../db';


dotEnv.config()


const router = Router()

const jwt_secret = process.env.jwt_secret 



if(!jwt_secret) {
        throw new Error("jwt_secret is not defiend")
    }


router.post('/signup', async(req:SignupRequest,res):Promise<Express.Response> => {
    const connection = await pool.getConnection();

    const {email,first_name,last_name,password,phone} = req.body

    if(!password|| !email || !first_name || !last_name || !phone) return res.status(400).json({})
    
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
  
    const users = rows as User[]
    const emailExist = Boolean(users.find(user => user['email'] === email))

    if(emailExist) return res.status(400).json({message:'Email is in use.'})

   
      const hashedPassword = await toHash(password)

      const user:User = {
        last_login:"N/A",
        account_verifyed:false,
        id:crypto.randomUUID(),
        role:'user',
        timestamp:new Date(),
        email,
        first_name,
        password:hashedPassword,
        last_name,
        phone
      }
    
      const insertResult = await connection.execute(
        'INSERT INTO users (last_login, account_verifyed, id, role, timestamp, email, first_name, password, last_name, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[user['last_login'], user['account_verifyed'], user['id'], user['role'],user['timestamp'], user['email'],user['first_name'],user['password'],user['last_name'], user['phone']]
      );

    const token = jwt.sign(user,jwt_secret)
        
    return res.status(201).json({user,token})
    
})


router.post('/login', async(req:LoginRequest,res) => {
    const {email,password }= req.body
    if(!email || !password) return res.status(400).json({message:'Email or password must be supllied.'})

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? ',[email])
  
    const users = rows as User[]

    const user = users.find(user => user['email'] === email)

    if(!user) return res.status(400).json({message:"Wrong credentials"})


    const result =  await compare(password,user['password'])
    

    if(!result) return res.status(400).json({message:"Wrong credentials"})

    const token = jwt.sign(user,jwt_secret)

    return res.status(200).json({user,token})
    
})

router.get('/check-token', (req,res,next) => {
   const userToken:string | undefined = req['headers']?.authorization?.split(" ")[1]

    if(!userToken) return res.json({message:'Token not provided'}).status(401)

    const isVerify  = jwt.verify(userToken,jwt_secret,(err,user) => {
        if(err) return res.json({error:'Token not valid'}).status(500)
    })
    return res.json({user:isVerify}).status(200)
})

router.get('/users/all',async(req,res) => {
    
      const [rows] = await pool.execute('SELECT * FROM users');
      const users = rows as User[]
    
      return res.status(200).json({users})


})


export default router;


