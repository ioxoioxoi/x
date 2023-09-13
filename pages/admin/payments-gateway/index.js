import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
    Box, List, ListItem, ListItemButton, ListItemText, Divider, Button, TextField, Backdrop, CircularProgress,
    Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import Topbar from '@/components/topbar'
import Sidebar from '@/components/sidebar'
import { useRouter } from 'next/router';
import Store from 'store';
import axios from 'axios';
import {filter} from 'lodash';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false);
  const [idPG, setIdPG] = React.useState(0);
  const [pg, setPg] = React.useState([]);
  const [apiKey, setApiKey] = React.useState('');
  const [secretKey, setSecretKey] = React.useState('');
  const [merchantID, setMerchantID] = React.useState('');
  const [url, setURL] = React.useState('');
  const [pgSelected, setPgSelected] = React.useState('');
  // const [dataUpdate, setDataUpdate] = React.useState('');

  const router = useRouter();
  React.useEffect(() => {
    if (!Store.get('auth')) {
      router.push('/admin/auth/login');
    } else {
      axios.post(`${process.env.NEXT_PUBLIC_API_APP}setting/list_setting_pg`, {
        token_login: Store.get('token')
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      })
      .then((res) => {
        if (res?.data?.error === 'Token is not valid!') {
          setLoading(false)
          Store.set('myInterval', 0);
          Store.remove('auth');
          Store.remove('token');
          Store.remove('api_key');
          alert('Token is not valid or User has been logged in other Device!')
          setTimeout(() => router.push('/admin/auth/login'), 500)
          return false
        }
        setPg(res?.data?.data)
      })
    }    
  }, [])

  const submitData = () => {
    setLoading(true)
    axios.post(`${process.env.NEXT_PUBLIC_API_APP}setting/update_setting_pg`, {
      token_login: Store.get('token'),
      id: idPG,
      api_key: apiKey,
      secret_key: secretKey,
      merchant_id: merchantID,
      url: url,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    .then((res) => {
      if (res?.data?.error === 'Token is not valid!') {
        setLoading(false)
        Store.set('myInterval', 0);
        Store.remove('auth');
        Store.remove('token');
        Store.remove('api_key');
        alert('Token is not valid or User has been logged in other Device!')
        setTimeout(() => router.push('/admin/auth/login'), 500)
        return false
      }
      setPg([...res?.data?.data])
      setOpen(false)
      setTimeout(() => setLoading(false), 1500)
    })
  }

  const handleDataUpdate = (data) => {
    setApiKey(data?.api_key)
    setSecretKey(data?.secret_key)
    setMerchantID(data?.merchant_id)
    setURL(data?.url)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar />
      <Sidebar />
      <Main open={open} className='main'>
       <h1 style={{fontSize: '28px'}}><b>Payment Gateway Setting</b></h1>
       <Divider /><br />

       <h3><b>Production</b></h3>
       <Box style={{background: '#FFFFFF', marginTop: '20px', borderRadius: '10px'}}>
        <nav aria-label="secondary mailbox folders">
            <List>
              {
                filter(pg, ['is_production', '1'])?.map((item, index) => {
                  return (<>
                    <ListItem key={index}>
                      <ListItemText primary={item.name} />
                      <Button onClick={() => {
                            setOpen(true)
                            setIdPG(item?.id)
                            setPgSelected(`${item?.name} - Production`)
                            handleDataUpdate(pg[eval(item?.id-1)])
                          }}>
                        Details
                      </Button>
                    </ListItem>
                    {(index < filter(pg, ['is_production', '1']).length - 1) && <Divider />}
                  </>)
                })
              }
            </List>
        </nav>
       </Box>

        <br/><br/>
       <h3><b>Sandbox</b></h3>
       <Box style={{background: '#FFFFFF', marginTop: '20px', borderRadius: '10px'}}>
        <nav aria-label="secondary mailbox folders">
            <List>
              {
                filter(pg, ['is_production', '0'])?.map((item, index) => {
                  return (<>
                    <ListItem key={index}>
                      <ListItemText primary={item.name} />
                      <Button onClick={() => {
                            setOpen(true)
                            setIdPG(item?.id)
                            setPgSelected(`${item?.name} - Sandbox`)
                            handleDataUpdate(pg[eval(item?.id-1)])
                          }}>
                        Details
                      </Button>
                    </ListItem>
                    {(index < filter(pg, ['is_production', '1']).length - 1) && <Divider />}
                  </>)
                })
              }
            </List>
        </nav>
       </Box>
      </Main>
      
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Details of PG <b>{pgSelected}</b>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" style={{minWidth: '500px'}}>
            <br/>
            <TextField id="outlined-basic" label="API Key" variant="outlined" fullWidth onChange={(e) => setApiKey(e.target.value)} value={apiKey} style={{marginBottom: '10px'}} />
            <br/>
            <TextField id="outlined-basic" label="Secret Key" variant="outlined" fullWidth onChange={(e) => setSecretKey(e.target.value)} value={secretKey} style={{marginBottom: '10px'}} />
            <br/>
            <TextField id="outlined-basic" label="Merchant ID" variant="outlined" fullWidth onChange={(e) => setMerchantID(e.target.value)} value={merchantID} style={{marginBottom: '10px'}} />
            <br/><br/>
            <TextField id="outlined-basic" label="URL" variant="outlined" fullWidth onChange={(e) => setURL(e.target.value)} value={url} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={() => submitData()} autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>

          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress style={{color: '#0EAC40'}} thickness={7} size={100} variant="indeterminate" />
          </Backdrop>
    </Box>
  );
}