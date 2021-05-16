import cloudinary from 'cloudinary';

export const Cloudinary = {
  upload: async (image: string) => {
    const res = await cloudinary.v2.uploader.upload(image, {
      api_key: process.env.CLOUD_KEY,
      api_secret: process.env.CLOUD_SECRET,
      cloud_name: process.env.CLOUD_NAME,
      folder: 'TH_Assets/',
    });

    return res.secure_url;
  },
};
