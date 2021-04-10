import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Progress from '../common/Progress';
import useFetch from '../hooks/useFetch';
import CustomField from './CustomField';

function Demo(props) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  const { selectedField, setSelectedField } = props;

  const handler = (fields) => {
    setFields(fields.map(field => {
      const value = field.fieldType === 'Date' ? null : '';
      return {...field, value };
    }));
    setLoading(false);
  }

  const fieldId = selectedField ? selectedField.id : -1;
  const fieldType = selectedField ? selectedField.fieldType : '';

  useFetch('/fields/getById', handler, { fieldId, fieldType }, !Boolean(selectedField));

  if (!selectedField) {
    return null;
  }

  const content = loading ? <Progress loading={loading} /> : <CustomField fields={fields} setFields={setFields} />;

  return (
    <Dialog 
      open={Boolean(selectedField)} 
      onClose={() => setSelectedField(null)} 
      aria-labelledby="dialog-title">
      <DialogTitle id="dialog-title">Demo</DialogTitle>
      <DialogContent>
        {content}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setSelectedField(null)} 
          color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default Demo;
