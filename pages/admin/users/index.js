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
    Box, Grid, Switch, List, ListItem, ListItemButton, ListItemText, Divider, TextField, IconButton, Backdrop, CircularProgress,
    Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormControl, InputLabel, OutlinedInput, InputAdornment
} from '@mui/material';
import {
  Close, VisibilityOff, Visibility
} from '@mui/icons-material';
import Topbar from '@/components/topbar'
import Sidebar from '@/components/sidebar'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DataGrid } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import Store from 'store';
import axios from 'axios';
import moment from 'moment';
import {number_format} from '@/functions/helpers/general'
import { conforms } from 'lodash';

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

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
  }));

export default function PersistentDrawerLeft() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false)
    const [generalProfit, setGeneralProfit] = React.useState('0.03')
    const [openDialog, setOpenDialog] = React.useState(false)
    const [openDialogDetail, setOpenDialogDetail] = React.useState(false)
    const [dataBase, setDataBase] = React.useState([]);
    const [dataBaseTop, setDataBaseTop] = React.useState([]);
    const [dataUser, setDataUser] = React.useState({});
    const [showPassword, setShowPassword] = React.useState(true);
    const [isEditBalance, setIsEditBalance] = React.useState(false);
    const [newPassword, setNewPassword] = React.useState('');
    const [newBalance, setNewBalance] = React.useState('');

    const columns = [
      { field: 'no', headerName: 'No.', width: 70},
      { field: 'username', headerName: 'Username', width: 100 },
      { field: 'email', headerName: 'Email', width: 250 },
      {
        field: 'total_order',
        headerName: 'Total Order (Times)',
        width: 200,
        renderCell: (comp) => number_format(comp?.value)
      },
      {
        field: 'total_amount',
        headerName: 'Total Order (Amount) ('+Store.get('dataCurrency')?.currency_symbol+')',
        width: 200,
        renderCell: (comp) => number_format(comp?.value)
      },
      // {
      //   field: 'fullName',
      //   headerName: 'Full name',
      //   description: 'This column has a value getter and is not sortable.',
      //   sortable: false,
      //   width: 160,
      //   valueGetter: (params) =>
      //     `${params.row.firstName || ''} ${params.row.lastName || ''}`,
      // },
    ];
  
    const columns2 = [
      { field: 'no', headerName: 'No.', width: 70},
      { field: 'username', headerName: 'Username', width: 150 },
      { field: 'email', headerName: 'Email', width: 350 },
      {
        field: 'total_order',
        headerName: 'Total Order (Times)',
        type: 'number',
        width: 200,
        renderCell: (comp) => number_format(comp?.value)
      },
      {
        field: 'weekly_order',
        headerName: 'Weekly Order (Times)',
        type: 'number',
        width: 200,
        renderCell: (comp) => number_format(comp?.value)
      },
      {
        field: 'user_saldo',
        headerName: 'Balance',
        type: 'number',
        width: 150,
        renderCell: (comp) => number_format(comp?.value)
      },
      {
        field: 'created_date',
        headerName: 'Register Date',
        width: 300,
        renderCell: (comp) => moment(comp?.value).format('ddd, DD MMMM YYYY - HH:mm:ss')
      },
      { field: 'action', headerName: 'Action', width: 150, 
      renderCell: (comp) => {
          return (
         <Button onClick={() => openDetail(comp)}>Detail</Button>
      )}},
    ];

  const openDetail = (dataX) => {
    console.log(dataX.row)
    setDataUser(dataX?.row)
    setOpenDialogDetail(true)
  }

  React.useEffect(() => {
    if (!Store.get('auth')) {
      router.push('/admin/auth/login');
    } else {
      axios.post(`${process.env.NEXT_PUBLIC_API_APP}users/top5`, {
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
        const _dataBaseTop = []
        let loop = 1
        res?.data?.data?.top?.map(_data => {
            _data['no'] = loop++
            _data['total_order'] = number_format(_data['total_order'])
            _dataBaseTop.push(_data)
        })
        setDataBaseTop(_dataBaseTop)

        const _dataBase = []
        let loop2 = 1
        res?.data?.data?.users?.map(_data => {
            _data['no'] = loop2++
            _data['total_order'] = number_format(_data['total_order'])
            _data['weekly_order'] = number_format(_data['weekly_order'])
            _data['user_saldo'] = Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(_data['user_saldo'])
            _dataBase.push(_data)
        })
        setDataBase(_dataBase)
      })
    } 
  }, [])

  const submitData = (event, id, profit, is_active=undefined) => {
      setLoading(true)
      event.preventDefault()
      const data = new FormData()
      data.append('token_login', Store.get('token'))
      data.append('updated_by', Store.get('auth')?.username)
      data.append('id', id)
      if (typeof profit === 'object' && profit !== null) {
        data.append('profit', profit.target.value)
      } else {
        data.append('profit', profit)
      }
      if (is_active) {
        data.append('is_active', is_active)
      }
      fetch(`${process.env.NEXT_PUBLIC_API_APP}service/update_price`, {
          method: 'POST',
          body: data,
      }).then((res) => res.json())
      .then((res) =>  {
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
        setLoading(false)
        setDataBase(res?.data)
        setOpenDialog(false)
        setGeneralProfit('0.03')
        // setTimeout(() => setLoading(false), 100)        
      })
  }

  const handleChangePassword = (dataUser) => {
    if (newPassword != '') {
      const x = confirm('Are you sure you want to Change Password?')
      if (x) {
        setOpenDialogDetail(false)
        setLoading(true)
        const data = new FormData()
        data.append('token_login', Store.get('token'))
        data.append('id', dataUser?.id_user)
        data.append('password', newPassword)
        fetch(`${process.env.NEXT_PUBLIC_API_APP}users/change_password`, {
            method: 'POST',
            body: data,
        }).then((res) => res.json())
        .then((res) =>  {
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
          setNewPassword('')
          setTimeout(() => {
            setLoading(false)
            setOpenDialogDetail(true)
          }, 1500)            
        })
      }
    }
  }

  const handleAddBalance = (dataUser) => {
    if (newBalance != '') {
      const x = confirm('Are you sure you want to Add New Balance?')
      if (x) {
        setOpenDialogDetail(false)
        setLoading(true)
        const data = new FormData()
        data.append('token_login', Store.get('token'))
        data.append('id_user', dataUser?.id_user)
        data.append('amount', newBalance)
        fetch(`${process.env.NEXT_PUBLIC_API_FINANCE}topup/create_bonus_topup`, {
            method: 'POST',
            body: data,
        }).then((res) => res.json())
        .then((res) =>  {
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
          const _dataUser = dataUser
          _dataUser.user_saldo = Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(parseFloat(eval(_dataUser.user_saldo.split(' ')[1].replace(",", "")) + eval(newBalance)).toFixed(2))
          setDataUser({..._dataUser})
          
          const _dataBase = []
          dataBase?.map(_data => {
            if (_data['id_user'] === dataUser?.id_user) {
              _data['user_saldo'] = _dataUser.user_saldo
            }
              _dataBase.push(_data)
          })
          setDataBase([..._dataBase])

          setNewBalance('')
          setTimeout(() => {
            setLoading(false)
            setOpenDialogDetail(true)
          }, 1500)           
        })
      }
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar />
      <Sidebar />
      <Main className='main'>
       <h1 style={{fontSize: '28px'}}>
        <b>User Management</b>
        
        <span style={{float: 'right'}}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker />
            </LocalizationProvider>
        </span>
       </h1>

       <Box style={{marginTop: '50px'}}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Item style={{padding: '20px'}}>
                      <b>Graph</b>
                      <span style={{float: 'right', marginTop: '-5px', marginLeft: '5px', cursor: 'pointer'}}>...</span>
                    </Item>
                </Grid>
                <Grid item xs={6}>
                    <Item style={{padding: '20px'}}>
                      <b>Top 5 User Performance by Order</b>
                      <span style={{float: 'right', marginTop: '-5px', marginLeft: '5px', cursor: 'pointer'}}>...</span>
                      <span style={{marginTop: '20px', fontSize: '28px', fontWeight: 'bold'}}>
                        <DataGrid
                            getRowId={(row) => row.id_user}
                            rows={dataBaseTop}
                            columns={columns}
                            initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 10 },
                            },
                            }}
                            pageSizeOptions={[10, 20]}
                        />
                      </span>
                    </Item>
                </Grid>
            </Grid>
        </Box>

        <br/>

       <Box style={{marginTop: '20px'}}>
            <Paper>
                <DataGrid
                    getRowId={(row) => row.id_user}
                    rows={dataBase}
                    columns={columns2}
                    initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                    }}
                    pageSizeOptions={[10, 20]}
                    // checkboxSelection
                />
            </Paper>
       </Box>
      </Main>
        <Dialog
            aria-labelledby="customized-dialog-title"
            open={openDialog}
          >
            <DialogTitle sx={{ m: 0, p: 2 }}>
              Update All Profit
              <IconButton
                aria-label="close"
                onClick={() => setOpenDialog(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <br/>
              <TextField fullWidth label="Alt Text" variant="outlined" value={generalProfit} onChange={(e) => setGeneralProfit(e.target.value)}  />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button variant='contained' onClick={(e) => submitData(e, 0, generalProfit)} autoFocus>
                Save
              </Button>
            </DialogActions>
          </Dialog>

          
        <Dialog
            aria-labelledby="customized-dialog-title"
            open={openDialogDetail}
            maxWidth="lg"
          >
            <DialogTitle sx={{ m: 0, p: 2 }}>
              Detail User
              <IconButton
                aria-label="close"
                onClick={() => setOpenDialogDetail(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box style={{width: '900px'}}>
                  <Grid container spacing={2}>
                      <Grid item xs={3}>
                          <Item style={{padding: '20px'}}>
                              Balance
                              <h1 style={{marginTop: '20px', fontSize: '28px', fontWeight: 'bold'}}>{number_format(dataUser?.user_saldo)}</h1>
                          </Item>
                      </Grid>
                      <Grid item xs={3}>
                          <Item style={{padding: '20px'}}>
                              Total Order
                              <h1 style={{marginTop: '20px', fontSize: '28px', fontWeight: 'bold'}}>{number_format(dataUser?.total_order)}</h1>
                          </Item>
                      </Grid>
                      <Grid item xs={3}>
                          <Item style={{padding: '20px'}}>
                              Weekly Orders
                              <h1 style={{marginTop: '20px', fontSize: '28px', fontWeight: 'bold'}}>{number_format(dataUser?.weekly_order)}</h1>
                          </Item>
                      </Grid>
                      <Grid item xs={3}>
                          <Item style={{padding: '20px'}}>
                              Registered Date
                              <p style={{marginTop: '20px', fontWeight: 'bold'}}>{moment(dataUser?.created_date).format('ddd, DD MMMM YYYY - HH:mm:ss')}</p>
                          </Item>
                      </Grid>
                  </Grid>
              </Box>

              <br />
              <Divider />
              <br />

              <Grid container spacing={2} xs={12}>
                <Grid item xs={2}>
                  Username
                </Grid>
                <Grid item xs={10}>
                  : {dataUser?.username}
                </Grid>
                <hr />
                <Grid item xs={2}>
                  Email
                </Grid>
                <Grid item xs={10}>
                : {dataUser?.email}
                </Grid>
                <hr />
                <Grid item xs={2}>
                  Last IP
                </Grid>
                <Grid item xs={10}>
                : {dataUser?.last_ip_address}
                </Grid>
                <hr />
                <Grid item xs={2}>
                  Last IP Location
                </Grid>
                <Grid item xs={10}>
                : {dataUser?.last_ip_location}
                </Grid>
                <hr />
                <Grid item xs={2}>
                  Password
                </Grid>
                <Grid item xs={5}>
                <FormControl fullWidth size="small" sx={{ m: 1, mt: '-10px' }} variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((show) => !show)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </FormControl>
                </Grid>
                <Grid item xs={5}>
                  {((newPassword != '')) && <Button sx={{ m: 1, mt: '-10px' }} variant='contained' onClick={(e) => handleChangePassword(dataUser)}>
                    Change Password
                  </Button>}
                </Grid>
                <hr />
                <Grid item xs={2} className='pointer' onClick={() => setIsEditBalance((x) => !x)}>
                  Balance
                </Grid>
                {
                  (isEditBalance) && <>
                    <Grid item xs={5}>
                      <TextField value={newBalance} onChange={(e) => setNewBalance(e.target.value)} sx={{ m: 1, mt: '-10px' }} fullWidth size="small" id="outlined-basic" label="New Balance to Add" variant="outlined" />
                    </Grid>
                    <Grid item xs={5}>
                      {((newBalance != '')) && <Button sx={{ m: 1, mt: '-10px' }} variant='contained' onClick={(e) => handleAddBalance(dataUser)}>
                        Add New Balance
                      </Button>}
                    </Grid>
                  </>
                }
                <hr />
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialogDetail(false)}>Close</Button>
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