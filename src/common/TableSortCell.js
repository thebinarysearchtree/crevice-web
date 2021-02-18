import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';

function TableSortCell(props) {
  const { align, name, orderBy, order, onClick } = props;

  return (
    <TableCell 
      align={align}
      sortDirection={orderBy === name ? order : false}>
        <TableSortLabel
          active={orderBy === name}
          direction={orderBy === name ? order : 'asc'}
          onClick={onClick}>{props.children}</TableSortLabel>
    </TableCell>
  );
}

export default TableSortCell;
