import onChange from 'on-change';

const renderForm = (elements, i18n) => {
  const updatedElements = { ...elements };
  updatedElements.container.innerHTML = '';
  const rowEl = document.createElement('div');
  rowEl.classList.add('row');
  const colEl = document.createElement('div');
  colEl.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'text-white');
  rowEl.append(colEl);
  const headingEl = document.createElement('h1');
  headingEl.classList.add('display-3', 'mb-0');
  headingEl.textContent = i18n.t('heading');
  colEl.append(headingEl);
  const paragElLead = document.createElement('p');
  paragElLead.classList.add('lead');
  paragElLead.textContent = i18n.t('textUnderHeading');
  colEl.append(paragElLead);
  const formRowEl = document.createElement('div');
  formRowEl.classList.add('row');
  const formColEl = document.createElement('div');
  formColEl.classList.add('col');
  const formFloatingEl = document.createElement('div');
  formFloatingEl.classList.add('form-floating');
  const inputEl = document.createElement('input');
  inputEl.setAttribute('id', 'url-input');
  inputEl.autofocus = true;
  inputEl.required = true;
  inputEl.setAttribute('name', 'url');
  inputEl.setAttribute('aria-label', 'url');
  inputEl.classList.add('form-control', 'w-100');
  inputEl.setAttribute('placeholder', i18n.t('placeHolder'));
  inputEl.setAttribute('autocomplete', 'off');
  const labelEl = document.createElement('label');
  labelEl.setAttribute('for', 'url-input');
  labelEl.textContent = 'Ссылка RSS';
  formFloatingEl.append(inputEl, labelEl);
  formColEl.append(formFloatingEl);
  const colAutoEl = document.createElement('div');
  colAutoEl.classList.add('col-auto');
  const buttonEl = document.createElement('button');
  buttonEl.setAttribute('type', 'submit');
  buttonEl.setAttribute('aria-label', 'add');
  buttonEl.classList.add('h-100', 'btn', 'btn-lg', 'btn-primary', 'px-sm-5');
  buttonEl.textContent = i18n.t('button');
  colAutoEl.append(buttonEl);
  formRowEl.append(formColEl, colAutoEl);
  const form = document.createElement('form');
  form.classList.add('rss-form', 'text-body');
  form.setAttribute('action', '');
  form.append(formRowEl);
  const exapmleEl = document.createElement('p');
  exapmleEl.classList.add('mt-2', 'mb-0', 'text-muted');
  exapmleEl.textContent = i18n.t('example');
  const feedbackEl = document.createElement('p');
  feedbackEl.classList.add(
    'feedback',
    'm-0',
    'position-absolute',
    'small',
    'text-danger',
  );
  colEl.append(form, exapmleEl, feedbackEl);
  updatedElements.container.append(rowEl);
};

const getFormElements = (elements) => {
  const updatedElements = { ...elements };
  updatedElements.fields.inputEl = document.querySelector('#url-input');
  updatedElements.errorFields.inputEl = document.querySelector('.feedback');
  updatedElements.validFields.inputEl = document.querySelector('.feedback');
  updatedElements.buttons.buttonEl = document.querySelector(
    'button[type="submit"]',
  );
};

const handleErrors = (elements, i18n, state) => {
  const updatedElements = { ...elements };
  if (state.form.errors.length === 0) {
    updatedElements.validFields.inputEl.textContent = i18n.t('success');
    updatedElements.validFields.inputEl.classList.add('text-success');
    updatedElements.validFields.inputEl.classList.remove('text-danger');
    updatedElements.fields.inputEl.classList.remove('is-invalid');
    document.querySelector('.rss-form').reset();
  } else {
    updatedElements.fields.inputEl.classList.add('is-invalid');
    updatedElements.errorFields.inputEl.textContent = i18n.t(state.form.errors);
    updatedElements.errorFields.inputEl.classList.remove('text-success');
    updatedElements.errorFields.inputEl.classList.add('text-danger');
  }
};

const handleProcessState = (elements, process, i18n) => {
  switch (process) {
    case 'filling':
      renderForm(elements, i18n);
      getFormElements(elements);
      break;
    case 'sending':
      elements.buttons.buttonEl.setAttribute('disabled', true);
      break;
    case 'success':
      elements.buttons.buttonEl.removeAttribute('disabled');
      break;
    case 'error':
      elements.buttons.buttonEl.removeAttribute('disabled');
      break;
    default:
      break;
  }
};

const initView = (elements, i18n, state) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'processLoading.status':
        handleProcessState(elements, value, i18n);
        break;
      case 'form.errors':
        handleErrors(elements, i18n, state);
        break;
      default:
        break;
    }
  });
  return watchedState;
};
export default initView;
