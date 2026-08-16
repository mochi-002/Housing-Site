import express, { Router } from 'express'
import { register, login } from '../controllers/Auth.controller.js'

const router:Router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)

export {router as authRouter}