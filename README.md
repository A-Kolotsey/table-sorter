# table-sorter
A JavaScript module that sorts the contents of a table element.

### get started
```html
  <link href="./dist/table-sorter.css" rel="stylesheet" />
  <script type="module">
    import { tSortTrigger, tSortInit } from './dist/table-sorter.js';
    window.tSortTrigger = tSortTrigger; // Declaring a column sorting trigger globally
    tSortInit(); // Initializing all tables with a selector "table.sortable-table" or "table.sortable-table-autoinit"
    tSortInit('#m_table4'); // Init by element ID

    /* Init #m_table5 as DOM elemett */
    const mTable5 = document.getElementById('m_table5');
    tSortInit(mTable5);
    /* Init #m_table5 as DOM elemett */
  </script>
