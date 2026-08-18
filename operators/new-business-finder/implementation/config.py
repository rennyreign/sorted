"""
New Business Finder — Configuration.

This operator searches Companies House for recently incorporated UK companies
and adds suitable records to the shared Prospect Finder CRM.

Edit TARGET_SIC_CODES / EXCLUDED_SIC_CODES to change the ICP. This is
configurable data, not application logic.
"""

# ---------------------------------------------------------------------------
# Run defaults
# ---------------------------------------------------------------------------

DEFAULT_DAYS_BACK = 7
DEFAULT_MAX_RESULTS = 100

# ---------------------------------------------------------------------------
# Target SIC codes
# ---------------------------------------------------------------------------
# Starter list of 5-digit SIC codes for local service / trade / retail /
# hospitality businesses that are likely to need a first website.
# Source: Companies House SIC 2007 list.
# Add or remove codes here without touching the operator code.

TARGET_SIC_CODES = [
    # Construction & trades
    "41100",  # Development of building projects
    "41201",  # Construction of commercial buildings
    "41202",  # Construction of domestic buildings
    "42110",  # Construction of roads and motorways
    "42120",  # Construction of railways and underground railways
    "42130",  # Construction of bridges and tunnels
    "42210",  # Construction of utility projects for fluids
    "42220",  # Construction of utility projects for electricity and telecommunications
    "42910",  # Construction of water projects
    "42990",  # Construction of other civil engineering projects
    "43110",  # Demolition
    "43120",  # Site preparation
    "43130",  # Test drilling and boring
    "43210",  # Electrical installation
    "43220",  # Plumbing, heat and air-conditioning installation
    "43290",  # Other construction installation
    "43310",  # Plastering
    "43320",  # Joinery installation
    "43330",  # Floor and wall covering
    "43341",  # Painting
    "43342",  # Glazing
    "43350",  # Other building completion and finishing
    "43390",  # Other building completion and finishing n.e.c.
    "43910",  # Roof carpentry and joinery
    "43991",  # Scaffold erection
    "43999",  # Other specialised construction activities n.e.c.
    # Motor trades
    "45200",  # Maintenance and repair of motor vehicles
    "45320",  # Retail trade of parts and accessories for motor vehicles
    # Retail & shops (local bricks-and-mortar)
    "47110",  # Retail sale in non-specialised stores with food, beverages or tobacco predominating
    "47240",  # Retail sale of bread, cakes, flour confectionery and sugar confectionery
    "47250",  # Retail sale of beverages in specialised stores
    "47290",  # Other retail sale of food in specialised stores
    "47510",  # Retail sale of textiles in specialised stores
    "47520",  # Retail sale of hardware, paints and glass in specialised stores
    "47530",  # Retail sale of carpets, rugs, wall and floor coverings in specialised stores
    "47540",  # Retail sale of electrical household appliances in specialised stores
    "47591",  # Retail sale of musical instruments
    "47599",  # Retail of furniture, lighting, and similar in specialised stores
    "47710",  # Retail sale of clothing in specialised stores
    "47721",  # Retail sale of footwear in specialised stores
    "47722",  # Retail sale of leather goods in specialised stores
    "47749",  # Retail sale of medical and orthopaedic goods in specialised stores
    "47750",  # Retail sale of cosmetic and toilet articles in specialised stores
    "47781",  # Retail sale in commercial art galleries
    "47782",  # Retail sale by opticians
    "47789",  # Other retail sale of new goods in specialised stores
    "47910",  # Retail sale via mail order houses or via Internet
    # Food, hospitality & personal services
    "55100",  # Hotels and similar accommodation
    "55201",  # Holiday and other short-stay accommodation
    "55202",  # Youth hostels and mountain refuges
    "55300",  # Camping grounds, recreational vehicle parks and trailer parks
    "56101",  # Licensed restaurants
    "56102",  # Unlicensed restaurants and cafes
    "56103",  # Take-away food shops and mobile food stands
    "56210",  # Event catering activities
    "56290",  # Other food service activities
    "56301",  # Licenced clubs
    "56302",  # Public houses and bars
    "59111",  # Motion picture production activities
    "59112",  # Motion picture, video and television programme post-production activities
    # Health, beauty, fitness & wellbeing
    "73110",  # Advertising agencies
    "73120",  # Media representation services
    "74100",  # Specialised design activities
    "74300",  # Translation and interpretation activities
    "74909",  # Other professional, scientific and technical activities n.e.c.
    "82301",  # Activities of exhibition and fair organisers
    "82302",  # Activities of conference organisers
    "82990",  # Other business support service activities n.e.c.
    # Sports, leisure & education
    "85200",  # Primary education
    "85310",  # General secondary education
    "85510",  # Sports and recreation education
    "85600",  # Educational support services
    "86900",  # Other human health activities
    "87900",  # Residential care activities for mental health
    "88910",  # Child day-care activities
    "90010",  # Performing arts
    "90020",  # Support activities to performing arts
    "90030",  # Artistic creation
    "90040",  # Operation of arts facilities
    "91011",  # Library activities
    "91012",  # Archive activities
    "91020",  # Museums activities
    "91030",  # Operation of historical sites and buildings and similar visitor attractions
    "91040",  # Botanical and zoological gardens and nature reserves activities
    "92000",  # Gambling and betting activities
    "93110",  # Operation of sports facilities
    "93120",  # Activities of sport clubs
    "93130",  # Fitness facilities
    "93199",  # Other sports activities
    "93210",  # Activities of amusement parks and theme parks
    "93290",  # Other amusement and recreation activities
    # Professional & local services
    "69201",  # Accounting and auditing activities
    "69202",  # Bookkeeping activities
    "69203",  # Tax consultancy
    "69102",  # Solicitors
    "69109",  # Activities of patent and copyright agents; other legal activities n.e.c.
    "70210",  # Public relations and communications activities
    "70229",  # Management consultancy activities other than financial management
    "71111",  # Architectural activities
    "71112",  # Urban planning and landscape architectural activities
    "71121",  # Engineering design activities for industrial process and production
    "71122",  # Engineering related scientific and technical consulting activities
    "71129",  # Other engineering activities
    "71200",  # Technical testing and analysis
    "72110",  # Research and experimental development on biotechnology
    "72210",  # Research and experimental development on social sciences and humanities
    "74901",  # Environmental consulting activities
    "74902",  # Quantity surveying activities
    "74921",  # Financial management
    "74929",  # Other management consultancy activities n.e.c.
    "74990",  # Other professional, scientific and technical activities n.e.c.
    # Veterinary
    "75000",  # Veterinary activities
    # Security, cleaning, facilities
    "80200",  # Security systems service activities
    "80300",  # Investigation activities
    "81100",  # Combined facilities support activities
    "81210",  # General cleaning of buildings
    "81221",  # Window cleaning services
    "81222",  # Specialised cleaning services
    "81223",  # Furnace and chimney cleaning services
    "81229",  # Other building and industrial cleaning activities
    "81291",  # Disinfecting and exterminating services
    "81299",  # Other cleaning services
    "81300",  # Landscape service activities
    # Transport & logistics
    "49410",  # Freight transport by road
    "49420",  # Removal services
    "49500",  # Transport via pipeline
    "52211",  # Operation of rail freight terminals
    "52212",  # Operation of rail passenger facilities at railway stations
    "52219",  # Other service activities incidental to land transportation
    "52220",  # Operation of inland passenger water transport terminals
    "52230",  # Operation of inland freight water transport terminals
    "52241",  # Cargo handling for water transport activities
    "52242",  # Cargo handling for air transport activities
    "52243",  # Cargo handling for land transport activities
    "52290",  # Other transportation support activities
    "53201",  # Licensed carriers
    "53202",  # Unlicensed carriers
    # Motor trades (retail)
    "45112",  # Sale of used cars and light motor vehicles
    "45320",  # Retail trade of parts and accessories for motor vehicles
]

