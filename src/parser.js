export const parseRSSPosts = (xmlData) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

  if (!xmlDoc) {
    throw new Error('Failed to parse XML document');
  }

  const items = xmlDoc.getElementsByTagName('item');

  const posts = [];
  for (let i = 0; i < items.length; i += 1) {
    const title = items[i].getElementsByTagName('title')[0]?.textContent || '';
    const description = items[i].getElementsByTagName('description')[0]?.textContent || '';
    const link = items[i].getElementsByTagName('link')[0]?.textContent || '';
    posts.push({ title, description, link });
  }

  return posts;
};

export const parseRSSFeed = (xmlData) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
  const channel = xmlDoc.querySelector('channel');
  const feedTitle = channel.querySelector('title').textContent;
  const feedDescrip = channel.querySelector('description').textContent;

  const feed = { feedTitle, feedDescrip };
  return feed;
};
