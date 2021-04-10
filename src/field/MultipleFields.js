import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Snackbar from '../common/Snackbar';
import { useHistory } from 'react-router-dom';
import AddField from './AddField';
import CustomField from './CustomField';
import BackButton from '../common/BackButton';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    alignItems: 'center'
  },
  content: {
    flexDirection: 'column'
  },
  heading: {
    display: 'flex',
    marginBottom: theme.spacing(3),
    justifyContent: 'space-between'
  },
  header: {
    display: 'flex',
    alignItems: 'center'
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2)
  },
  container: {
    display: 'flex'
  },
  button: {
    marginTop: theme.spacing(2),
    alignSelf: 'flex-start'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  spacing: {
    marginBottom: theme.spacing(1)
  },
  name: {
    width: '300px',
    marginBottom: theme.spacing(2)
  },
  avatar: {
    width: '150px',
    height: '150px'
  },
  input: {
    backgroundColor: 'white'
  },
  mr: {
    marginRight: theme.spacing(1)
  },
  short: {
    width: '100px',
  },
  standard: {
    width: '204px',
  },
  fieldName: {
    marginBottom: theme.spacing(2)
  },
  backButton: {
    marginRight: theme.spacing(1)
  },
  buttons: {
    display: 'flex',
    alignItems: 'flex-end'
  },
  addButton: {
    marginLeft: theme.spacing(1)
  }
}));

function MultipleFields(props) {
  const [fields, setFields] = useState([]);
  const [showAddField, setShowAddField] = useState(false);
  const [message, setMessage] = useState('');

  const history = useHistory();
  const classes = useStyles();

  const { fieldName, setShowGroup } = props;

  const isDisabled = fields.length < 2;

  const insertField = async () => {
    const numberedFields = fields.map((field, i) => ({...field, fieldNumber: i + 1 }));
    const response = await client.postData('/fields/insert', { name: fieldName, fieldType: 'Multiple fields', fields: numberedFields });
    if (response.ok) {
      history.push('/fields', { message: 'Field created' });
    }
    else {
      setMessage('Something went wrong');
    }
  }

  if (showAddField) {
    return <AddField setShowAddField={setShowAddField} setFields={setFields} />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div className={classes.header}>
            <BackButton onClick={() => setShowGroup(false)} />
            <Typography variant="h4">Add multiple fields</Typography>
          </div>
        </div>
        <Typography className={classes.fieldName} variant="h6">{fieldName}</Typography>
        <div className={classes.container}>
          <CustomField fields={fields} setFields={setFields} />
          <Button
            className={classes.addButton}
            variant="contained"
            color="secondary"
            onClick={() => setShowAddField(true)}>Add field</Button>
        </div>
        <div className={classes.buttons}>
          <Button
            className={classes.backButton}
            onClick={() => setShowGroup(false)}
            color="primary">Back</Button>
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            disabled={isDisabled}
            onClick={insertField}>Save</Button>
        </div>
        <Snackbar message={message} setMessage={setMessage} />
      </div>
    </div>
  );
}

export default MultipleFields;
