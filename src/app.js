import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import initView from './view.js';
import { renderFeeds, renderPosts } from './renderPostsAndFeeds.js';

import './styles.css';
import resources from './locales/index.js';
import parseRSSData from './parser.js';

export default () => {
  const addProxyToURL = (url) => {
    const proxyURL = new URL('https://allorigins.hexlet.app/get');
    proxyURL.searchParams.set('disableCache', 'true');
    proxyURL.searchParams.set('url', url);
    return proxyURL.toString();
  };

  const getErrorMessage = (err, i18n) => {
    if (!navigator.onLine) {
      return i18n.t('errors.validation.networkErr');
    }
    return `Error fetching or parsing RSS feed: ${err}`;
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
      errors: '',
    },
    processLoading: {
      status: 'filling',
      errors: '',
    },
    ui: {
      seenPosts: [],
      seenFeeds: [],
      urlList: [],
    },
    feedsList: [],
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  yup.setLocale({
    string: {
      url: () => i18n.t('errors.validation.url'),
    },
    mixed: {
      uniqueUrl: () => i18n.t('errors.validation.uniqueUrl'),
      rssFeed: () => i18n.t('errors.validation.rssFeed'),
      notOneOf: () => i18n.t('errors.validation.uniqueUrl'),
    },
  });

  const watchedState = onChange(state, initView(elements, i18n, state));

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.processLoading.status = 'sending';
    const inputData = document.getElementById('url-input').value;

    const setState = (feeds) => {
      watchedState.feedsList.unshift(feeds);
      feeds.posts.forEach((post) => watchedState.ui.seenPosts.push(post));
    };
    const fetchAndProcessRSS = (feedUrl) => {
      const proxyUrl = addProxyToURL(feedUrl);
      return axios
        .get(proxyUrl)
        .then((response) => {
          const feeds = parseRSSData(response.data);
          setState(feeds, watchedState);
          renderPosts(i18n, elements, watchedState);
          renderFeeds(i18n, elements, watchedState);
          return feeds;
        })

        .catch((err) => {
          getErrorMessage(err);
          watchedState.processLoading.status = 'error';
        });
    };

    const createValidationSchema = (url, feeds) => yup
      .string()
      .required()
      .url()
      .notOneOf(feeds)
      .test({
        name: 'network-status',
        message: i18n.t('errors.validation.networkErr'),
        test: (value) => new Promise((resolve) => {
          if (!navigator.onLine) {
            resolve(false);
          } else {
            const proxUrl = addProxyToURL(value);
            axios
              .get(proxUrl)
              .then(() => {
                resolve(true);
              })
              .catch(() => {
                resolve(false);
              });
          }
        }),
      })
      .test(
        'is-rss-feed',
        i18n.t('errors.validation.rss'),
        (value) => new Promise((resolve) => {
          const proxUrl = addProxyToURL(value);
          axios
            .get(proxUrl)
            .then((response) => response.data)
            .then((data) => {
              resolve(parseRSSData(data));
            })
            .catch(() => {
              resolve(false);
            });
        }),
      );

    const validationSchema = createValidationSchema(
      inputData,
      watchedState.ui.urlList,
    );

    validationSchema
      .validate(inputData, { abortEarly: false })
      .then(() => {
        watchedState.form.errors = [];
        watchedState.form.valid = true;
        watchedState.ui.urlList.push(inputData);
        watchedState.processLoading.status = 'success';
        fetchAndProcessRSS(inputData);
      })
      .catch((error) => {
        watchedState.processLoading.status = 'error';
        watchedState.form.errors = error.errors;
      });
    const checkForNewPosts = () => {
      const promises = watchedState.ui.urlList.map((feedUrl) => fetchAndProcessRSS(feedUrl));

      Promise.all(promises)
        .then((results) => {
          results.forEach((feeds) => {
            if (feeds && feeds.posts && Array.isArray(feeds.posts)) {
              feeds.posts.forEach((post) => {
                watchedState.ui.seenPosts.unshift(post);
              });
            } else {
              console.log('Unexpected data format:', feeds);
            }
          });
        })
        .then(() => setTimeout(checkForNewPosts, 5000))
        .catch((err) => {
          console.error('Error processing RSS feeds:', err);
        });
    };
    checkForNewPosts();
  });
};
