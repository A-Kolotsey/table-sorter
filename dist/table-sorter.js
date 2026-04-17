/*
 * git     : https://github.com/A-Kolotsey/table-sorter
 * product : Table Sorter
 * version : 0.0.1 
 * author  : Aleksey Kolotsey
 */

function applySortedRows(sTableBody, sortedRows) {
  // The order of methods: from the most effective to the least effective
  const methods = [
    {
      name: 'DocumentFragment',
      test: () => typeof document.createDocumentFragment === 'function',
      execute: () => {
        try {
          const fragment = document.createDocumentFragment();
          sortedRows.forEach(row => fragment.appendChild(row));
          sTableBody.innerHTML = '';
          sTableBody.appendChild(fragment);
          return true;
        } catch (e) {
          console.warn('DocumentFragment method failed:', e.message);
          return false;
        }
      }
    },
    {
      name: 'ReplaceChildren',
      test: () => typeof sTableBody.replaceChildren === 'function',
      execute: () => {
        try {
          sTableBody.replaceChildren(...sortedRows);
          return true;
        } catch (e) {
          console.warn('ReplaceChildren method failed:', e.message);
          return false;
        }
      }
    },
    {
      name: 'ReplaceChild (batch)',
      test: () => typeof sTableBody.replaceChild === 'function',
      execute: () => {
        try {
          // We are working with a copy of the array so as not to mutate the original one.
          const rowsToReplace = Array.from(sTableBody.rows);
          for (let i = 0; i < Math.min(rowsToReplace.length, sortedRows.length); i++) {
            if (rowsToReplace[i] !== sortedRows[i]) {
              sTableBody.replaceChild(sortedRows[i], rowsToReplace[i]);
            }
          }
          // If there are more sorted rows, add the remaining ones.
          for (let i = rowsToReplace.length; i < sortedRows.length; i++) {
            sTableBody.appendChild(sortedRows[i]);
          }
          return true;
        } catch (e) {
          console.warn('ReplaceChild method failed:', e.message);
          return false;
        }
      }
    },
    {
      name: 'Clear and Append',
      test: () => true, // Always supported
      execute: () => {
        try {
          const currentRows = Array.from(sTableBody.rows);
          currentRows.forEach(row => sTableBody.removeChild(row));
          if (typeof sTableBody.append === 'function') {
            sTableBody.append(...sortedRows);
          } else {
            for (const row of sortedRows) {
              sTableBody.appendChild(row);
            }
          }
          return true;
        } catch (e) {
          console.warn('Clear and Append method failed:', e.message);
          return false;
        }
      }
    }
  ];

  let success = false;
  let attemptedMethods = [];

  for (const method of methods) {
    attemptedMethods.push(method.name);
    if (!method.test()) {
      console.log(`Method "${method.name}" not supported by browser, skipping...`);
      continue;
    }
    // console.log(`Attempting method: ${method.name}`);
    success = method.execute();
    if (success) { break; }
  }

  if (!success) {
    throw new Error(
      `All methods failed. Attempted: ${attemptedMethods.join(', ')}. ` +
      'Consider reducing table size or checking for DOM conflicts.'
    );
  }
}

export function tSortTrigger(e) {
  const sCol = e?.event?.target ?? e?.target ?? e;
  if (sCol) {
    tSort(sCol);
  } else {
    console.error(`Couldn't get the calling context.\n The call format should be tSortTrigger(this) or tSortTrigger(self)`);
    return;
  }
}

function tSort(sCol) {
  const sTable = sCol.closest('table');
  const sTableBody = sTable.tBodies[0];
  const sColDataset = sCol.dataset;
  let { cell = sCol.cellIndex, order = 1, type = 'text' } = sColDataset ?? {};
  cell = parseInt(cell);
  function toType(cellVal, type) {
    let result = NaN;
    let val = cellVal.dataset.sort_value ?? cellVal.innerHTML;
    if (type === 'number') {
      result = parseFloat(val);
    }
    if (type === 'text') {
      result = (val).toString();
    }
    return isNaN(result) ? val : result;
  }
  let sortedRows = Array.from(sTableBody.rows);
  if (order !== 'ascending') {
    order = 'ascending';
  } else {
    order = 'descending';
  }
  [...sTable.tHead.rows[0].cells].forEach(el => { el.dataset.order = 'none'; });
  sColDataset.order = order;
  if (order === 'ascending') {
    sortedRows = sortedRows.sort((rowA, rowB) => toType(rowA.cells[cell], type) > toType(rowB.cells[cell], type) ? 1 : -1);
  } else {
    sortedRows = sortedRows.sort((rowA, rowB) => toType(rowA.cells[cell], type) < toType(rowB.cells[cell], type) ? 1 : -1);
  }
  applySortedRows(sTableBody, sortedRows);
}

function tSortInitTarget(target) {
  if (!(target instanceof Element) || target.tagName !== 'TABLE') {
    console.error('The passed element is not a table element (<table>).', target);
    return;
  }
  const sTable = target;
  let triggerAll = sTable.classList.contains('sortable-table-autoinit');
  let cols = [];
  if (triggerAll) {
    cols = [...sTable.tHead.rows[0].cells];
  } else {
    cols = sTable.querySelectorAll('th.sortable-table-trigger');
    if (cols.length === 0) {
      cols = [...sTable.tHead.rows[0].cells];
      sTable.classList.add('sortable-table-autoinit');
    }
  }
  cols.forEach(el => {
    el.addEventListener('click', event => { tSortTrigger(event); });
  });
  if (!sTable.classList.contains('sortable-table')) {
    sTable.classList.add('sortable-table');
  }
}

export function tSortInit(target) {
  if (target instanceof Element) {
    tSortInitTarget(target);
    return;
  }
  if (!target || target.length === 0) {
    target = "table.sortable-table,table.sortable-table-autoinit";
  }
  if (typeof target === 'string') {
    let elements = document.querySelectorAll(target);
    if (elements && elements.length > 0) {
      elements.forEach(element => {
        tSortInitTarget(element);
      });
    } else {
      console.warn(`The elements with selector "${target}" were not found.`);
    }
    return;
  }
}

