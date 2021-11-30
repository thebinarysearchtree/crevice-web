import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import styles from '../styles/list';
import ConfirmButton from '../common/ConfirmButton';
import Progress from '../common/Progress';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import IconButton from '@material-ui/core/IconButton';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Tooltip from '@material-ui/core/Tooltip';
import EditField from './EditField';
import { useClient } from '../auth';
import useFetch from '../hooks/useFetch';
import EditIcon from '@material-ui/icons/Edit';
import PageButtons from '../common/PageButtons';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles((theme) => ({
  ...styles(theme),
  fields: {
    display: 'flex',
    flexDirection: 'column'
  },
  field: {
    display: 'flex',
    padding: theme.spacing(2),
    justifyContent: 'space-between'
  },
  fieldDetails: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    marginRight: theme.spacing(1),
    alignItems: 'flex-start'
  },
  count: {
    flex: 1,
    marginRight: theme.spacing(1)
  },
  fieldType: {
    color: theme.palette.text.secondary
  },
  items: {
    flex: 2,
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1)
  },
  iconButton: {
    marginRight: theme.spacing(1)
  }
}));

function List() {
  const [fields, setFields] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [page, setPage] = useState(0);

  const classes = useStyles();
  const client = useClient();

  const { processing } = client;

  const rowsPerPage = 10;

  const sliceStart = page * rowsPerPage;
  const sliceEnd = sliceStart + rowsPerPage;

  const handleNewClick = (e) => {
    setSelectedField({
      id: -1,
      name: '',
      fieldType: '',
      selectItems: [],
      createdAt: new Date().toISOString(),
      userCount: 0
    });
  }

  const handlePageChange = (e, newPage) => {
    setPage(newPage);
  }

  const moveUp = async (index) => {
    if (index !== 0) {
      await client.postMutation({
        url: '/fields/moveUp',
        data: { fieldId: fields[index].id }
      });
    }
  }

  const deleteField = async (field) => {
    const { id: fieldId, fieldType } = field;
    await client.postMutation({
      url: '/fields/remove',
      data: { fieldId, fieldType },
      message: 'Field deleted'
    });
  }

  const loading = useFetch([{
    url: '/fields/find',
    handler: (fields) => setFields(fields)
  }]);

  if (loading) {
    return <Progress loading={loading} />;
  }

  const currentFields = fields.slice(sliceStart, sliceEnd);

  const fieldItems = currentFields.map((field, i) => {
    const { id, name, fieldType, selectItems, userCount } = field;
    const items = selectItems.map(i => i.name).join(' / ');
    let countText;
    if (userCount === 0) {
      countText = 'No users';
    }
    else if (userCount === 1) {
      countText = '1 user';
    }
    else {
      countText = `${userCount} users`;
    }
    return (
      <React.Fragment key={id}>
        <div className={classes.field}>
          <IconButton
            className={classes.iconButton}
            onClick={() => moveUp(i + sliceStart)}
            disabled={processing}>
              <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <div className={classes.fieldDetails}>
            <span className={classes.name} onClick={() => setSelectedField({...field})}>{name}</span>
            <span className={classes.fieldType}>{fieldType}</span>
          </div>
          <div className={classes.count}>{countText}</div>
          <div className={classes.items}>{items}</div>
          <ConfirmButton
            title={`Delete the ${name} field?`}
            content="This field will no long be visible on user's profiles or when creating new users."
            onClick={() => deleteField(field)} />
        </div>
        {i === currentFields.length - 1 ? null : <Divider />}
      </React.Fragment>
    );
  });

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div />
          <Button 
            variant="contained"
            color="secondary"
            onClick={handleNewClick}>New field</Button>
        </div>
        <Paper className={classes.fields}>
          {fieldItems}
        </Paper>
        <PageButtons 
          onBack={() => setPage(page => page - 1)}
          onForward={() => setPage(page => page + 1)}
          onBackToStart={() => setPage(0)}
          page={page}
          count={currentFields.length}
          itemsPerPage={10} />
        <EditField 
          selectedField={selectedField}
          setSelectedField={setSelectedField} />
      </div>
    </div>
  );
}

export default List;
