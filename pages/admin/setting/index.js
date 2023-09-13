import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
    Box, List, ListItem, ListItemButton, ListItemText, Divider, TextField, IconButton, Backdrop, CircularProgress,
    Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import {
  Close, PhotoCamera,
} from '@mui/icons-material';
import Topbar from '@/components/topbar'
import Sidebar from '@/components/sidebar'
import { useRouter } from 'next/router';
import Store from 'store';
import axios from 'axios';
import {filter} from 'lodash';
import ModalImage from "react-modal-image";

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

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  let loop = 1
  const [loading, setLoading] = React.useState(false)
  // const [altText, handleChooseData] = React.useState('')
  const [dataBase, setDataBase] = React.useState([]);
  const [dataBaseLanguages, setDataBaseLanguages] = React.useState([]);
  const [dataBaseCurrencies, setDataBaseCurrencies] = React.useState([]);
  const [dataBaseThemes, setDataBaseThemes] = React.useState([]);

  const router = useRouter();
  React.useEffect(() => {
    if (!Store.get('auth')) {
      router.push('/admin/auth/login');
    } else {
      axios.post(`${process.env.NEXT_PUBLIC_API_APP}setting/list_setting_app`, {
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
        setDataBase(res?.data?.data?.setting_app)
        setDataBaseLanguages(res?.data?.data?.base_languages)
        setDataBaseCurrencies(res?.data?.data?.base_currencies)
        setDataBaseThemes(res?.data?.data?.base_themes)
      }).catch((res) => setLoading(false))
    } 
  }, [])

  const handleChooseData = (_index, _event) => {
    const _dataBase = dataBase
    _dataBase[eval(_index)].val_setting = _event?.target?.value
    _dataBase[eval(_index)].updated_by = Store.get('auth')?.username
    setDataBase([..._dataBase])
  }

  const submitData = (event) => {
    setLoading(true)
    event.preventDefault()
    const data = new FormData()
    data.append('token_login', Store.get('token'))
    data.append('data', JSON.stringify(dataBase))
    fetch(`${process.env.NEXT_PUBLIC_API_APP}setting/update_setting_app`, {
        method: 'POST',
        body: data,
    }).then((res) => res.json())
    .then((res) =>  {
      if (res?.error === 'Token is not valid!') {
        setLoading(false)
        Store.set('myInterval', 0);
        Store.remove('auth');
        Store.remove('token');
        Store.remove('api_key');
        alert('Token is not valid or User has been logged in other Device!')
        setTimeout(() => router.push('/admin/auth/login'), 500)
        return false
      }
      setTimeout(() => setLoading(false), 750)        
    }).catch((res) => setLoading(false))
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar />
      <Sidebar />
      <Main className='main'>
       <h1 style={{fontSize: '28px'}}><b>APP Setting</b> 
          <Button
            variant="contained"
            style={{float: 'right'}}
            onClick={submitData}>
            Save Setting
          </Button></h1>

       <Box style={{background: '#FFFFFF', marginTop: '20px', borderRadius: '10px'}}>
        
            <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                <TableRow style={{backgroundColor: '#E6EAEF'}}>
                    <TableCell><b>No.</b></TableCell>
                    <TableCell align="left"><b>Keys</b></TableCell>
                    <TableCell align="left"><b>Values</b></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                  {
                    dataBase?.map((item, index) => (
                      <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                          <TableCell component="th" scope="row">{loop++}</TableCell>
                        <TableCell align="left">
                          {item?.key_setting} 
                        </TableCell>
                        <TableCell align="left">
                          {(item?.id === "1") && (<TextField fullWidth variant="outlined" value={item?.val_setting} onChange={(e) => handleChooseData(index, e)}  />)}
                          {(item?.id === "2") && (<Select value={item?.val_setting} onChange={(e) => handleChooseData(index, e)}>
                            {
                              dataBaseLanguages?.map((item2) => (<MenuItem key={item2?.language_code} value={item2?.language_code}>({item2?.language_code}) {item2?.language_name}</MenuItem>))
                            }
                          </Select>)}
                          {(item?.id === "3") && (<Select value={item?.val_setting} onChange={(e) => handleChooseData(index, e)}>
                            {
                              dataBaseCurrencies?.map((item2) => (<MenuItem key={item2?.currency_code} value={item2?.currency_code}>({item2?.currency_symbol}) {item2?.currency_code} - {item2?.currency_name}</MenuItem>))
                            }
                          </Select>)} 
                          {(item?.id === "4") && (<Select value={item?.val_setting} onChange={(e) => handleChooseData(index, e)}>
                            {
                              dataBaseThemes?.map((item2) => (<MenuItem key={item2} value={item2}>{item2}</MenuItem>))
                            }
                          </Select>)} 
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
            </Table>
            </TableContainer>
       </Box>
      </Main>

          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress style={{color: '#0EAC40'}} thickness={7} size={100} variant="indeterminate" />
          </Backdrop>
    </Box>
  );
}