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

const addDays = (date, days) => {
  const updatedDate = new Date(date);
  updatedDate.setDate(updatedDate.getDate() + days);
  return updatedDate;
}

const makeAreaDate = (date, timeZone, addDays) => {
  if (!date) {
    return null;
  }
  const updatedDate = new Date(date);
  updatedDate.setHours(0, 0, 0, 0);
  if (addDays) {
    updatedDate.setDate(updatedDate.getDate() + addDays);
  }
  return makePgDate(updatedDate, timeZone);
}

export { 
  makePgDate,
  addDays,
  makeAreaDate 
};
