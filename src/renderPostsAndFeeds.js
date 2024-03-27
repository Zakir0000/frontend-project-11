import uniqueId from 'lodash/uniqueId.js';

/* eslint-disable */
export const renderPosts = (i18n, elements, watchedState) => {
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
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  card.append(cardBody, ul);
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  elements.postsContainer.append(card);
  const modalHeader = document.querySelector('.modal-header');
  const modalBody = document.querySelector('.modal-body');

  watchedState.postsList.forEach((post) => {
    const uniqId = uniqueId();
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
    postLink.setAttribute('data-id', uniqId);
    postLink.setAttribute('target', '_blank');
    postLink.setAttribute('rel', 'noopener noreferrer');
    postLink.textContent = post.title;
    const buttonEl = document.createElement('button');
    buttonEl.setAttribute('type', 'button');
    buttonEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    buttonEl.setAttribute('data-id', uniqId);
    buttonEl.setAttribute('data-bs-toggle', 'modal');
    buttonEl.setAttribute('data-bs-target', '#modal');
    buttonEl.textContent = 'Просмотр';
    postElement.append(postLink, buttonEl);
    ul.appendChild(postElement);
    buttonEl.addEventListener('click', (e) => {
      e.preventDefault();
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

      modalHeader.append(headTitle, closeBtn);
      modalBody.textContent = post.description;
      postLink.classList.remove('fw-bold');
      postLink.classList.add('fw-normal');
    });
    postLink.addEventListener('click', (e) => {
      postLink.classList.remove('fw-bold');
      postLink.classList.add('fw-normal', 'link-secondary');
    });
  });
};

export const renderFeeds = (i18n, elements, watchedState) => {
  elements.feedsContainer.innerHTML = '';
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
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'border-0', 'border-end-0');
  const feedHead = document.createElement('h3');
  feedHead.classList.add('h6', 'm-0');
  feedHead.textContent = watchedState.feedsList[0].feedTitle;
  const feedParag = document.createElement('p');
  feedParag.classList.add('m-0', 'small', 'text-black-50');
  feedParag.textContent = watchedState.feedsList[0].feedDescrip;
  li.append(feedHead, feedParag);
  ul.append(li);
  card.append(ul);

  elements.feedsContainer.append(card);
};
