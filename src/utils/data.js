const reviver = (key, value, context) => {
  if (key.includes('_')) {
    const renamedKey = key.replace(/_[a-z]/g, (s) => s[1].toUpperCase());
    context[renamedKey] = value;
  }
  else {
    return value;
  }
}

const makeReviver = (parser) => {
  if (!parser) {
    return function(key, value) {
      return reviver(key, value, this);
    }
  }
  return function(key, value) {
    return reviver(key, parser(key, value), this);
  }
}

const dateParser = (key, value) => {
  if ((key === 'start_time' || key === 'end_time') && value !== null) {
    return new Date(value);
  }
  return value;
}

const defaultReviver = makeReviver();

const parse = async (response, reviver = defaultReviver) => {
  const text = await response.text();
  return JSON.parse(text, reviver);
}

const compare = (existingItems, updatedItems) => {
  const existingIds = existingItems.map(e => e.id);
  const updatedIds = updatedItems.map(u => u.id);
  const remove = existingItems.filter(e => !updatedIds.includes(e.id));
  const add = updatedItems.filter(u => !existingIds.includes(u.id));
  const update = [];
  for (const existingItem of existingItems) {
    let updated = false;
    const updatedItem = updatedItems.find(u => u.id === existingItem.id);
    if (!updatedItem) {
      continue;
    }
    const keys = Object.keys(existingItem);
    for (const key of keys) {
      if (existingItem[key] === undefined || updatedItem[key] === undefined) {
        continue;
      }
      if (existingItem[key] !== updatedItem[key]) {
        updated = true;
        break;
      }
    }
    if (updated) {
      update.push(updatedItem);
    }
  }
  return {
    remove,
    add,
    update
  };
}

const paramsHaveChanged = (params, previousParams) => {
  let hasChanged = false;
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const previousParam = previousParams[i];
    if (param instanceof Date) {
      if (param.getTime() !== previousParam.getTime()) {
        hasChanged = true;
        break;
      }
    }
    else {
      if (param !== previousParam) {
        hasChanged = true;
        break;
      }
    }
  }
  return hasChanged;
}

export {
  makeReviver,
  dateParser,
  parse,
  compare,
  paramsHaveChanged
};
