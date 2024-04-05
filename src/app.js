import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import initView from './view.js';
import resources from './locales/index.js';
import parseRSSData from './parser.js';

export default () => {
  const addProxyToURL = (url) => {
    const proxyURL = new URL('https://allorigins.hexlet.app/get');
    proxyURL.searchParams.set('disableCache', 'true');
    proxyURL.searchParams.set('url', url);
    return proxyURL.toString();
  };

  const getErrorMessage = (err) => {
    if (err.isParserError) {
      return 'errors.validation.rss';
    }
    if (err.isAxiosError) {
      return 'errors.validation.networkErr';
    }
    return 'errors.validation.unknownErr';
  };

  const elements = {
    container: document.querySelector('.container-fluid'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    fields: {
      inputEl: document.querySelector('#url-input'),
    },
    errorFields: {
      inputEl: document.querySelector('.feedback'),
    },
    validFields: {
      inputEl: document.querySelector('.feedback'),
    },
    buttons: {
      buttonEl: document.querySelector('button[type="submit"]'),
    },
  };

  const state = {
    form: {
      valid: false,
      errors: null,
    },
    processLoading: {
      status: 'filling',
      errors: null,
    },
    ui: {
      seenPosts: [],
      updated: [],
    },
    urlList: [],
    feedsList: [],
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const watchedState = initView(elements, i18n, state);

  const form = document.querySelector('.rss-form');

  const createValidationSchema = (url, feeds) => {
    const baseSchema = yup.string().required().url().notOneOf(feeds);

    return baseSchema
      .validate(url, { abortEarly: false })
      .then(() => null)
      .catch((err) => {
        if (err.message === 'this must be a valid URL') {
          return i18n.t('errors.validation.url');
        }
        return i18n.t('errors.validation.uniqueUrl');
      });
  };

  const fetchAndProcessRSS = (feedUrl) => {
    const proxyUrl = addProxyToURL(feedUrl);
    return axios
      .get(proxyUrl)
      .then((response) => {
        const feed = parseRSSData(response.data);

        const feedId = `feed_${Date.now()}`;
        feed.id = feedId;
        watchedState.feedsList.unshift(feed);

        feed.posts.forEach((post) => {
          const postId = _.uniqueId(`post_${_.uniqueId()}`);
          const newPost = post;
          newPost.id = postId;
          newPost.feedId = feedId;
          watchedState.ui.seenPosts.push(newPost);
          console.log(watchedState);
        });

        watchedState.processLoading.status = 'success';
        watchedState.form.errors = [];
        watchedState.urlList.push(feedUrl);
      })
      .catch((err) => {
        watchedState.form.errors = getErrorMessage(err);
        watchedState.processLoading.status = 'error';
      });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.processLoading.status = 'sending';

    const data = new FormData(e.target);
    const inputData = data.get('url');

    createValidationSchema(inputData, watchedState.urlList).then((err) => {
      if (err) {
        watchedState.processLoading.status = 'error';
        watchedState.form.errors = err;
      } else {
        fetchAndProcessRSS(inputData)
          .then((item) => {
            if (item) {
              watchedState.ui.urlList.push(inputData);
              watchedState.form.valid = true;
            }
          })
          .catch((error) => {
            getErrorMessage(error);
          });
      }
    });

    const checkForNewPosts = () => {
      const promises = watchedState.urlList.map((feedUrl) => {
        const proxyUrl = addProxyToURL(feedUrl);
        return axios.get(proxyUrl).then((response) => {
          const feed = parseRSSData(response.data);
          const clonePosts = _.cloneDeep(watchedState.ui.seenPosts);
          const unitedPosts = [...feed.posts, ...clonePosts];
          const selectedUnique = Object.values(
            unitedPosts.reduce((acc, obj) => {
              acc[obj.title] = obj;
              return acc;
            }, {}),
          );
          watchedState.ui.seenPosts = selectedUnique;
          watchedState.ui.updated = selectedUnique;
        });
      });

      Promise.all(promises)
        .then(() => {
          setTimeout(checkForNewPosts, 5000);
        })
        .catch((err) => {
          console.error('Error processing RSS feeds:', err);
        });
    };
    setTimeout(checkForNewPosts, 5000);
  });
};
