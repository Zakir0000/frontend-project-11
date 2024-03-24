import onChange from 'on-change';

export default (elements, state) => {
  const { container, fields, errorFields, validFields } = elements;

  const renderForm = () => {
    const rowEl = document.createElement('div');
    rowEl.classList.add('row');
    const colEl = document.createElement('div');
    colEl.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'text-white');
    rowEl.append(colEl);
    const headingEl = document.createElement('h1');
    headingEl.classList.add('display-3', 'mb-0');
    headingEl.textContent = 'RSS агрегатор';
    colEl.append(headingEl);
    const paragElLead = document.createElement('p');
    paragElLead.classList.add('lead');
    paragElLead.textContent =
      'Начните читать RSS сегодня! Это легко, это красиво.';
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
    inputEl.setAttribute('placeholder', 'ссылка RSS');
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
    buttonEl.textContent = 'Добавить';
    colAutoEl.append(buttonEl);
    formRowEl.append(formColEl, colAutoEl);
    const form = document.createElement('form');
    form.classList.add('rss-form', 'text-body');
    form.setAttribute('action', '');
    form.append(formRowEl);
    const exapmleEl = document.createElement('p');
    exapmleEl.classList.add('mt-2', 'mb-0', 'text-muted');
    exapmleEl.textContent = 'Пример: https://lorem-rss.hexlet.app/feed';
    const feedbackEl = document.createElement('p');
    feedbackEl.classList.add(
      'feedback',
      'm-0',
      'position-absolute',
      'small',
      'text-danger',
    );
    colEl.append(form, exapmleEl, feedbackEl);
    container.append(rowEl);
  };

  const getFormElements = () => {
    fields.inputEl = document.querySelector('#url-input');

    errorFields.inputEl = document.querySelector('.feedback');
    validFields.inputEl = document.querySelector('.feedback');
  };

  const handleErrors = () => {
    if (state.form.errors.length === 0) {
      validFields.inputEl.textContent = 'RSS успешно загружен';
      validFields.inputEl.classList.add('text-success');
      validFields.inputEl.classList.remove('text-danger');
      fields.inputEl.classList.remove('is-invalid');
      document.querySelector('.rss-form').reset();
    } else {
      fields.inputEl.classList.add('is-invalid');

      errorFields.inputEl.textContent = state.form.errors;

      errorFields.inputEl.classList.remove('text-success');
      errorFields.inputEl.classList.add('text-danger');
    }
  };

  const watchedState = onChange(state, (path, value, prevValue) => {
    switch (path) {
      case 'form.status':
        renderForm();
        getFormElements();
        break;
      case 'form.errors':
        handleErrors();
        break;
      default:
        break;
    }
  });

  return watchedState;
};