# ---------------------------------------------------------------------------
# Excluded SIC codes / prefixes
# ---------------------------------------------------------------------------
# These are deterministically excluded. Codes are matched by exact code or by
# prefix when prefix matching is used via is_excluded_sic().

EXCLUDED_SIC_CODES = {
    "99999",  # Dormant company
    "74990",  # Non-trading company — often a property SPV or shell
}

EXCLUDED_SIC_PREFIXES = (
    "64",   # Financial service activities, except insurance and pension funding
    "65",   # Insurance, reinsurance and pension funding, except compulsory social security
    "66",   # Activities auxiliary to financial services and insurance activities
    "68",   # Real estate activities (property ownership / investment / letting)
    "70",   # Activities of head offices; management consultancy (some retained above; broad property/SPV caught by 68)
    "841",  # Administration of the State and the economic and social policy of the community
    "842",  # Provision of services to the community as a whole
    "843",  # Compulsory social security activities
    "86",   # Human health activities
    "87",   # Residential care activities
    "88",   # Social work activities without accommodation
)

# ---------------------------------------------------------------------------
# SIC code → human category label (used as prospect.category)
# ---------------------------------------------------------------------------
# Only the first matching code is used. Add more mappings as needed.

SIC_CATEGORY_MAP: dict[str, str] = {
    "41100": "builder",
    "41201": "builder",
    "41202": "builder",
    "42110": "civil engineering",
    "42120": "civil engineering",
    "42130": "civil engineering",
    "42210": "civil engineering",
    "42220": "civil engineering",
    "42910": "civil engineering",
    "42990": "civil engineering",
    "43110": "demolition",
    "43120": "site preparation",
    "43130": "test drilling",
    "43210": "electrician",
    "43220": "plumber",
    "43290": "installation contractor",
    "43310": "plasterer",
    "43320": "joinery",
    "43330": "floor and wall covering",
    "43341": "painter",
    "43342": "glazing",
    "43350": "building finishing",
    "43390": "building finishing",
    "43910": "roofing",
    "43991": "scaffolding",
    "43999": "specialised construction",
    "45200": "vehicle repair",
    "45320": "vehicle parts",
    "47110": "convenience store",
    "47240": "baker",
    "47250": "off licence",
    "47290": "speciality food shop",
    "47510": "textile retail",
    "47520": "hardware store",
    "47530": "carpet and flooring",
    "47540": "appliance retail",
    "47710": "clothing shop",
    "47721": "shoe shop",
    "47722": "leather goods",
    "47749": "medical goods retail",
    "47750": "cosmetics retail",
    "47781": "art gallery",
    "47782": "optician",
    "47789": "speciality retail",
    "47910": "online retail",
    "55100": "hotel",
    "55201": "holiday accommodation",
    "55202": "hostel",
    "55300": "campsite",
    "56101": "restaurant",
    "56102": "cafe",
    "56103": "takeaway",
    "56210": "catering",
    "56290": "food service",
    "56301": "club",
    "56302": "pub",
    "93130": "gym",
    "93120": "sports club",
    "93199": "sports activity",
    "81210": "cleaning service",
    "81221": "window cleaning",
    "81222": "specialist cleaning",
    "81299": "cleaning service",
    "81300": "landscaper",
    "49410": "haulage",
    "49420": "removals",
    "52290": "transport support",
    "69201": "accountant",
    "69202": "bookkeeper",
    "69203": "tax consultant",
    "69102": "solicitor",
    "69109": "legal services",
    "71111": "architect",
    "71112": "landscape architect",
    "74100": "designer",
    "75000": "veterinary",
    "86900": "health service",
    "88910": "childcare",
    "90010": "performing arts",
    "90040": "arts venue",
    "91020": "museum",
    "91030": "visitor attraction",
    "92000": "gambling",
    "93210": "amusement park",
    "93290": "recreation",
}

# ---------------------------------------------------------------------------
# Companies House API
# ---------------------------------------------------------------------------

CH_BASE_URL = "https://api.company-information.service.gov.uk"
CH_RATE_LIMIT_PER_5MIN = 600
CH_TIMEOUT_SECONDS = 60

# ---------------------------------------------------------------------------
# Operator metadata
# ---------------------------------------------------------------------------

OPERATOR_NAME = "new-business-finder"
OPERATOR_VERSION = "1.0.0"
