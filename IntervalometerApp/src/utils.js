export const pad = (num, size) => {
  num = num.toString();
  while (num.length < size) {
    num = '0' + num;
  }
  return num;
};

export const secondsToTimerString = (totalSeconds = 0) => {
  var hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  var minutes = Math.floor(totalSeconds / 60);
  var seconds = totalSeconds % 60;

  var ss = pad(seconds, 2);
  var mm = pad(minutes, 2);
  var hh = pad(hours, 2);
  return `${hh}h ${mm}m ${ss}s`;
};
