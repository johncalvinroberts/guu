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
