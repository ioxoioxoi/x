export const MENU_LIST = {
    default : [
            { text: "Beranda", href: "/default", type: "link", color: false },
            { text: "Produk", href: "/default/produk", type: "link", color: false },
            { text: "Promo", href: "/default/promo", type: "link", color: false },
            { text: "Hubungi kami", href: "/default/hubungi-kami", type: "button", color: "secondary" },
    ],
    tuntaz : [
            { text: "Beranda", href: "/tuntaz/", type: "link", color: false },
            { text: "Produk", href: "/tuntaz/produk", type: "link", color: false },
            { text: "Promo", href: "/tuntaz/promo", type: "link", color: false },
            { text: "Hubungi kami", href: "/tuntaz/hubungi-kami", type: "button", color: "secondary" },
    ],
    menus2: [
        { text: "Template", href: "/template" },
    ],
    settings: [
        { text: "Profile", href: "/profile" },
        { text: "Account", href: "/account" },
    ], 
    settings2: [
        { text: "Login Merchant", href: process.env.NEXT_PUBLIC_DASHBOARD_LOGIN_URL },
    ], 
}