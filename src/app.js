import * as yup from 'yup';
import watch from './view.js';
import './styles.css';

export default () => {
  const elements = {
    container: document.querySelector('.container-fluid'),
    fields: {},
    errorFields: {},
    validFields: {},
  };

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

  const watchedState = watch(elements, state);
  watchedState.form.status = 'filling';

  const urlValidator = yup.string().url('Ссылка должна быть валидным URL');

  /* eslint-disable */
  const validateUniqueUrl = (urls) => {
    return yup.string().test({
      name: 'unique-url',
      message: 'RSS уже существует',
      test: function (value) {
        if (!value) return true;
        return !urls.includes(value);
      },
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
