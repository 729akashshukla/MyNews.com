import prisma  from "../DB/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import  bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { sendEmail } from "../config/mailer.js";
import  logger  from "../config/logger.js";



class AuthController{
    static async register(req, res) {
        // console.log("Register route hit");
        try {
            const body = req.body;
            const validator = vine.compile(registerSchema);
            const payload = await validator.validate(body);

             const findUser = await prisma.users.findUnique({
                where: {
                    email: payload.email
                }
             })
             
             if(findUser){
                return res.status(400).json({ error: "User email already exists" });

             }
            const salt = bcrypt.genSaltSync(10);
            payload.password = bcrypt.hashSync(payload.password, salt);

            const user = await prisma.users.create({
                data: payload,
            })

            return res.json({ status:200,message:"User created successfully" ,user});
        } catch (error) {
            console.log(error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ errors: error.messages });
            }
            else{
            return res.status(500).json({ error: "Something went wrong please try again" });
           }
        }
    }

    static async login(req, res) {
       try {
        const body = req.body;
        const validator = vine.compile(loginSchema);
        const payload = await validator.validate(body);

       const  findUser = await prisma.users.findUnique({
         where: {
             email: payload.email
         }
        });

       if(findUser){

        if(!bcrypt.compareSync(payload.password, findUser.password)) {

            return res.status(400).json({ error: "Invalid credentials" });
        
        }

        const payloadData = {

            id: findUser.id,
            name: findUser.name,
            email: findUser.email
           
        }

        const token = jwt.sign(payloadData, process.env.JWT_SECRET, { expiresIn: '365d' });

        return res.json({ status:200,message:"Login successfully" ,access_token:`Bearer ${token}`});

     }


        return res.status(200).json({ errors:"No user find this email" });

       } catch (error) {
        console.log(error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ errors: error.messages });
            }
            else{
            return res.status(500).json({ error: "Something went wrong please try again" });
           }


        
       }
    }

    static async sendTestEmail(req, res) {
        try {
            const {email} = req.query;

            const payload = {
                toEmail: email,
                subject: "Test email",
                body: "This is a test email"
            }

            await sendEmail(payload.toEmail,payload.subject,payload.body);
            res.json({ status: 200, message: "Email sent successfully" });
        } catch (error) {
            logger.error({type:"Email Error", body:error});
            return res.status(500).json({ error: "Something went wrong please try again" });
            
        }

    }

        
    
    
}

export default AuthController