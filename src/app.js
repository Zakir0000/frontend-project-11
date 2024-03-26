import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';

import './styles.css';
import resources from './locales/index.js';

export default () => {
  const elements = {
    container: document.querySelector('.container-fluid'),
    postsContainer: document.querySelector('.posts'),
    fields: {},
    errorFields: {},
    validFields: {},
  };

  const defaultLang = 'ru';

  const state = {
    form: {
      status: null,
      valid: false,
      errors: [],
    },
    uiState: {
      validUrl: [],
    },
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
    .test('is-rss-feed', i18n.t('errors.validation.rss'), (value) => new Promise((resolve) => {
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
    }));

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
      .validate(data)
      .then(() => {
        watchedState.form.errors = [];
        watchedState.form.valid = true;
        watchedState.uiState.validUrl.push(inputData);
        console.log('URL is valid:', inputData);
        fetchRSSFeedPosts(inputData);
      })
      .catch((error) => {
        watchedState.form.errors = error.message;
        console.log('Validation Error:', error.message);
      });
  });

  const fetchRSSFeedPosts = (feedUrl) => {
    axios
      .get(
        `https://api.allorigins.win/raw?disableCache=true&url=${encodeURIComponent(
          feedUrl,
        )}`,
      )
      .then((response) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, 'text/xml');
        const items = xmlDoc.getElementsByTagName('item');
        const posts = [];
        for (let i = 0; i < items.length; i++) {
          const title = items[i].getElementsByTagName('title')[0].textContent;
          const description =
            items[i].getElementsByTagName('description')[0].textContent;
          posts.push({ title, description });
        }
        renderPosts(posts);
      })
      .catch((err) => {
        console.error('Error fetching RSS feed:', err);
      });
  };

  const renderPosts = (posts) => {
    elements.postsContainer.innerHTML = '';
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = i18n.t('postsHeader');
    cardBody.append(cardTitle);
    const ul = document.createElement('ul');
    card.append(cardBody, ul);
    ul.classList.add('list-group', 'border-0', 'rounded-0');

    elements.postsContainer.append(card);
    posts.forEach((post) => {
      const postElement = document.createElement('div');
      postElement.classList.add('post');
      postElement.innerHTML = `
      <h2>${post.title}</h2>
      <p>${post.description}</p>
      `;
      card.appendChild(postElement);
    });
  };
};
