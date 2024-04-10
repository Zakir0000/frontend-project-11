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
    validationMessage: {
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
    urlList: [],
    feedsList: [],
    modalPostId: null,
    posts: [],
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const watchedState = initView(elements, i18n, state);

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

  const addIdtoNewPost = (newPost) => {
    const postId = _.uniqueId(`post_${_.uniqueId()}`);
    const nPost = newPost;
    nPost.id = postId;
    nPost.isRead = false;
    return nPost;
  };

  const fetchAndProcessRSS = (feedUrl) => {
    watchedState.processLoading.status = 'sending';
    const proxyUrl = addProxyToURL(feedUrl);
    axios
      .get(proxyUrl)
      .then((response) => {
        const feed = parseRSSData(response.data);
        const feedId = `feed_${_.uniqueId()}`;
        feed.id = feedId;
        watchedState.feedsList.unshift(feed);
        feed.posts.forEach((post) => {
          const newPost = addIdtoNewPost(post);
          watchedState.posts.push(newPost);
        });

        watchedState.processLoading.status = 'success';
        watchedState.urlList.push(feedUrl);
        watchedState.form.valid = true;
        watchedState.form.errors = null;
      })
      .catch((err) => {
        watchedState.form.errors = getErrorMessage(err);
        watchedState.processLoading.status = 'error';
      });
  };

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const inputData = data.get('url');

    createValidationSchema(inputData, watchedState.urlList).then((err) => {
      if (err) {
        watchedState.processLoading.status = 'error';
        watchedState.form.errors = err;
      } else {
        fetchAndProcessRSS(inputData);
      }
    });

    elements.postsContainer.addEventListener('click', (event) => {
      const clickPost = event.target.dataset.id;
      const clickedPost = watchedState.posts.find(
        (post) => post.id === clickPost,
      );
      clickedPost.isRead = true;
      watchedState.modalPostId = clickedPost;
    });

    const checkForNewPosts = () => {
      const promises = watchedState.urlList.map((feedUrl) => {
        const proxyUrl = addProxyToURL(feedUrl);
        return axios.get(proxyUrl).then((response) => {
          const feed = parseRSSData(response.data);
          const postExt = (title) => watchedState.posts.some((post) => post.title === title);

          feed.posts.forEach((newPost) => {
            if (!postExt(newPost.title)) {
              const nPost = addIdtoNewPost(newPost);
              watchedState.posts.unshift(nPost);
            }
          });
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
