const parseRSSData = (xmlData) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData.contents, 'text/xml');

  const errorMessage = xmlDoc.querySelector('parsererror');
  if (errorMessage) {
    const parsingError = new Error(errorMessage.textContent);
    parsingError.isParserError = true;
    throw parsingError;
  }

  const items = xmlDoc.getElementsByTagName('item');
  const channel = xmlDoc.querySelector('channel');

  let feedTitle = '';
  let feedDescrip = '';

  if (channel) {
    feedTitle = (channel.querySelector('title')?.textContent || '').trim();
    feedDescrip = (
      channel.querySelector('description')?.textContent || ''
    ).trim();
  }

  const parsedData = {
    feedTitle,
    feedDescrip,
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
