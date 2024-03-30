const parseRSSData = (xmlData) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData.contents, 'text/xml');

  if (!xmlDoc) {
    throw new Error(`${xmlDoc.querySelector('parsererror')}`);
  }

  const items = xmlDoc.getElementsByTagName('item');
  const channel = xmlDoc.querySelector('channel');
  const feedTitle = channel.querySelector('title').textContent;
  const feedDescrip = channel.querySelector('description').textContent;

  const parsedData = {
    feed: { feedTitle, feedDescrip },
    posts: [],
  };

  for (let i = 0; i < items.length; i += 1) {
    const title = items[i].getElementsByTagName('title')[0]?.textContent || '';
    const desc = items[i].getElementsByTagName('description')[0]?.textContent || '';
    const link = items[i].getElementsByTagName('link')[0]?.textContent || '';
    parsedData.posts.push({
      title,
      desc,
      link,
    });
  }
  return parsedData;
};

export default parseRSSData;
