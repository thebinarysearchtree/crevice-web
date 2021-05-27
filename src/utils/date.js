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

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
}

const addDays = (date, days) => {
  const updatedDate = new Date(date);
  updatedDate.setDate(updatedDate.getDate() + days);
  return updatedDate;
}

const addMonths = (date, months) => {
  const updatedDate = new Date(date);
  updatedDate.setMonth(updatedDate.getMonth() + months);
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
  isWeekend,
  addDays,
  addMonths,
  makeAreaDate 
};
