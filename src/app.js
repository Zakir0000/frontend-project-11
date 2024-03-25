import watch from './view.js';
import i18next from 'i18next';
import * as yup from 'yup';
import './styles.css';
import resources from './locales/index.js';

export default () => {
  const elements = {
    container: document.querySelector('.container-fluid'),
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
    loadingProcess: true,
    uiState: {
      seenPosts: [],
      listOfFeeds: [],
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
      uniqueUrl: () => i18n.t('errors.validation.uniqueUrl'),
    },
  });

  const watchedState = watch(elements, state, i18n);
  watchedState.form.status = 'filling';

  const urlValidator = yup.string().url();

  /* eslint-disable */
  const validateUniqueUrl = (urls) => {
    return yup.string().test({
      name: 'unique-url',
      test: function (value) {
        if (!value) return true;
        return !urls.includes(value);
      },
      message: i18n.t('errors.validation.uniqueUrl'),
    });
  };

  const schema = yup.object().shape({
    url: urlValidator,
    otherUrls: yup.array().of(validateUniqueUrl(state.uiState.listOfFeeds)),
  });

  document.querySelector('.rss-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputData = document.getElementById('url-input').value;
    const data = {
      url: inputData,
      otherUrls: state.uiState.listOfFeeds,
    };

    schema
      .validate(data, { abortEarly: false })
      .then((validData) => {
        watchedState.form.errors = [];
        watchedState.form.valid = true;
        watchedState.uiState.listOfFeeds.push(inputData);
        console.log(state);
      })
      .catch((error) => {
        watchedState.form.errors = error.errors[0];
        console.log(error.message);
      });
  });
};
