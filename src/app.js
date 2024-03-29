import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';
import {
  parseRSSPosts,
  parseRSSFeed,
  parseRSSFeedValidator,
} from './parser.js';
import { renderFeeds, renderPosts } from './renderPostsAndFeeds.js';

import './styles.css';
import resources from './locales/index.js';

export default () => {
  const elements = {
    container: document.querySelector('.container-fluid'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    fields: {},
    errorFields: {},
    validFields: {},
  };

  const defaultLang = 'ru';
  // const defaultChannelId = uniqueId();

  const state = {
    form: {
      valid: false,
      errors: [],
    },
    processLoading: {
      status: null,
      errors: [],
    },
    ui: {
      seenPosts: [],
      urlList: [],
    },
    feedsList: [],
    postsList: [],
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLang,
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
    },
  });

  const watchedState = watch(elements, state, i18n);
  watchedState.processLoading.status = 'filling';

  const urlValidator = yup
    .string()
    .url()
    .required()
    .test({
      name: 'network-status',
      message: i18n.t('errors.validation.networkErr'),
      test: async (value) => {
        if (!navigator.onLine) {
          return false;
        }
        try {
          await axios.get(
            `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
              value,
            )}`,
          );
          return true;
        } catch (error) {
          return false;
        }
      },
    })
    .test(
      'is-rss-feed',
      i18n.t('errors.validation.rss'),
      (value) => new Promise((resolve) => {
        axios
          .get(
            `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
              value,
            )}`,
          )
          .then((response) => response.data)
          .then((data) => {
            resolve(parseRSSFeedValidator(data));
          })
          .catch(() => {
            resolve(false);
          });
      }),
    );

  /* eslint-disable */
  const validateUniqueUrl = (urls) => {
    return yup.string().test({
      name: 'unique-url',
      message: i18n.t('errors.validation.uniqueUrl'),
      test: function (value) {
        if (!value) return true;
        return !urls.includes(value);
      },
    });
  };

  const schema = yup.object().shape({
    url: urlValidator,
    otherUrls: yup
      .array()
      .of(yup.string().concat(validateUniqueUrl(state.ui.urlList))),
  });

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputData = document.getElementById('url-input').value;
    const data = {
      url: inputData,
      otherUrls: state.ui.urlList,
    };

    schema
      .validate(data, { abortEarly: false })
      .then(() => {
        watchedState.form.errors = [];
        watchedState.form.valid = true;
        watchedState.ui.urlList.push(inputData);
        fetchAndProcessRSS(inputData);
      })
      .catch((error) => {
        watchedState.processLoading.status = 'error';
        watchedState.form.errors = error.errors[0];
      });
  });

  const fetchAndProcessRSS = (feedUrl) => {
    let feeds;
    let posts;
    axios
      .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${feedUrl}`)
      .then((response) => {
        feeds = parseRSSFeed(response.data);
        posts = parseRSSPosts(response.data, state);
        setState(feeds, posts, watchedState);
      })
      .then(() => {
        renderPosts(i18n, elements, watchedState);
        renderFeeds(i18n, elements, watchedState);
        return { feeds, posts };
      })

      .catch((err) => {
        if (!navigator.onLine) {
          console.log('Network Error:', 'Internet Disconnected');
          watchedState.processLoading.status = 'error';
          watchedState.form.errors = i18n.t('errors.validation.networkErr');
        } else if (axios.isAxiosError(err)) {
          watchedState.processLoading.status = 'error';
          watchedState.form.errors = i18n.t('errors.validation.networkErr');
        } else {
          console.error('Error fetching or parsing RSS feed:', err);
        }
      });
  };

  const setState = (feeds, posts, watchedState) => {
    watchedState.feedsList.push(feeds);
    watchedState.postsList = posts;
  };

  const checkForNewPosts = () => {
    const promises = watchedState.ui.urlList.map((feedUrl) =>
      fetchAndProcessRSS(feedUrl),
    );

    Promise.all(promises)
      .then((results) => {
        results.forEach(({ feeds, posts }) => {
          watchedState.feedsList.push(feeds);
          watchedState.postsList.push(...posts);
        });
      })
      .catch((err) => {
        console.error('Error processing RSS feeds:', err);
      })
      .then(() => setTimeout(checkForNewPosts, 5000));
  };

  checkForNewPosts();
};
