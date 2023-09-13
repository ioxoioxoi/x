import * as React from 'react';
import dayjs from 'dayjs';
import { styled, useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
    Box, List, ListItem, ListItemButton, ListItemText, Divider,
    Select, MenuItem, Grid
} from '@mui/material';
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
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [dataBase, setDataBase] = React.useState([]);
  const [totalOrders, setTotalOrders] = React.useState(0);
  const [totalSellingPrice, setTotalSellingPrice] = React.useState(0);
  const [totalSupplierPrice, setTotalSupplierPrice] = React.useState(0);
  const [totalProfit, setTotalProfit] = React.useState(0);
  const [totalBP, setTotalBP] = React.useState(0);
  const [totalPM, setTotalPM] = React.useState(0);
  const [totalDUITKU, setTotalDUITKU] = React.useState(0);
  const [totalQRIS, setTotalQRIS] = React.useState(0);
  const [totalBonus, setTotalBonus] = React.useState(0);
  const [filterDate, setFilterDate] = React.useState(dayjs(moment().format('YYYY-MM-DD')));

  const columns = [
    { field: 'no', headerName: 'No.', width: 70 },
    { field: 'service_name', headerName: 'Service Name', width: 150 },
    { field: 'country', headerName: 'Country', width: 150 },
    {
      field: 'created_date',
      headerName: 'Date',
      width: 250,
    },
    { field: 'price_real', headerName: 'Supplier Price',  type: 'number',width: 150 },
    // { field: 'price_admin', headerName: 'App Price',  type: 'number',width: 150 },
    { field: 'price_user', headerName: 'Selling Price',  type: 'number',width: 150 },
    { field: 'price_profit', headerName: 'Profit',  type: 'number',width: 150 },
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

  const router = useRouter();
  React.useEffect(() => {
    if (!Store.get('auth')) {
      router.push('/admin/auth/login');
    } else {
      axios.post(`${process.env.NEXT_PUBLIC_API_TRANSACTIONS}Orders/list`, {
        token_login: Store.get('token'),
        date: dayjs(filterDate).format('YYYY-MM-DD')
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
        const _dataBase= []
        let loop = 1
        res?.data?.data?.data?.map(_data => {
            _data['no'] = loop++
            _data['price_real'] = Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(_data['price_real'])
            _data['price_user'] = Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(_data['price_user'])
            _data['price_profit'] = Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(_data['price_profit'])
            _data['created_date'] = moment(_data['created_date']).format('ddd, DD MMMM YYYY - HH:mm:ss')
            if (!_data['service_name']) {
              _data['service_name'] = 'Telegram'
              _data['country'] = 'Indonesia'
            }
            _dataBase.push(_data)
        })
        setDataBase(_dataBase)
        setTotalBP(number_format(res?.data?.data?.totalBP))
        setTotalBonus(number_format(res?.data?.data?.totalBonus))
        setTotalOrders(res?.data?.data?.total_order)
        setTotalSellingPrice(res?.data?.data?.total_selling_price)
        setTotalSupplierPrice(res?.data?.data?.total_supplier_price)
        setTotalProfit(res?.data?.data?.total_profit)
      })
    } 
  }, [filterDate])

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar />
      <Sidebar />
      <Main open={open} className='main'>
       <h1 style={{fontSize: '28px'}}>
        <b>Order Report</b>
        
        <span style={{float: 'right'}}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker value={filterDate} onChange={e => setFilterDate(e)} />
            </LocalizationProvider>
        </span>
       </h1>

       <Box style={{marginTop: '50px'}}>
            <Grid container xs={12} spacing={2}>
                <Grid item xs={3}>
                    <Item style={{padding: '20px'}}>
                        Deposit Binance
                        <span style={{float: 'right', marginTop: '-5px', marginLeft: '5px', cursor: 'pointer'}}>...</span>
                        <h1 style={{marginTop: '20px', fontSize: '28px', fontWeight: 'bold'}}>{Store.get('dataCurrency')?.currency_symbol} {number_format(totalBP)}</h1>
                    </Item>
                </Grid>
                <Grid item xs={3}>
                    <Item style={{padding: '20px'}}>
                        Deposit Perfect Money
                        <span style={{float: 'right', marginTop: '-5px', marginLeft: '5px', cursor: 'pointer'}}>...</span>
                        <h1 style={{marginTop: '20px', fontSize: '28px', fontWeight: 'bold'}}>{Store.get('dataCurrency')?.currency_symbol} {number_format(totalPM)}</h1>
                    </Item>
                </Grid>
                <Grid item xs={3}>
                    <Item style={{padding: '20px'}}>
                        Deposit DUITKU
                        <span style={{float: 'right', marginTop: '-5px', marginLeft: '5px', cursor: 'pointer'}}>...</span>
                        <h1 style={{marginTop: '20px', fontSize: '28px', fontWeight: 'bold'}}>{Store.get('dataCurrency')?.currency_symbol} {number_format(totalDUITKU)}</h1>
                    </Item>
                </Grid>
                <Grid item xs={3}>
                    <Item style={{padding: '20px'}}>
                        Deposit QRIS
                        <span style={{float: 'right', marginTop: '-5px', marginLeft: '5px', cursor: 'pointer'}}>...</span>
                        <h1 style={{marginTop: '20px', fontSize: '28px', fontWeight: 'bold'}}>{Store.get('dataCurrency')?.currency_symbol} {number_format(totalQRIS)}</h1>
                    </Item>
                </Grid>
                <Grid item xs={3}>
                    <Item style={{padding: '20px'}}>
                        Deposit BONUS
                        <span style={{float: 'right', marginTop: '-5px', marginLeft: '5px', cursor: 'pointer'}}>...</span>
                        <h1 style={{marginTop: '20px', fontSize: '28px', fontWeight: 'bold'}}>{Store.get('dataCurrency')?.currency_symbol} {number_format(totalBonus)}</h1>
                    </Item>
                </Grid>
            </Grid>
        </Box>

        <hr /><br/>

       <Box style={{marginTop: '20px'}}>

            <h3><b>Today Order Report</b></h3>
            <br/>
            <p>
              <span>Total Order : <b>{Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(totalOrders)}</b></span> &emsp; | &emsp;
              <span>Selling Price : <b>{Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(totalSellingPrice)}</b></span> &emsp; | &emsp;
              <span>Supplier Price : <b>{Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(totalSupplierPrice)}</b></span> &emsp; | &emsp;
              <span>Profit : <b>{Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(totalProfit)}</b></span>
            </p>
            
            <Paper>
                <DataGrid
                    captions={'captions'}
                    rows={dataBase}
                    columns={columns}
                    initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                    }}
                    pageSizeOptions={[10, 20]}
                />
            </Paper>
       </Box>
      </Main>
    </Box>
  );
}