import * as React from 'react';
import Router, { useRouter } from 'next/router'
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Article from '@mui/icons-material/Article';
import CellTower from '@mui/icons-material/CellTower';
import {
  Speed, MenuBook, Person, LocalAtm, ReceiptLong, Translate, TravelExplore, Settings, Filter
} from '@mui/icons-material';

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
  justifyContent: 'center',
}));

export default function PersistentDrawerLeft() {
//   const theme = useTheme();
  const router = useRouter()
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const Menu1 = [
    {
      icon: Speed,
      text: 'Dashboard',
      link: '/admin',
    },
    {
      icon: MenuBook,
      text: 'Services List',
      link: '/admin/services',
    },
    {
      icon: CellTower,
      text: 'Operator List',
      link: '/admin/operators',
    },
    {
      icon: Person,
      text: 'User Management',
      link: '/admin/users',
    },
  ]

  const Menu2 = [
    {
      icon: LocalAtm,
      text: 'Payments Gateway',
      link: '/admin/payments-gateway',
    },
    {
      icon: ReceiptLong,
      text: 'Order Report Daily',
      link: '/admin/order-report',
    },
    {
      icon: Article,
      text: 'Order History',
      link: '/admin/order-history',
    },
    {
      icon: Translate,
      text: 'Language Settings',
      link: '/admin/language-settings',
    },
    {
      icon: Filter,
      text: 'Promotional Banner',
      link: '/admin/promotional',
    },
    {
      icon: TravelExplore,
      text: 'SEO Setting',
      link: '/admin/seo',
    },
    {
      icon: Settings,
      text: 'App Setting',
      link: '/admin/setting',
    },
  ]

  // React.useEffect(() => {
  //   console.log('router.pathname: ', router.pathname)
  // }, [router.pathname])

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
          bgColor: '#0EAC40 !important',
          color: '#D1D9E2'
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          {/* <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton> */}
          <h1 style={{fontSize: '40px', fontWeight: 'bold', color: '#FFFFFF'}}>Bestpva</h1>
        </DrawerHeader>
        <Divider />
        <List>
          {Menu1.map((data1, index) => (
            <ListItem key={data1.text} disablePadding>
              <ListItemButton onClick={() => Router.push(data1.link)}>
                <ListItemIcon>
                  <data1.icon style={{color: router.pathname === data1.link ? '#FFFFFF' : '#bababa'}} />
                </ListItemIcon>
                <ListItemText primary={data1.text} style={{color: router.pathname === data1.link ? '#FFFFFF' : '#bababa'}}/>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {Menu2.map((data2, index) => (
            <ListItem key={data2.text} disablePadding>
              <ListItemButton onClick={() => Router.push(data2.link)}>
                <ListItemIcon>
                  <data2.icon style={{color: router.pathname === data2.link ? '#FFFFFF' : '#bababa'}} />
                </ListItemIcon>
                <ListItemText primary={data2.text} style={{color: router.pathname === data2.link ? '#FFFFFF' : '#bababa'}} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}