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
    Box, List, ListItem, ListItemButton, ListItemText, Divider, TextField, Backdrop, CircularProgress,
    Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
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
  const [open, setOpen] = React.useState(false);
  const [idSelected, setIdSelected] = React.useState(0);
  const [dataBase, setDataBase] = React.useState([]);
  const [dataSentence, setDataSentence] = React.useState({});
  const [dataSentences, setDataSentences] = React.useState('');
  const [dataBaseSelected, setDataBaseSelected] = React.useState('');

  const router = useRouter();
  React.useEffect(() => {
    if (!Store.get('auth')) {
      router.push('/admin/auth/login');
    } else {
      axios.post(`${process.env.NEXT_PUBLIC_API_APP}basedata/list_languages`, {
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
        setDataBase(res?.data?.data)
      })
    }    
  }, [])

  const submitData = () => {
    setLoading(true)
    const _data = []
    for (var key in dataSentences) {
      _data.push({
        'id': filter(dataBase?.setting_language, {'id_base_language': idSelected, 'id_base_language_sentence': key})[0]?.id || null,
        'id_base_language': idSelected,
        'id_base_language_sentence': key,
        'translated_text': dataSentences[key] || '',
        'updated_by': Store.get('auth')?.username
      })
    }
    
    axios.post(`${process.env.NEXT_PUBLIC_API_APP}setting/update_setting_language`, {
      token_login: Store.get('token'),
      data: JSON.stringify(_data)
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
      setDataBase(res?.data?.data)
      setOpen(false)
      setTimeout(() => setLoading(false), 1500)
    })
  }

  const handleDataShow = (id) => {
    const _dataSentences = {}
      dataBase?.base_language_sentences?.map((item, index) => {
        _dataSentences[item?.id] = filter(dataBase?.setting_language, {'id_base_language': id, 'id_base_language_sentence': item?.id})[0]?.translated_text 
      })
    setDataSentences(_dataSentences)
  }

  const handleDataChange = (id, e) => {
    const _dataSentences = dataSentences
    _dataSentences[id] = e.target.value
    setDataSentences({..._dataSentences})
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar />
      <Sidebar />
      <Main open={open} className='main'>
       <h1 style={{fontSize: '28px'}}><b>Language Management</b></h1>

       <Box style={{background: '#FFFFFF', marginTop: '20px', borderRadius: '10px'}}>
        
            <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                <TableRow style={{backgroundColor: '#E6EAEF'}}>
                    <TableCell><b>No.</b></TableCell>
                    <TableCell align="left"><b>Language Name</b></TableCell>
                    <TableCell align="left"><b>Language Key</b></TableCell>
                    <TableCell align="center"><b>Action</b></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                  {
                    dataBase?.base_languages?.map((item, index) => (
                      <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                          <TableCell component="th" scope="row">{loop++}</TableCell>
                          <TableCell align="left">{item?.language_name}</TableCell>
                          <TableCell align="left">{item?.language_code}</TableCell>
                          <TableCell align="center">
                            <Button onClick={() => {
                                  setOpen(true)
                                  setIdSelected(item?.id)
                                  setDataBaseSelected(item?.language_name)
                                  handleDataShow(item?.id)
                                }}>
                              Details
                            </Button>
                          </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
            </Table>
            </TableContainer>
       </Box>
      </Main>
      
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Settings of Language <b>{dataBaseSelected}</b>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" style={{minWidth: '500px'}}>
            <br/>
            {
              dataBase?.base_language_sentences?.map((item, index) => (
                <>
                  <TextField 
                    key={'text-'+index}
                    id="outlined-basic" 
                    label={item?.sentence} 
                    variant="outlined" 
                    fullWidth 
                    onChange={(e) => handleDataChange(item?.id, e)} 
                    value={dataSentences[item?.id]}
                    style={{marginBottom: '10px'}} 
                  />
                  <br/>
                </>
              ))
            }
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