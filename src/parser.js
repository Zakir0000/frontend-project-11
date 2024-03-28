import uniqueId from 'lodash/uniqueId.js';
const defaultId = uniqueId();

export const parseRSSPosts = (xmlData, state) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData.contents, 'text/xml');

  if (!xmlDoc) {
    throw new Error('Failed to parse XML document');
  }

  const items = xmlDoc.getElementsByTagName('item');

  const newPosts = [];
  for (let i = 0; i < items.length; i += 1) {
    const title = items[i].getElementsByTagName('title')[0]?.textContent || '';
    const description =
      items[i].getElementsByTagName('description')[0]?.textContent || '';
    const link = items[i].getElementsByTagName('link')[0]?.textContent || '';
    newPosts.push({
      title,
      description,
      link,
      feedId: defaultId,
      id: defaultId,
    });
  }

  if (!state.postsList.some((item) => item.id === newPosts.id)) {
    return newPosts;
  }
};

export const parseRSSFeed = (xmlData) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData.contents, 'text/xml');
  const channel = xmlDoc.querySelector('channel');

  const feedTitle = channel.querySelector('title').textContent;
  const feedDescrip = channel.querySelector('description').textContent;

  const feed = { id: defaultId, feedTitle, feedDescrip };
  return feed;
};

export const parseRSSFeedValidator = (data) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
  const items = xmlDoc.getElementsByTagName('item');
  return items.length > 0;
};
