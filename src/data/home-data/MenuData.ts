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
        link: "/",


    },
    {
        id: 2,
        title: "Courses",
        link: "#",
        sub_menus: [
            { link: "/courses", title: "All Courses" },
            { link: "/course-details", title: "Course Details" },
            { link: "/lesson", title: "Course Lesson" },
        ],
    },
    {
        id: 3,
        title: "Pages",
        link: "#",
        sub_menus: [

            {
                link: "#",
                title: "Extra",
                dropdown: true,
                mega_menus: [
                    { link: "/Meet", title: "Create Meet", },
                    { link: "/ClassroomCourses", title: "get Classrom Courses", },
                    { link: "/GitHubRepos", title: "get github Courses", },
                    { link: "/Chat", title: "Chat with students", },
                    { link: "/resume", title: "summarize", },
                ]
            },

            {
                link: "#",
                title: "Our Events",
                dropdown: true,
                mega_menus: [
                    { link: "/event", title: "Our Events", },

                ]
            },

            {
                link: "#",
                title: "Our Instructors",
                dropdown: true,
                mega_menus: [
                    { link: "/instructors", title: "Our Instructors", },

                ]
            },


            { link: "/login", title: "Student Login" },
            { link: "/registration", title: "Student Registration" },

            { link: "/contact", title: "Contact" },
        ],
    },
    {
        id: 4,
        title: "Dashboard",
        link: "#",
        sub_menus: [
            {
                link: "#",
                title: "Instructor Dashboard",
                dropdown: true,
                mega_menus: [
                    { link: "/instructor-dashboard", title: "Dashboard" },
                    { link: "/instructor-profile", title: "Profile" },
                    { link: "/instructor-enrolled-courses", title: "Enrolled Courses" },

                    { link: "/instructor-attempts", title: "My Quiz Attempts" },


                    { link: "/instructor-quiz", title: "Quiz Attempts" },

                    { link: "/instructor-setting", title: "Settings" },
                ]
            },
            {
                link: "#",
                title: "Student Dashboard",
                dropdown: true,
                mega_menus: [
                    { link: "/student-dashboard", title: "Dashboard" },
                    { link: "/student-profile", title: "Profile" },
                    { link: "/student-enrolled-courses", title: "Enrolled Courses" },

                    { link: "/student-attempts", title: "My Quiz Attempts" },

                    { link: "/student-setting", title: "Settings" },
                ]
            },
        ],
    },



];
export default menu_data;
