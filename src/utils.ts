export const hhmmss = (n: number): string => {
  const hours = Math.floor(n / 3600);
  let mins = '0' + Math.floor((n % 3600) / 60);
  let secs = '0' + Math.floor(n % 60);

  mins = mins.substr(mins.length - 2);
  secs = secs.substr(secs.length - 2);

  if (!isNaN(parseInt(secs))) {
    if (hours) {
      return hours + ':' + mins + ':' + secs;
    } else {
      return mins + ':' + secs;
    }
  } else {
    return '00:00';
  }
};

export const isObject = (value: unknown) => {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
};

const getSecondsToday = (): number => {
  const now: Date = new Date();
  // create an object using the current day/month/year
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff: number = now.valueOf() - today.valueOf(); // ms difference
  return Math.round(diff / 1000); // make seconds
};

export const getTimeStamp = () => {
  const seconds = getSecondsToday();
  const formatted = hhmmss(seconds);
  return [`%c[${formatted}]`, 'color: cyan;'];
};

export const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));
