import vine from "@vinejs/vine";
import { CustomErrorReporter } from "./CustomErrorReporter.js";

vine.errorReporter = () => new CustomErrorReporter();

export const registerSchema = vine.object({
    
    name: vine.string().minLength(2).maxLength(191),
    email: vine.string().email(),
    password: vine.string().minLength(8).maxLength(191).confirmed(),



})
export const loginSchema = vine.object({
    
   
    email: vine.string().email(),
    password: vine.string(),



})