import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';

function TableSortCell(props) {
  const { align, name, orderBy, order, onClick } = props;

  const active = orderBy === name;

  return (
    <TableCell 
      align={align}
      sortDirection={active ? order : false}>
        <TableSortLabel
          active={active}
          direction={active ? order : 'asc'}
          onClick={onClick}>{props.children}</TableSortLabel>
    </TableCell>
  );
}

export default TableSortCell;
