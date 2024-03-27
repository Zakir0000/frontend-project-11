import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';
import { parseRSSPosts, parseRSSFeed } from './parser.js';
import { renderFeeds, renderPosts } from './renderPostsAndFeeds.js';
import uniqueId from 'lodash/uniqueId.js';

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
  const defaultChannelId = uniqueId();

  const state = {
    form: {
      status: null,
      valid: false,
      errors: [],
    },
    uiState: {
      validUrl: [],
    },
    activeListId: defaultChannelId,
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
  watchedState.form.status = 'filling';

  const urlValidator = yup
    .string()
    .url()
    .required()
    .test(
      'is-rss-feed',
      i18n.t('errors.validation.rss'),
      (value) =>
        new Promise((resolve) => {
          axios
            .get(
              `https://allorigins.hexlet.app/raw?disableCache=true&url=${encodeURIComponent(
                value,
              )}`,
            )
            .then((response) => {
              resolve(response.status === 200);
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
      .of(yup.string().concat(validateUniqueUrl(state.uiState.validUrl))),
  });

  document.querySelector('.rss-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputData = document.getElementById('url-input').value;
    const data = {
      url: inputData,
      otherUrls: state.uiState.validUrl,
    };

    schema
      .validate(data, { abortEarly: false })
      .then(() => {
        watchedState.form.errors = [];
        watchedState.form.valid = true;
        watchedState.uiState.validUrl.push(inputData);
        fetchAndProcessRSS(inputData);
      })
      .catch((error) => {
        watchedState.form.errors = error.errors[0];
        console.log('Validation Error:', error.message);
      });
  });

  const fetchAndProcessRSS = (feedUrl) => {
    let feeds;
    let posts;
    axios
      .get(
        `https://allorigins.hexlet.app/raw?disableCache=true&url=${encodeURIComponent(
          feedUrl,
        )}`,
      )
      .then((response) => {
        feeds = parseRSSFeed(response.data);
        posts = parseRSSPosts(response.data, state);
        setState(feeds, posts, watchedState);
      })
      .then(() => {
        renderPosts(i18n, elements, watchedState);
        renderFeeds(i18n, elements, watchedState);
        setTimeout(() => fetchAndProcessRSS(feedUrl), 5000);
        console.log(watchedState);
      })
      .catch((err) => {
        console.error('Error fetching or parsing RSS feed:', err);
      });
  };

  const setState = (feeds, posts, watchedState) => {
    watchedState.feedsList.push(feeds);
    watchedState.postsList = posts;
  };
};
