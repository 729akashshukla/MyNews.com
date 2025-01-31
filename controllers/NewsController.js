import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/newsValidation.js";
import {
  generateRandomNum,
  imageValidator,
  removeImage,
  uploadImage,
} from "../utils/helper.js";
import NewsApiTransform from "../transform/newsApiTransform.js";
import prisma from "../DB/db.config.js";
import redisCache from "../DB/redis.config.js";
import logger from "../config/logger.js";

class NewsController {
  static async index(req, res) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 2;

    if (page < 0) {
      page = 1
    }
    if (limit < 0 || limit > 100) {
      limit = 10
    }

    const skip = (page - 1) * limit;
    const news = await prisma.news.findMany({
      take: limit,
      skip: skip,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        },
      },
    });
    const newsTransform = news.map((data) => NewsApiTransform.transform(data));

    const totalNews = await prisma.news.count();
    const totalPages = Math.ceil(totalNews / limit);

    res.json({
      status: 200,
      news: newsTransform,
      metadata: {
        totalPages,
        currentPage: page,
        currentLimit: limit,
      },
    });
  }

  static async store(req, res) {
    try {
      const user = req.user;
      const body = req.body;
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          error: {
            image: "Image is required",
          },
        });
      }

      const image = req.files?.image;
      const message = imageValidator(image?.size, image?.mimetype);
      if (message !== null) {
        return res.status(400).json({
          error: {
            image: message,
          },
        });
      }


      const imageName = uploadImage(image);

    

      payload.image = imageName;
      payload.user_id = user.id;

      const news = await prisma.news.create({
        data: payload,
      });

      redisCache.del("/api/news", (err) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            message: "Something went wrong",
          });
        }
      });

      return res.json({
        status: 200,
        message: "News created sucessfully",
        news,
      });
    } catch (error) {
      logger.error(error?.message);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong",
        });
      }
    }
  }

  static async show(req, res) {
    try {
      const { id } = req.params;
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: true,
            },
          },
        },
      });
      const transFormnNews = news ? NewsApiTransform.transform(news) : null;

      return res.json({ status: 200, news: transFormnNews });
    } catch (error) {
      logger.error( error?.message);
      return res

        .status(400)
        .json({ error: "Something went wrong  please try again " });
    }
  }

  static async update(req, res) {
    try {
        const { id } = req.params; // ID of the news to be updated
        const user = req.user;    // Authenticated user
        const body = req.body;   // Data from the request body

        // Fetch the existing news record
        const news = await prisma.news.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!news) {
            return res.status(404).json({ error: "News not found" });
        }

        // Check if the user is authorized to update the news
        if (user.id !== news.user_id) {
            return res
                .status(403)
                .json({ error: "You are not authorized to update this news" });
        }

        // Validate the input data against the schema
        const validator = vine.compile(newsSchema);
        const payload = await validator.validate(body);

        let imageName = news.image; // Default to existing image
        const image = req?.files?.image;

        if (image) {
            // Validate the uploaded image
            const message = imageValidator(image?.size, image?.mimetype);
            if (message !== null) {
                return res.status(400).json({
                    errors: {
                        image: message,
                    },
                });
            }

            // Upload the new image and remove the old one
            imageName = uploadImage(image);
            if (news.image) {
                removeImage(news.image);
            }
        }

        // Update the news record with the validated payload and image
        await prisma.news.update({
            where: {
                id: Number(id),
            },
            data: {
                ...payload, // Spread validated payload
                image: imageName, // Update image if provided
            },
        });

        redisCache.del("/api/news", (err) => {
          if (err) {
            return res.status(500).json({
              status: 500,
              message: "Something went wrong",
            });
          }
        });

        return res.json({
            status: 200,
            message: "News updated successfully",
        });
    } catch (error) {
        logger.error( error?.message);
        if (error instanceof errors.E_VALIDATION_ERROR) {
            return res.status(400).json({ errors: error.messages });
        } else {
            console.error("Error updating news:", error);
            return res.status(500).json({
                status: 500,
                message: "Something went wrong",
            });
        }
    }
}


  static async destroy(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const news = await prisma.news.delete({
        where: {
          id: Number(id),
        },
      });
      if (user.id !== news?.user_id) {
        return res
          .status(401)
          .json({ error: "You are not authorized to delete this news" });
      }

      removeImage(news.image);

      await prisma.news.delete({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      logger.error( error?.message);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong",
        });
      }
    }
  }
}

export default NewsController;
