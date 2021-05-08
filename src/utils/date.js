const makePgDate = (date, timeZone) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const second = '00';

  const datePart = `${year}-${month}-${day}`;
  const timePart = `${hour}:${minute}:${second}`;

  return `${datePart} ${timePart} ${timeZone}`;
}

export { makePgDate };
