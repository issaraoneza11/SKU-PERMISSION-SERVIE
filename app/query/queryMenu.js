const queryMenu = {
    filterMenuService: `SELECT 
     mm.mm_id
    , mm.mm_name
    , mm.mm_key
    , mm.mm_sort
    , mm.mm_company_id
    , m.menu_id
    , m.menu_name
    , m.menu_parent
    , m.menu_path
    , m.menu_image
    , m.menu_level
    , m.menu_key
    , m.menu_sort
    FROM public.menu as m 
    INNER JOIN public.master_menu as mm ON m.menu_mm_id = mm.mm_id
    WHERE m.menu_is_use = true
    AND ($1::uuid is null or m.menu_id = $1)
    AND ($2:: text is null or mm.mm_name LIKE '%' || $2 || '%')
    AND ($3:: text is null or m.menu_name LIKE '%' || $3 || '%')
    ORDER BY m.menu_sort, mm.mm_sort ASC
    `,
    getUserByIdService: `SELECT 
    iu.id
    ,iu.company_id
    ,c.name as company_name
    ,iu.name
    ,iu.sirname
    ,iu.username
    ,iu.email
    ,iu.password
    ,iu.mobile1 
    ,iu.mobile2
   
    ,iu.detail
    ,iu.token
    ,iu.user_profile
    ,iu.user_profile_name
    ,iu.user_profile_path
    FROM identity_user as iu 
    INNER JOIN company as c ON iu.company_id = c.id
    WHERE iu.id = $1
    ;
    `,
    getOemByIdService: `SELECT a.id, a.company_id,b.name as company_name, a.admin_id, a.name, a.logo, a.create_date, a.is_use, a.logo_name, a.logo_path, a.is_active, a.sort
	FROM oem a left join company b ON a.company_id = b.id WHERE a.company_id = $1;
    ;
    `,
    getOemByCompanyIdService: `SELECT * FROM oem WHERE company_id = $1 AND is_use = true;
    ;
    `
}

module.exports = queryMenu