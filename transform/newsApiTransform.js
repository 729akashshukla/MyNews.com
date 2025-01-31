import { getImageUrl } from "../utils/helper.js";

class NewsApiTransform {

    static transform(news) {

        return {
            id:news.id,
            heading:news.title,
            news:news.content,
            image:getImageUrl(news.image),
            created_at:news.created_at,
            reporter:{
                id:news?.user.id,
                name:news?.user.name,
                profile:news?.user?.profile!==null ? getImageUrl(news?.user?.profile) : "https://png.pngtree.com/png-vector/20230831/ourmid/pngtree-man-avatar-image-for-profile-png-image_9197908.png",
            }
        }
    }

    }

    export default NewsApiTransform;