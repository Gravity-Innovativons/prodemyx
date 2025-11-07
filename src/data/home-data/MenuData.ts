interface MenuItem {
    id: number;
    title: string;
    link: string;
    menu_class?: string;
    home_sub_menu?: {
        menu_details: {
            link: string;
            title: string;
            badge?: string;
            badge_class?: string;
        }[];
    }[];
    sub_menus?: {
        link: string;
        title: string;
        dropdown?: boolean;
        mega_menus?: {
            link: string;
            title: string;
        }[];
    }[];
};

const menu_data: MenuItem[] = [

    {
        id: 1,
        title: "Home",
        link: "#",
        menu_class: "mega-menu",
        
    },
    {
        id: 2,
        title: "Courses",
        link: "#",
       
    },
    {
        id: 3,
        title: "About Us",
        link: "#",

    },
    {
        id: 4,
        title: "Dashboard",
        link: "#",
       
    },
];
export default menu_data;
