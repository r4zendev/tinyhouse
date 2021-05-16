const query = {
  page: 2,
  sort: { begin_at: 1, ruin: -1 },
  begin_at: { filter: 152 },
  hp: { range: [15, 250] },
  name: { search: 'fazz' },
};

let finalQuery = '';
for (const [field, value] of Object.entries(query)) {
  if (field === 'page') {
    finalQuery += `&page=${value}`;
  } else if (field === 'sort') {
    if (value) {
      const sorts = Object.entries(value).reduce(
        (accum, [field, sortParam]) =>
          (accum += (sortParam === -1 ? `-${field}` : field) + ','),
        '',
      );
      finalQuery += `&sort=${sorts}`;
    }
  } else {
    const filters = query[field];
    if (filters) {
      for (const [filter, fValue] of Object.entries(filters)) {
        finalQuery += `&${filter}[${field}]=${fValue.toString()}`;
      }
    }
  }
}
console.log(finalQuery);
