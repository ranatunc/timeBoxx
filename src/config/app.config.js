import 'dotenv/config';

export default {
  expo: {
    name: 'MyApp',
    slug: 'my-app',
    version: '1.0.0',
    extra: {
      API_URL_IOS: process.env.API_URL_IOS,
      API_URL_ANDROID: process.env.API_URL_ANDROID,
    },
  },
};
