import onChange from 'on-change';

const renderModalWindow = (watchedState) => {
  const currentModalPost = watchedState.modalPostId;
  const headTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');

  headTitle.textContent = currentModalPost.title;
  modalBody.textContent = currentModalPost.desc;
  const buttnAlltext = document.querySelector('.modal-footer a');
  buttnAlltext.setAttribute('href', currentModalPost.link);
  const postLink = document.querySelector(`[data-id="${currentModalPost.id}"]`);
  postLink.classList.remove('fw-bold');
  postLink.classList.add('fw-normal', 'link-secondary');
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

  watchedState.posts.forEach((post) => {
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

    if (!post.isRead) {
      postLink.classList.add('fw-bold');
    } else {
      postLink.classList.remove('fw-bold');
      postLink.classList.add('fw-normal', 'link-secondary');
    }

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

const handleErrors = (elements, i18n, state) => {
  const updatedElements = { ...elements };
  if (state.form.valid && state.form.errors === null) {
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
    case 'sending':
      elements.buttons.buttonEl.setAttribute('disabled', true);
      elements.buttons.buttonEl.setAttribute('readonly', 'readonly');
      break;
    case 'success':
      elements.buttons.buttonEl.removeAttribute('disabled');
      elements.buttons.buttonEl.removeAttribute('readonly');
      elements.fields.inputEl.focus();

      renderPosts(i18n, elements, state);
      renderFeeds(i18n, elements, state);
      break;
    case 'error':
      elements.buttons.buttonEl.removeAttribute('disabled');
      elements.buttons.buttonEl.removeAttribute('readonly');

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
      case 'posts':
        renderPosts(i18n, elements, watchedState);
        break;
      case 'form.valid':
        handleErrors(elements, i18n, state);
        break;
      case 'modalPostId':
        renderModalWindow(watchedState);
        break;

      default:
        break;
    }
  });
  return watchedState;
};
export default initView;
