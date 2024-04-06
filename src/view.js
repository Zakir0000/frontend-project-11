import onChange from 'on-change';

const renderModalWindow = (post) => {
  const modalHeader = document.querySelector('.modal-header');
  const modalBody = document.querySelector('.modal-body');
  const headTitle = document.createElement('h5');
  headTitle.classList.add('modal-title');
  headTitle.textContent = post.title;
  modalHeader.innerHTML = '';
  modalBody.innerHTML = '';
  const closeBtn = document.createElement('button');
  closeBtn.classList.add('btn-close', 'close');
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('data-bs-dismiss', 'modal');
  closeBtn.setAttribute('aria-label', 'Close');
  modalHeader.prepend(headTitle, closeBtn);
  modalBody.textContent = post.desc;
};

const renderPosts = (i18n, elements, watchedState) => {
  const updatedElements = { ...elements };
  updatedElements.postsContainer.innerHTML = '';
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('postsHeader');
  cardBody.prepend(cardTitle);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  card.prepend(cardBody, ul);

  updatedElements.postsContainer.prepend(card);

  watchedState.ui.seenPosts.forEach((post) => {
    const postElement = document.createElement('li');
    postElement.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    const postLink = document.createElement('a');
    postLink.setAttribute('href', post.link);
    postLink.classList.add('fw-bold');
    postLink.setAttribute('data-id', post.id);
    postLink.setAttribute('target', '_blank');
    postLink.setAttribute('rel', 'noopener noreferrer');
    postLink.textContent = post.title;
    const buttonEl = document.createElement('button');
    buttonEl.setAttribute('type', 'button');
    buttonEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    buttonEl.setAttribute('data-id', post.id);
    buttonEl.setAttribute('data-bs-toggle', 'modal');
    buttonEl.setAttribute('data-bs-target', '#modal');
    buttonEl.textContent = i18n.t('view');
    postElement.prepend(postLink, buttonEl);
    ul.append(postElement);
    buttonEl.addEventListener('click', (e) => {
      e.preventDefault();

      const buttnAlltext = document.querySelector('.modal-footer a');
      buttnAlltext.setAttribute('href', post.link);
      renderModalWindow(post);
      postLink.classList.remove('fw-bold');
      postLink.classList.add('fw-normal');
    });
    postLink.addEventListener('click', () => {
      postLink.classList.remove('fw-bold');
      postLink.classList.add('fw-normal', 'link-secondary');
    });
  });
};

const renderFeeds = (i18n, elements, watchedState) => {
  const updatedElements = { ...elements };
  updatedElements.feedsContainer.innerHTML = '';
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('feedsHeader');
  cardBody.append(cardTitle);
  card.append(cardBody);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  card.append(cardBody, ul);
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  watchedState.feedsList.forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedHead = document.createElement('h3');
    feedHead.classList.add('h6', 'm-0');
    feedHead.textContent = item.feedTitle;
    const feedParag = document.createElement('p');
    feedParag.classList.add('m-0', 'small', 'text-black-50');
    feedParag.textContent = item.feedDescrip;
    li.append(feedHead, feedParag);
    ul.append(li);
    card.append(ul);
  });
  updatedElements.feedsContainer.append(card);
};

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
  updatedElements.validationMessage.inputEl = document.querySelector('.feedback');
  updatedElements.validationMessage.inputEl = document.querySelector('.feedback');
  updatedElements.buttons.buttonEl = document.querySelector(
    'button[type="submit"]',
  );
};

const handleErrors = (elements, i18n, state) => {
  const updatedElements = { ...elements };
  if (state.form.valid) {
    updatedElements.validationMessage.inputEl.textContent = i18n.t('success');
    updatedElements.validationMessage.inputEl.classList.add('text-success');
    updatedElements.validationMessage.inputEl.classList.remove('text-danger');
    updatedElements.fields.inputEl.classList.remove('is-invalid');
    document.querySelector('.rss-form').reset();
  } else {
    updatedElements.fields.inputEl.classList.add('is-invalid');
    updatedElements.validationMessage.inputEl.textContent = i18n.t(
      state.form.errors,
    );
    updatedElements.validationMessage.inputEl.classList.remove('text-success');
    updatedElements.validationMessage.inputEl.classList.add('text-danger');
  }
};

const handleProcessState = (elements, process, i18n, state) => {
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
      renderPosts(i18n, elements, state);
      renderFeeds(i18n, elements, state);
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
        handleProcessState(elements, value, i18n, watchedState);
        break;
      case 'form.errors':
        handleErrors(elements, i18n, watchedState);
        break;
      case 'ui.seenPosts':
        renderPosts(i18n, elements, watchedState);
        break;
      case 'form.valid':
        handleErrors(elements, i18n, state);
        break;

      default:
        break;
    }
  });
  return watchedState;
};
export default initView;
