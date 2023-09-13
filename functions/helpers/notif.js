import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Notif({type, message, isOpen=false}) {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  React.useEffect(() => {
    if (isOpen == true) {
        setOpen(true)
    }
  }, [isOpen])

  return (<>
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        {(type == 'success') ? <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          {message}
        </Alert> : (type == 'error') ? <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {message}
        </Alert> : (type == 'warning') ? <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
          {message}
        </Alert> : <Alert onClose={handleClose} severity="info" sx={{ width: '100%' }}>
          {message}
        </Alert>}
      </Snackbar>
    </Stack>
  </>);
}