import { supportedMimes } from "../config/filesystem.js";
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";


export const imageValidator = (size, mime) => {
  if (bytesToMb(size) > 2) {
    return " Image size should be less than 2 MB";

  } else if (!supportedMimes.includes(mime)) {
    return " image must be size of png,jpg,jpeg,gif,webp";
  }
  return null;
};

export const bytesToMb = (bytes) => {
  return bytes / (1024 * 1024);
};

export const generateRandomNum = ()=>{
  return uuidv4();
} ;

export const getImageUrl = (imgName) => {
  return `${process.env.APP_URL}/images/${imgName}`
}

export const removeImage = (imageName) => {
  const path = process.cwd() + "/public/images/" + imageName;
  if(fs.existsSync(path)){

    fs.unlinkSync(path)

  }
}

export const uploadImage = (image) => {
  const imgExt = image?.name.split(".");
  const imageName = generateRandomNum() + "." + imgExt[1];
  const uploadPath = process.cwd() + "/public/images/" + imageName;
  image.mv(uploadPath, async (err) => {
    if (err) throw err;
  });

  return imageName;
}
  