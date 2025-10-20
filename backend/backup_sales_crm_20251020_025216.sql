--
-- PostgreSQL database dump
--

\restrict sv3wogApdJDw2vI9eVF6f1NezPqMxHkegQLnpevYvI3HRBEWdqN67HHOTxnRL5Q

-- Dumped from database version 16.10 (Homebrew)
-- Dumped by pg_dump version 16.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: customer_requirement_type; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.customer_requirement_type AS ENUM (
    'END_USER',
    'INVESTOR',
    'BOTH'
);


ALTER TYPE public.customer_requirement_type OWNER TO eastern_estate;

--
-- Name: data_completeness_status_enum; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.data_completeness_status_enum AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'NEEDS_REVIEW',
    'COMPLETE'
);


ALTER TYPE public.data_completeness_status_enum OWNER TO eastern_estate;

--
-- Name: flat_status_enum; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.flat_status_enum AS ENUM (
    'AVAILABLE',
    'BLOCKED',
    'BOOKED',
    'SOLD',
    'UNDER_CONSTRUCTION',
    'ON_HOLD'
);


ALTER TYPE public.flat_status_enum OWNER TO eastern_estate;

--
-- Name: flat_type_enum; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.flat_type_enum AS ENUM (
    'STUDIO',
    '1BHK',
    '2BHK',
    '3BHK',
    '4BHK',
    'PENTHOUSE',
    'DUPLEX',
    'VILLA'
);


ALTER TYPE public.flat_type_enum OWNER TO eastern_estate;

--
-- Name: followup_outcome; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.followup_outcome AS ENUM (
    'INTERESTED',
    'NOT_INTERESTED',
    'CALLBACK_REQUESTED',
    'SITE_VISIT_SCHEDULED',
    'DOCUMENTATION_REQUESTED',
    'PRICE_NEGOTIATION',
    'NEEDS_TIME',
    'NOT_REACHABLE',
    'WRONG_NUMBER',
    'CONVERTED',
    'LOST'
);


ALTER TYPE public.followup_outcome OWNER TO eastern_estate;

--
-- Name: followup_type; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.followup_type AS ENUM (
    'CALL',
    'EMAIL',
    'MEETING',
    'WHATSAPP',
    'SMS',
    'SITE_VISIT',
    'VIDEO_CALL'
);


ALTER TYPE public.followup_type OWNER TO eastern_estate;

--
-- Name: property_preference; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.property_preference AS ENUM (
    'FLAT',
    'DUPLEX',
    'PENTHOUSE',
    'VILLA',
    'PLOT',
    'COMMERCIAL',
    'ANY'
);


ALTER TYPE public.property_preference OWNER TO eastern_estate;

--
-- Name: site_visit_status; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.site_visit_status AS ENUM (
    'NOT_SCHEDULED',
    'SCHEDULED',
    'PENDING',
    'DONE',
    'CANCELLED'
);


ALTER TYPE public.site_visit_status OWNER TO eastern_estate;

--
-- Name: target_period; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.target_period AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'HALF_YEARLY',
    'YEARLY'
);


ALTER TYPE public.target_period OWNER TO eastern_estate;

--
-- Name: target_status; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.target_status AS ENUM (
    'ACTIVE',
    'ACHIEVED',
    'MISSED',
    'IN_PROGRESS'
);


ALTER TYPE public.target_status OWNER TO eastern_estate;

--
-- Name: task_priority; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.task_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public.task_priority OWNER TO eastern_estate;

--
-- Name: task_status; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.task_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'OVERDUE'
);


ALTER TYPE public.task_status OWNER TO eastern_estate;

--
-- Name: task_type; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.task_type AS ENUM (
    'FOLLOWUP_CALL',
    'SITE_VISIT',
    'MEETING',
    'DOCUMENTATION',
    'PROPERTY_TOUR',
    'CLIENT_MEETING',
    'INTERNAL_MEETING',
    'EMAIL_FOLLOWUP',
    'NEGOTIATION',
    'OTHER'
);


ALTER TYPE public.task_type OWNER TO eastern_estate;

--
-- Name: tower_construction_status; Type: TYPE; Schema: public; Owner: eastern_estate
--

CREATE TYPE public.tower_construction_status AS ENUM (
    'PLANNED',
    'UNDER_CONSTRUCTION',
    'COMPLETED',
    'READY_TO_MOVE'
);


ALTER TYPE public.tower_construction_status OWNER TO eastern_estate;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: eastern_estate
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO eastern_estate;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_number character varying(50) NOT NULL,
    customer_id uuid NOT NULL,
    property_id uuid NOT NULL,
    flat_id uuid,
    booking_date date NOT NULL,
    booking_amount numeric(15,2) NOT NULL,
    total_amount numeric(15,2) NOT NULL,
    paid_amount numeric(15,2) DEFAULT 0,
    balance_amount numeric(15,2),
    status character varying(50) DEFAULT 'PENDING'::character varying,
    payment_plan character varying(100),
    possession_date date,
    agreement_date date,
    registry_date date,
    is_home_loan boolean DEFAULT false,
    bank_name character varying(255),
    loan_amount numeric(15,2),
    loan_status character varying(50),
    is_active boolean DEFAULT true,
    notes text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bookings OWNER TO eastern_estate;

--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_code character varying(50) NOT NULL,
    campaign_name character varying(255) NOT NULL,
    campaign_type character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'DRAFT'::character varying,
    start_date date,
    end_date date,
    budget numeric(15,2),
    actual_cost numeric(15,2) DEFAULT 0,
    target_audience text,
    channel character varying(100),
    leads_generated integer DEFAULT 0,
    conversions integer DEFAULT 0,
    roi numeric(10,2),
    is_active boolean DEFAULT true,
    description text,
    notes text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.campaigns OWNER TO eastern_estate;

--
-- Name: construction_projects; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.construction_projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_code character varying(50) NOT NULL,
    project_name character varying(255) NOT NULL,
    property_id uuid,
    project_type character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'PLANNED'::character varying,
    start_date date,
    estimated_end_date date,
    actual_end_date date,
    estimated_budget numeric(15,2),
    actual_cost numeric(15,2) DEFAULT 0,
    contractor_name character varying(255),
    contractor_contact character varying(20),
    site_engineer character varying(255),
    project_manager character varying(255),
    completion_percentage numeric(5,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    notes text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.construction_projects OWNER TO eastern_estate;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_code character varying(50) NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255),
    phone_number character varying(20) NOT NULL,
    alternate_phone character varying(20),
    date_of_birth date,
    gender character varying(20),
    occupation character varying(100),
    company_name character varying(255),
    address_line1 text,
    address_line2 text,
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    country character varying(100) DEFAULT 'India'::character varying,
    pan_number character varying(20),
    aadhar_number character varying(20),
    customer_type character varying(50) DEFAULT 'INDIVIDUAL'::character varying,
    lead_source character varying(100),
    assigned_sales_person character varying(255),
    credit_limit numeric(15,2) DEFAULT 0,
    outstanding_balance numeric(15,2) DEFAULT 0,
    total_bookings integer DEFAULT 0,
    total_purchases numeric(15,2) DEFAULT 0,
    kyc_status character varying(50) DEFAULT 'PENDING'::character varying,
    kyc_documents jsonb,
    is_active boolean DEFAULT true,
    notes text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    requirement_type public.customer_requirement_type DEFAULT 'END_USER'::public.customer_requirement_type,
    property_preference public.property_preference DEFAULT 'FLAT'::public.property_preference,
    tentative_purchase_timeframe character varying(100)
);


ALTER TABLE public.customers OWNER TO eastern_estate;

--
-- Name: COLUMN customers.tentative_purchase_timeframe; Type: COMMENT; Schema: public; Owner: eastern_estate
--

COMMENT ON COLUMN public.customers.tentative_purchase_timeframe IS 'Examples: 1-3 months, 3-6 months, 6-12 months, 1+ year';


--
-- Name: employees; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.employees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_code character varying(50) NOT NULL,
    full_name character varying(200) NOT NULL,
    email character varying(200),
    phone_number character varying(50) NOT NULL,
    alternate_phone character varying(50),
    date_of_birth date NOT NULL,
    gender character varying(20) NOT NULL,
    blood_group character varying(50),
    marital_status character varying(50),
    current_address text NOT NULL,
    permanent_address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(20),
    department character varying(50) NOT NULL,
    designation character varying(200) NOT NULL,
    employment_type character varying(50) NOT NULL,
    employment_status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    joining_date date NOT NULL,
    confirmation_date date,
    resignation_date date,
    last_working_date date,
    reporting_manager_id uuid,
    reporting_manager_name character varying(200),
    basic_salary numeric(15,2) NOT NULL,
    house_rent_allowance numeric(15,2) DEFAULT 0,
    transport_allowance numeric(15,2) DEFAULT 0,
    medical_allowance numeric(15,2) DEFAULT 0,
    other_allowances numeric(15,2) DEFAULT 0,
    gross_salary numeric(15,2) NOT NULL,
    pf_deduction numeric(15,2) DEFAULT 0,
    esi_deduction numeric(15,2) DEFAULT 0,
    tax_deduction numeric(15,2) DEFAULT 0,
    other_deductions numeric(15,2) DEFAULT 0,
    net_salary numeric(15,2) NOT NULL,
    bank_name character varying(200),
    bank_account_number character varying(50),
    ifsc_code character varying(50),
    branch_name character varying(200),
    aadhar_number character varying(50),
    pan_number character varying(50),
    pf_number character varying(50),
    esi_number character varying(50),
    uan_number character varying(50),
    documents text,
    emergency_contact_name character varying(200),
    emergency_contact_phone character varying(50),
    emergency_contact_relation character varying(100),
    casual_leave_balance integer DEFAULT 0,
    sick_leave_balance integer DEFAULT 0,
    earned_leave_balance integer DEFAULT 0,
    leave_taken integer DEFAULT 0,
    total_present integer DEFAULT 0,
    total_absent integer DEFAULT 0,
    total_late_arrival integer DEFAULT 0,
    skills text,
    qualifications text,
    experience text,
    performance_rating numeric(3,2),
    last_review_date timestamp without time zone,
    notes text,
    tags text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


ALTER TABLE public.employees OWNER TO eastern_estate;

--
-- Name: flats; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.flats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_id uuid NOT NULL,
    flat_number character varying(50) NOT NULL,
    floor_number integer,
    flat_type character varying(100),
    bhk_type character varying(20),
    carpet_area numeric(15,2),
    built_up_area numeric(15,2),
    super_built_up_area numeric(15,2),
    base_price numeric(15,2) NOT NULL,
    total_price numeric(15,2) NOT NULL,
    status character varying(50) DEFAULT 'AVAILABLE'::character varying,
    facing character varying(50),
    balconies integer DEFAULT 0,
    bathrooms integer DEFAULT 0,
    is_corner_unit boolean DEFAULT false,
    parking_slots integer DEFAULT 0,
    amenities text[],
    is_active boolean DEFAULT true,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    name character varying(100),
    description text,
    type character varying(20) DEFAULT '2BHK'::character varying NOT NULL,
    floor integer DEFAULT 1 NOT NULL,
    bedrooms integer DEFAULT 2 NOT NULL,
    servant_room boolean DEFAULT false NOT NULL,
    study_room boolean DEFAULT false NOT NULL,
    pooja_room boolean DEFAULT false NOT NULL,
    balcony_area numeric(10,2),
    price_per_sqft numeric(15,2),
    registration_charges numeric(15,2),
    maintenance_charges numeric(15,2),
    parking_charges numeric(15,2),
    discount_amount numeric(15,2),
    final_price numeric(15,2) DEFAULT 0 NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    available_from date,
    expected_possession date,
    vastu_compliant boolean DEFAULT true NOT NULL,
    corner_unit boolean DEFAULT false NOT NULL,
    road_facing boolean DEFAULT false NOT NULL,
    park_facing boolean DEFAULT false NOT NULL,
    covered_parking boolean DEFAULT false NOT NULL,
    furnishing_status character varying(50),
    special_features text,
    floor_plan_url text,
    images text,
    virtual_tour_url text,
    customer_id uuid,
    booking_date date,
    sold_date date,
    token_amount numeric(15,2),
    payment_plan text,
    remarks text,
    display_order integer DEFAULT 1 NOT NULL,
    created_by uuid,
    updated_by uuid,
    tower_id uuid,
    flat_checklist jsonb,
    data_completion_pct numeric(5,2) DEFAULT 0,
    completeness_status public.data_completeness_status_enum DEFAULT 'NOT_STARTED'::public.data_completeness_status_enum,
    issues jsonb,
    issues_count integer DEFAULT 0
);


ALTER TABLE public.flats OWNER TO eastern_estate;

--
-- Name: floors; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.floors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tower_id uuid,
    floor_number integer NOT NULL,
    floor_name character varying(100),
    total_flats integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.floors OWNER TO eastern_estate;

--
-- Name: followups; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.followups (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    lead_id uuid NOT NULL,
    follow_up_date date NOT NULL,
    follow_up_type public.followup_type NOT NULL,
    duration_minutes integer DEFAULT 0,
    performed_by uuid NOT NULL,
    outcome public.followup_outcome NOT NULL,
    feedback text NOT NULL,
    customer_response text,
    actions_taken text,
    lead_status_before character varying(50),
    lead_status_after character varying(50),
    next_follow_up_date date,
    next_follow_up_plan text,
    is_site_visit boolean DEFAULT false,
    site_visit_property character varying(200),
    site_visit_rating integer DEFAULT 0,
    site_visit_feedback text,
    interest_level integer DEFAULT 5,
    budget_fit integer DEFAULT 5,
    timeline_fit integer DEFAULT 5,
    reminder_sent boolean DEFAULT false,
    reminder_sent_at timestamp without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.followups OWNER TO eastern_estate;

--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.inventory_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_code character varying(50) NOT NULL,
    item_name character varying(255) NOT NULL,
    description text,
    category character varying(100) NOT NULL,
    brand character varying(100),
    model character varying(100),
    quantity numeric(15,2) DEFAULT 0 NOT NULL,
    unit character varying(50) NOT NULL,
    minimum_stock numeric(15,2) DEFAULT 0,
    maximum_stock numeric(15,2),
    reorder_point numeric(15,2),
    unit_price numeric(15,2) NOT NULL,
    total_value numeric(15,2),
    stock_status character varying(50) DEFAULT 'IN_STOCK'::character varying,
    supplier_name character varying(255),
    supplier_email character varying(255),
    supplier_phone character varying(20),
    warehouse_location character varying(255),
    rack_number character varying(50),
    bin_number character varying(50),
    last_purchase_date date,
    last_purchase_price numeric(15,2),
    total_issued numeric(15,2) DEFAULT 0,
    total_received numeric(15,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    notes text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.inventory_items OWNER TO eastern_estate;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_code character varying(50) NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255),
    phone_number character varying(20) NOT NULL,
    alternate_phone character varying(20),
    source character varying(100),
    status character varying(50) DEFAULT 'NEW'::character varying,
    priority character varying(20) DEFAULT 'MEDIUM'::character varying,
    interested_in character varying(255),
    budget_min numeric(15,2),
    budget_max numeric(15,2),
    timeline character varying(100),
    assigned_to character varying(255),
    address_line1 text,
    city character varying(100),
    state character varying(100),
    country character varying(100) DEFAULT 'India'::character varying,
    notes text,
    follow_up_date date,
    last_contact_date date,
    converted_to_customer boolean DEFAULT false,
    customer_id uuid,
    is_active boolean DEFAULT true,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    site_visit_status public.site_visit_status DEFAULT 'NOT_SCHEDULED'::public.site_visit_status,
    site_visit_time time without time zone,
    last_site_visit_date date,
    requirement_type public.customer_requirement_type DEFAULT 'END_USER'::public.customer_requirement_type,
    property_preference public.property_preference DEFAULT 'FLAT'::public.property_preference,
    tentative_purchase_timeframe character varying(100),
    last_follow_up_feedback text,
    total_follow_ups integer DEFAULT 0,
    send_follow_up_reminder boolean DEFAULT true,
    reminder_sent boolean DEFAULT false,
    reminder_sent_at timestamp without time zone
);


ALTER TABLE public.leads OWNER TO eastern_estate;

--
-- Name: COLUMN leads.tentative_purchase_timeframe; Type: COMMENT; Schema: public; Owner: eastern_estate
--

COMMENT ON COLUMN public.leads.tentative_purchase_timeframe IS 'Examples: 1-3 months, 3-6 months, 6-12 months, 1+ year';


--
-- Name: payment_schedules; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.payment_schedules (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    booking_id uuid,
    installment_number integer NOT NULL,
    installment_type character varying(50),
    description text,
    due_date date NOT NULL,
    amount numeric(15,2) NOT NULL,
    gst_amount numeric(15,2) DEFAULT 0,
    total_amount numeric(15,2) NOT NULL,
    status character varying(50) DEFAULT 'Pending'::character varying,
    paid_amount numeric(15,2) DEFAULT 0,
    balance_amount numeric(15,2),
    paid_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payment_schedules OWNER TO eastern_estate;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_number character varying(50) NOT NULL,
    booking_id uuid,
    customer_id uuid NOT NULL,
    payment_date date NOT NULL,
    amount numeric(15,2) NOT NULL,
    payment_mode character varying(50) NOT NULL,
    payment_type character varying(50) NOT NULL,
    transaction_id character varying(255),
    bank_name character varying(255),
    cheque_number character varying(100),
    cheque_date date,
    utr_number character varying(100),
    payment_status character varying(50) DEFAULT 'PENDING'::character varying,
    receipt_number character varying(100),
    receipt_date date,
    remarks text,
    is_active boolean DEFAULT true,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payments OWNER TO eastern_estate;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.permissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100) NOT NULL,
    module character varying(50) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.permissions OWNER TO eastern_estate;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.projects (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_code character varying(50) NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    pincode character varying(15),
    status character varying(50),
    start_date date,
    end_date date,
    contact_person character varying(150),
    contact_email character varying(150),
    contact_phone character varying(25),
    gst_number character varying(25),
    pan_number character varying(25),
    finance_entity_name character varying(150),
    is_active boolean DEFAULT true,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.projects OWNER TO eastern_estate;

--
-- Name: properties; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.properties (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    property_type character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'PLANNED'::character varying,
    location text NOT NULL,
    address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    total_area numeric(15,2),
    built_up_area numeric(15,2),
    total_units integer DEFAULT 0,
    available_units integer DEFAULT 0,
    sold_units integer DEFAULT 0,
    price_per_sqft numeric(15,2),
    amenities jsonb,
    description text,
    rera_number character varying(100),
    launch_date date,
    completion_date date,
    is_active boolean DEFAULT true,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    country character varying(100),
    nearby_landmarks text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    area_unit character varying(20) DEFAULT 'sqft'::character varying,
    number_of_towers integer,
    number_of_units integer,
    floors_per_tower character varying(50),
    expected_completion_date date,
    actual_completion_date date,
    rera_status character varying(50),
    project_type character varying(50),
    price_min numeric(15,2),
    price_max numeric(15,2),
    expected_revenue numeric(18,2),
    bhk_types text,
    images jsonb,
    documents jsonb,
    is_featured boolean DEFAULT false,
    created_by uuid,
    updated_by uuid,
    project_id uuid,
    total_towers_planned integer,
    total_units_planned integer,
    inventory_checklist jsonb,
    data_completion_pct numeric(5,2) DEFAULT 0,
    data_completeness_status public.data_completeness_status_enum DEFAULT 'NOT_STARTED'::public.data_completeness_status_enum
);


ALTER TABLE public.properties OWNER TO eastern_estate;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number character varying(50) NOT NULL,
    order_date date NOT NULL,
    supplier_name character varying(255) NOT NULL,
    supplier_email character varying(255),
    supplier_phone character varying(20),
    supplier_address text,
    order_status character varying(50) DEFAULT 'DRAFT'::character varying,
    payment_status character varying(50) DEFAULT 'UNPAID'::character varying,
    payment_terms character varying(100),
    payment_due_date date,
    subtotal numeric(15,2) NOT NULL,
    discount_amount numeric(15,2) DEFAULT 0,
    tax_amount numeric(15,2) DEFAULT 0,
    shipping_cost numeric(15,2) DEFAULT 0,
    total_amount numeric(15,2) NOT NULL,
    paid_amount numeric(15,2) DEFAULT 0,
    balance_amount numeric(15,2),
    expected_delivery_date date,
    actual_delivery_date date,
    total_items_ordered integer DEFAULT 0,
    total_items_received integer DEFAULT 0,
    is_active boolean DEFAULT true,
    notes text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.purchase_orders OWNER TO eastern_estate;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    token character varying(500) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    ip_address character varying(50),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.refresh_tokens OWNER TO eastern_estate;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO eastern_estate;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100) NOT NULL,
    description text,
    is_system boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO eastern_estate;

--
-- Name: sales_targets; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.sales_targets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sales_person_id uuid NOT NULL,
    target_period public.target_period NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    target_leads integer DEFAULT 0,
    target_site_visits integer DEFAULT 0,
    target_conversions integer DEFAULT 0,
    target_bookings integer DEFAULT 0,
    target_revenue numeric(15,2) DEFAULT 0,
    self_target_bookings integer DEFAULT 0,
    self_target_revenue numeric(15,2) DEFAULT 0,
    self_target_notes text,
    achieved_leads integer DEFAULT 0,
    achieved_site_visits integer DEFAULT 0,
    achieved_conversions integer DEFAULT 0,
    achieved_bookings integer DEFAULT 0,
    achieved_revenue numeric(15,2) DEFAULT 0,
    leads_achievement_pct numeric(5,2) DEFAULT 0,
    site_visits_achievement_pct numeric(5,2) DEFAULT 0,
    conversions_achievement_pct numeric(5,2) DEFAULT 0,
    bookings_achievement_pct numeric(5,2) DEFAULT 0,
    revenue_achievement_pct numeric(5,2) DEFAULT 0,
    overall_achievement_pct numeric(5,2) DEFAULT 0,
    base_incentive numeric(15,2) DEFAULT 0,
    earned_incentive numeric(15,2) DEFAULT 0,
    bonus_incentive numeric(15,2) DEFAULT 0,
    total_incentive numeric(15,2) DEFAULT 0,
    incentive_paid boolean DEFAULT false,
    incentive_paid_date date,
    motivational_message text,
    missed_by integer DEFAULT 0,
    status public.target_status DEFAULT 'IN_PROGRESS'::public.target_status,
    set_by uuid,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by uuid
);


ALTER TABLE public.sales_targets OWNER TO eastern_estate;

--
-- Name: sales_tasks; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.sales_tasks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    task_type public.task_type NOT NULL,
    priority public.task_priority DEFAULT 'MEDIUM'::public.task_priority,
    status public.task_status DEFAULT 'PENDING'::public.task_status,
    assigned_to uuid NOT NULL,
    assigned_by uuid,
    due_date date NOT NULL,
    due_time time without time zone,
    estimated_duration_minutes integer DEFAULT 60,
    completed_at timestamp without time zone,
    lead_id uuid,
    customer_id uuid,
    property_id uuid,
    location character varying(255),
    location_details text,
    attendees text[],
    meeting_link character varying(500),
    send_reminder boolean DEFAULT true,
    reminder_before_minutes integer DEFAULT 1440,
    reminder_sent boolean DEFAULT false,
    reminder_sent_at timestamp without time zone,
    outcome text,
    notes text,
    attachments text[],
    is_recurring boolean DEFAULT false,
    recurrence_pattern character varying(50),
    parent_task_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid
);


ALTER TABLE public.sales_tasks OWNER TO eastern_estate;

--
-- Name: towers; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.towers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_id uuid,
    tower_code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    total_floors integer NOT NULL,
    flats_per_floor integer,
    total_flats integer,
    tower_size numeric(15,2),
    facing character varying(50),
    "position" character varying(100),
    has_lift boolean DEFAULT false,
    number_of_lifts integer DEFAULT 0,
    lift_capacity integer,
    has_stairs boolean DEFAULT true,
    number_of_stairs integer DEFAULT 1,
    parking_type character varying(50),
    parking_capacity integer,
    has_gym boolean DEFAULT false,
    has_garden boolean DEFAULT false,
    has_security_alarm boolean DEFAULT false,
    has_fire_alarm boolean DEFAULT false,
    is_vastu_compliant boolean DEFAULT false,
    has_central_ac boolean DEFAULT false,
    has_intercom boolean DEFAULT false,
    layout_images jsonb,
    arial_view_images jsonb,
    amenities jsonb,
    surrounding_description text,
    status character varying(50) DEFAULT 'Active'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    tower_number character varying(50) NOT NULL,
    total_units integer DEFAULT 0 NOT NULL,
    basement_levels integer DEFAULT 0 NOT NULL,
    units_per_floor character varying(200),
    construction_status public.tower_construction_status DEFAULT 'PLANNED'::public.tower_construction_status,
    construction_start_date date,
    completion_date date,
    rera_number character varying(100),
    built_up_area numeric(10,2),
    carpet_area numeric(10,2),
    ceiling_height numeric(4,2),
    vastu_compliant boolean DEFAULT true NOT NULL,
    special_features text,
    display_order integer DEFAULT 0 NOT NULL,
    floor_plans jsonb,
    images jsonb,
    units_planned integer DEFAULT 0,
    units_defined integer DEFAULT 0,
    tower_checklist jsonb,
    data_completion_pct numeric(5,2) DEFAULT 0,
    data_completeness_status public.data_completeness_status_enum DEFAULT 'NOT_STARTED'::public.data_completeness_status_enum,
    issues_count integer DEFAULT 0
);


ALTER TABLE public.towers OWNER TO eastern_estate;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    assigned_by uuid
);


ALTER TABLE public.user_roles OWNER TO eastern_estate;

--
-- Name: users; Type: TABLE; Schema: public; Owner: eastern_estate
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(20),
    alternate_phone character varying(20),
    date_of_birth date,
    gender character varying(20),
    profile_image text,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    email_verified_at timestamp without time zone,
    last_login_at timestamp without time zone,
    failed_login_attempts integer DEFAULT 0,
    locked_until timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


ALTER TABLE public.users OWNER TO eastern_estate;

--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.bookings (id, booking_number, customer_id, property_id, flat_id, booking_date, booking_amount, total_amount, paid_amount, balance_amount, status, payment_plan, possession_date, agreement_date, registry_date, is_home_loan, bank_name, loan_amount, loan_status, is_active, notes, metadata, created_at, updated_at) FROM stdin;
58369ae2-0b5b-4946-aa28-748f0bfc3fb0	BOOK-001	f1f70615-f977-4aa7-b448-f5636af8d83b	687c13c5-00ab-4e6e-ab5e-b53cc722e2a9	604d000c-ad34-4750-8b94-64d330796330	2025-01-15	500000.00	3800000.00	500000.00	3300000.00	CONFIRMED	\N	\N	\N	\N	f	\N	\N	\N	t	\N	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.campaigns (id, campaign_code, campaign_name, campaign_type, status, start_date, end_date, budget, actual_cost, target_audience, channel, leads_generated, conversions, roi, is_active, description, notes, metadata, created_at, updated_at) FROM stdin;
aeaece38-fb8f-4135-8478-bd4ea29eb3d3	CAMP-001	Monsoon Sale 2025	SEASONAL	ACTIVE	2025-06-01	2025-08-31	500000.00	0.00	\N	DIGITAL	45	0	\N	t	\N	\N	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909
e6604296-1cb3-4042-8414-9a4894723b35	CAMP-002	Festive Offers - Diwali	FESTIVE	PLANNED	2025-10-15	2025-11-15	750000.00	0.00	\N	MIXED	0	0	\N	t	\N	\N	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909
\.


--
-- Data for Name: construction_projects; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.construction_projects (id, project_code, project_name, property_id, project_type, status, start_date, estimated_end_date, actual_end_date, estimated_budget, actual_cost, contractor_name, contractor_contact, site_engineer, project_manager, completion_percentage, is_active, notes, metadata, created_at, updated_at) FROM stdin;
e61602ab-634b-4696-bb0d-326b42abff95	CONST-001	Eastern Heights - Phase 1	687c13c5-00ab-4e6e-ab5e-b53cc722e2a9	NEW_CONSTRUCTION	IN_PROGRESS	2024-06-01	2026-12-31	\N	150000000.00	0.00	BuildRight Contractors	\N	\N	\N	0.00	t	\N	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.customers (id, customer_code, full_name, email, phone_number, alternate_phone, date_of_birth, gender, occupation, company_name, address_line1, address_line2, city, state, pincode, country, pan_number, aadhar_number, customer_type, lead_source, assigned_sales_person, credit_limit, outstanding_balance, total_bookings, total_purchases, kyc_status, kyc_documents, is_active, notes, metadata, created_at, updated_at, requirement_type, property_preference, tentative_purchase_timeframe) FROM stdin;
f1f70615-f977-4aa7-b448-f5636af8d83b	CUST-001	Rajesh Kumar	rajesh.kumar@email.com	9876543210	\N	\N	\N	\N	\N	\N	\N	Mumbai	Maharashtra	\N	India	\N	\N	INDIVIDUAL	\N	\N	5000000.00	0.00	0	0.00	PENDING	\N	t	\N	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909	END_USER	FLAT	\N
b0ccff88-95ca-49c6-98f9-86e5cd2b2c10	CUST-002	Priya Sharma	priya.sharma@email.com	9876543211	\N	\N	\N	\N	\N	\N	\N	Delhi	Delhi	\N	India	\N	\N	INDIVIDUAL	\N	\N	3000000.00	0.00	0	0.00	PENDING	\N	t	\N	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909	END_USER	FLAT	\N
47bada94-3758-497d-99f3-0d37298e7bb9	CUST-003	Amit Patel	amit.patel@email.com	9876543212	\N	\N	\N	\N	\N	\N	\N	Ahmedabad	Gujarat	\N	India	\N	\N	INDIVIDUAL	\N	\N	4000000.00	0.00	0	0.00	PENDING	\N	t	\N	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909	END_USER	FLAT	\N
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.employees (id, employee_code, full_name, email, phone_number, alternate_phone, date_of_birth, gender, blood_group, marital_status, current_address, permanent_address, city, state, pincode, department, designation, employment_type, employment_status, joining_date, confirmation_date, resignation_date, last_working_date, reporting_manager_id, reporting_manager_name, basic_salary, house_rent_allowance, transport_allowance, medical_allowance, other_allowances, gross_salary, pf_deduction, esi_deduction, tax_deduction, other_deductions, net_salary, bank_name, bank_account_number, ifsc_code, branch_name, aadhar_number, pan_number, pf_number, esi_number, uan_number, documents, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, casual_leave_balance, sick_leave_balance, earned_leave_balance, leave_taken, total_present, total_absent, total_late_arrival, skills, qualifications, experience, performance_rating, last_review_date, notes, tags, is_active, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: flats; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.flats (id, property_id, flat_number, floor_number, flat_type, bhk_type, carpet_area, built_up_area, super_built_up_area, base_price, total_price, status, facing, balconies, bathrooms, is_corner_unit, parking_slots, amenities, is_active, metadata, created_at, updated_at, name, description, type, floor, bedrooms, servant_room, study_room, pooja_room, balcony_area, price_per_sqft, registration_charges, maintenance_charges, parking_charges, discount_amount, final_price, is_available, available_from, expected_possession, vastu_compliant, corner_unit, road_facing, park_facing, covered_parking, furnishing_status, special_features, floor_plan_url, images, virtual_tour_url, customer_id, booking_date, sold_date, token_amount, payment_plan, remarks, display_order, created_by, updated_by, tower_id, flat_checklist, data_completion_pct, completeness_status, issues, issues_count) FROM stdin;
604d000c-ad34-4750-8b94-64d330796330	687c13c5-00ab-4e6e-ab5e-b53cc722e2a9	101	1	2BHK	2	850.00	1000.00	\N	3500000.00	3800000.00	AVAILABLE	EAST	0	0	f	0	\N	t	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909	\N	\N	2BHK	1	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	\N	\N	t	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	0.00	NOT_STARTED	\N	0
00e8634d-faae-40d9-9e96-9dfa7097b1e6	687c13c5-00ab-4e6e-ab5e-b53cc722e2a9	201	2	3BHK	3	1200.00	1400.00	\N	5000000.00	5500000.00	AVAILABLE	NORTH	0	0	f	0	\N	t	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909	\N	\N	2BHK	1	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	\N	\N	t	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	0.00	NOT_STARTED	\N	0
1adad72f-3925-4059-9a1f-51c95eae2006	7d74b563-4425-41b5-9f8d-e5cf77f70738	301	3	2BHK	2	900.00	1050.00	\N	3200000.00	3500000.00	BOOKED	SOUTH	0	0	f	0	\N	t	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909	\N	\N	2BHK	1	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	\N	\N	t	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	0.00	NOT_STARTED	\N	0
873f3eb5-e796-4e6c-b4e2-4f070d277421	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0101	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0101	\N	2BHK	1	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
501e546b-979e-4660-abf9-9d8bf30ac580	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0102	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0102	\N	2BHK	1	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
6cefa086-77b6-4793-9113-e6ddc934954a	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0103	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0103	\N	2BHK	1	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	3	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
cc5be36f-9b13-4958-a2e5-2b3d638b617b	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0104	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0104	\N	2BHK	1	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
cb5b4335-d603-4483-bc8f-a07bcd4347dd	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0201	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0201	\N	2BHK	2	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
79ab2460-45e9-4028-80b4-a201763eb586	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0202	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0202	\N	2BHK	2	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
0e9c0616-8aab-40e9-885e-50660efc3a4c	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0203	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0203	\N	2BHK	2	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	7	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
ce4d6f09-02a5-4b26-9d9a-030fd3f7fab7	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0204	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0204	\N	2BHK	2	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
08743655-7c14-48f8-9135-e537aafafec3	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0301	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0301	\N	2BHK	3	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	9	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
c57d51fa-9030-47c8-9745-c2386be663ef	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0302	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0302	\N	2BHK	3	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	10	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
45fca691-ca7c-4bc3-a927-69bcfe3b49d9	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0303	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0303	\N	2BHK	3	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	11	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
578ba0ec-2520-404a-a144-0247a0d81a28	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0304	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0304	\N	2BHK	3	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	12	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
73fa17be-da39-4c3a-9087-8f4574e9ee2d	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0401	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0401	\N	2BHK	4	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	13	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
e79f4a65-fad5-47c5-a827-7cfff5328e91	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0402	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0402	\N	2BHK	4	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	14	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
2df751bf-237d-487f-b832-2fcf95a860fc	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0403	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0403	\N	2BHK	4	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	15	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
f7858432-687a-473f-8c7e-47583c7b177e	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0404	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0404	\N	2BHK	4	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
db1cdf4f-7524-44b9-8299-854d1061bb6d	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0501	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0501	\N	2BHK	5	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	17	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
7308b376-ed9e-4eb1-9817-37874984a6da	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0502	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0502	\N	2BHK	5	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	18	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
4f13f87f-474a-483d-bf46-7e494bcc0199	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0503	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0503	\N	2BHK	5	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	19	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
05f82952-4f19-46e1-bce8-0afe76c0f7f6	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0504	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0504	\N	2BHK	5	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
96bcccaa-d9d3-4884-a10a-c74a03a3f0a7	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0601	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0601	\N	2BHK	6	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
02ae7cb2-71cb-40d2-8238-ef11d154c665	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0602	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0602	\N	2BHK	6	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	22	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
1ba96748-aeca-4e22-bad4-1fbac502caeb	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0603	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0603	\N	2BHK	6	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	23	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
a37146e7-42bf-4897-aaa8-507a695839db	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0604	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0604	\N	2BHK	6	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	24	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
aae53127-4c2d-4c12-9b8e-df671a5e3bc1	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0701	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0701	\N	2BHK	7	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	25	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
91ffd1ba-e793-4d49-a6b2-fff3416d32b5	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0702	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0702	\N	2BHK	7	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	26	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
737c70eb-66fd-46ee-a949-77fbc3dd0daa	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0703	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0703	\N	2BHK	7	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	27	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
420a3bb1-409d-461c-a269-fa337ab8075b	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0704	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0704	\N	2BHK	7	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	28	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
55c6b243-c07d-4a67-ac3b-a6ede1934302	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0801	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0801	\N	2BHK	8	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	29	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
67f9ae50-8888-4be5-acb7-aed21059a6a1	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0802	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0802	\N	2BHK	8	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	30	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
1c1f5451-0c55-4b77-8bd7-2edd50efa229	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0803	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0803	\N	2BHK	8	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	31	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
fb0795c9-b8a4-4a7b-a78c-08297f2e7f92	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0804	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0804	\N	2BHK	8	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	32	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
6349ef0b-e2ad-4eec-910d-e770f05bec29	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0901	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0901	\N	2BHK	9	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	33	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
9a2dee30-d310-4c17-bd55-28d390d36092	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0902	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0902	\N	2BHK	9	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	34	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
94a1ee60-fe27-4a81-ba36-d1c474d069c1	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0903	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0903	\N	2BHK	9	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	35	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
07e5c8f2-a237-4d5d-8d48-2a1d923be1a6	266d7d6f-e5b1-46a1-9003-c065d803f041	B2-0904	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	UNDER_CONSTRUCTION	\N	1	2	f	0	\N	t	\N	2025-10-19 00:51:15.202949	2025-10-19 00:51:15.202949	Unit B2-0904	\N	2BHK	9	2	f	f	f	\N	\N	\N	\N	\N	\N	0.00	t	2025-10-26	2025-10-26	t	f	f	f	f	Unfurnished	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	36	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	\N	\N	NOT_STARTED	\N	0
c7097d87-f257-4b60-a969-5e9fc4d60312	266d7d6f-e5b1-46a1-9003-c065d803f041	test	\N	\N	\N	1.00	1.00	1.00	1.00	1.00	BOOKED	\N	1	2	f	1	\N	t	\N	2025-10-19 01:01:50.310519	2025-10-19 01:01:50.310519	test	\N	STUDIO	1	2	t	f	f	0.00	1.00	1.00	1.00	1.00	1.00	1.00	t	\N	\N	f	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	b1437242-cc66-4122-8d8f-df337bf8a851	{"has_area": true, "has_facing": false, "has_pricing": true, "has_amenities": false, "has_parking_map": true}	60.00	NEEDS_REVIEW	["Facing direction missing", "Amenities not provided"]	2
\.


--
-- Data for Name: floors; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.floors (id, tower_id, floor_number, floor_name, total_flats, created_at) FROM stdin;
\.


--
-- Data for Name: followups; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.followups (id, lead_id, follow_up_date, follow_up_type, duration_minutes, performed_by, outcome, feedback, customer_response, actions_taken, lead_status_before, lead_status_after, next_follow_up_date, next_follow_up_plan, is_site_visit, site_visit_property, site_visit_rating, site_visit_feedback, interest_level, budget_fit, timeline_fit, reminder_sent, reminder_sent_at, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.inventory_items (id, item_code, item_name, description, category, brand, model, quantity, unit, minimum_stock, maximum_stock, reorder_point, unit_price, total_value, stock_status, supplier_name, supplier_email, supplier_phone, warehouse_location, rack_number, bin_number, last_purchase_date, last_purchase_price, total_issued, total_received, is_active, notes, metadata, created_at, updated_at) FROM stdin;
1d6f42d7-faac-433a-afd0-3c508015a9cf	INV-001	Portland Cement - OPC 53	\N	CONSTRUCTION_MATERIAL	\N	\N	500.00	BAG	0.00	\N	\N	350.00	175000.00	IN_STOCK	ABC Cement Suppliers	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	t	\N	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909
5f12166f-977b-4046-bc87-b3371ac68fb5	INV-002	Steel TMT Bars - 12mm	\N	CONSTRUCTION_MATERIAL	\N	\N	10000.00	KG	0.00	\N	\N	65.00	650000.00	IN_STOCK	Steel Corporation Ltd	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	t	\N	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909
1a84cf42-ab3a-433d-8e18-f788e6f82d44	INV-003	Ceramic Floor Tiles	\N	TILES	\N	\N	2000.00	SQ_METER	0.00	\N	\N	450.00	900000.00	IN_STOCK	Tile World	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	t	\N	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.leads (id, lead_code, full_name, email, phone_number, alternate_phone, source, status, priority, interested_in, budget_min, budget_max, timeline, assigned_to, address_line1, city, state, country, notes, follow_up_date, last_contact_date, converted_to_customer, customer_id, is_active, metadata, created_at, updated_at, site_visit_status, site_visit_time, last_site_visit_date, requirement_type, property_preference, tentative_purchase_timeframe, last_follow_up_feedback, total_follow_ups, send_follow_up_reminder, reminder_sent, reminder_sent_at) FROM stdin;
16e9d288-5805-403a-a3c8-f6144bd13c86	LEAD-001	Sunita Reddy	sunita.reddy@email.com	9876543220	\N	WEBSITE	NEW	HIGH	2 BHK Flat	3000000.00	4000000.00	\N	Sales Team	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909	NOT_SCHEDULED	\N	\N	END_USER	FLAT	\N	\N	0	t	f	\N
bad2e73b-1e0a-4ced-b195-e91080706ed5	LEAD-002	Vikram Singh	vikram.singh@email.com	9876543221	\N	REFERRAL	CONTACTED	MEDIUM	3 BHK Flat	5000000.00	6000000.00	\N	Sales Team	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909	NOT_SCHEDULED	\N	\N	END_USER	FLAT	\N	\N	0	t	f	\N
94847639-8fa2-4161-af00-0b404b1434a0	LEAD-003	Anjali Gupta	anjali.gupta@email.com	9876543222	\N	SOCIAL_MEDIA	QUALIFIED	HIGH	Villa	8000000.00	10000000.00	\N	Sales Team	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909	NOT_SCHEDULED	\N	\N	END_USER	FLAT	\N	\N	0	t	f	\N
9783713c-a91b-435a-a0ba-783dceb3239d	LEAD-004	Rajesh Kumar	rajesh.kumar@email.com	9876543210	\N	REFERRAL	QUALIFIED	HIGH	\N	8000000.00	12000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-04 21:23:36.570729	2025-10-19 21:23:36.570729	DONE	\N	\N	END_USER	FLAT	1-3 months	\N	5	t	f	\N
2a34b821-7d84-458c-86a7-427948227a09	LEAD-005	Priya Sharma	priya.sharma@email.com	9876543211	\N	WEBSITE	NEGOTIATION	HIGH	\N	10000000.00	15000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-07 21:23:36.570729	2025-10-19 21:23:36.570729	DONE	\N	\N	INVESTOR	DUPLEX	1-3 months	\N	4	t	f	\N
db1ed0ad-ecda-41d9-8044-ff9715bcbfe5	LEAD-006	Amit Patel	amit.patel@email.com	9876543212	\N	WALK_IN	QUALIFIED	HIGH	\N	6000000.00	9000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-09 21:23:36.570729	2025-10-19 21:23:36.570729	SCHEDULED	\N	\N	END_USER	FLAT	3-6 months	\N	3	t	f	\N
6948b32f-6192-4411-846e-125f3ab1b3a3	LEAD-007	Sneha Reddy	sneha.reddy@email.com	9876543213	\N	SOCIAL_MEDIA	CONTACTED	MEDIUM	\N	7000000.00	11000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-11 21:23:36.570729	2025-10-19 21:23:36.570729	PENDING	\N	\N	END_USER	FLAT	3-6 months	\N	2	t	f	\N
5e5f01fb-306f-4a0d-8dd8-55bd5eaf6221	LEAD-008	Vikram Singh	vikram.singh@email.com	9876543214	\N	ADVERTISEMENT	CONTACTED	MEDIUM	\N	12000000.00	18000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-12 21:23:36.570729	2025-10-19 21:23:36.570729	NOT_SCHEDULED	\N	\N	INVESTOR	PENTHOUSE	6-12 months	\N	2	t	f	\N
4c3d25f9-6178-4213-a36b-022ec32f1dd1	LEAD-009	Anita Desai	anita.desai@email.com	9876543215	\N	REFERRAL	QUALIFIED	MEDIUM	\N	8500000.00	13000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-13 21:23:36.570729	2025-10-19 21:23:36.570729	DONE	\N	\N	END_USER	DUPLEX	3-6 months	\N	3	t	f	\N
fe49dfb3-0e2d-4fe7-942f-3e776ee83e92	LEAD-010	Rahul Mehta	rahul.mehta@email.com	9876543216	\N	WEBSITE	CONTACTED	MEDIUM	\N	9000000.00	14000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-14 21:23:36.570729	2025-10-19 21:23:36.570729	PENDING	\N	\N	BOTH	FLAT	6-12 months	\N	2	t	f	\N
6e077882-3e09-4d52-89d2-df198b5ed847	LEAD-011	Kavita Joshi	kavita.joshi@email.com	9876543217	\N	PHONE	NEW	MEDIUM	\N	7500000.00	10500000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-16 21:23:36.570729	2025-10-19 21:23:36.570729	NOT_SCHEDULED	\N	\N	END_USER	FLAT	3-6 months	\N	1	t	f	\N
3d0292ae-0cdc-4ad1-a7e6-8a6ed2b392a9	LEAD-012	Sanjay Gupta	sanjay.gupta@email.com	9876543218	\N	SOCIAL_MEDIA	NEW	MEDIUM	\N	11000000.00	16000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-17 21:23:36.570729	2025-10-19 21:23:36.570729	NOT_SCHEDULED	\N	\N	INVESTOR	DUPLEX	1-3 months	\N	0	t	f	\N
d4686088-6c09-4de7-81df-88c23f4b0319	LEAD-013	Meera Kapoor	meera.kapoor@email.com	9876543219	\N	WEBSITE	CONTACTED	MEDIUM	\N	8000000.00	12000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-17 21:23:36.570729	2025-10-19 21:23:36.570729	NOT_SCHEDULED	\N	\N	END_USER	FLAT	6-12 months	\N	1	t	f	\N
027bb4b1-85df-434c-bd93-d203b9651e35	LEAD-014	Arun Nair	arun.nair@email.com	9876543220	\N	EMAIL	CONTACTED	LOW	\N	6000000.00	8000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-09-29 21:23:36.570729	2025-10-19 21:23:36.570729	NOT_SCHEDULED	\N	\N	END_USER	FLAT	1+ year	\N	1	t	f	\N
f7d8f228-9607-4215-a478-c803e10eb80a	LEAD-015	Divya Iyer	divya.iyer@email.com	9876543221	\N	WEBSITE	NEW	LOW	\N	5500000.00	7500000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-18 21:23:36.570729	2025-10-19 21:23:36.570729	NOT_SCHEDULED	\N	\N	END_USER	FLAT	1+ year	\N	0	t	f	\N
dd683039-4922-46c8-b676-15b6b2f3668b	LEAD-016	Rohan Malhotra	rohan.malhotra@email.com	9876543222	\N	REFERRAL	QUALIFIED	HIGH	\N	15000000.00	20000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-01 21:23:36.570729	2025-10-19 21:23:36.570729	DONE	\N	\N	INVESTOR	PENTHOUSE	1-3 months	\N	6	t	f	\N
d8a3fb49-096d-4f3c-bacf-cc213a43d549	LEAD-017	Pooja Verma	pooja.verma@email.com	9876543223	\N	WALK_IN	CONTACTED	MEDIUM	\N	7000000.00	10000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-15 21:23:36.570729	2025-10-19 21:23:36.570729	SCHEDULED	\N	\N	END_USER	FLAT	3-6 months	\N	2	t	f	\N
16f3a680-5f4d-401d-9d2e-46145edc6b39	LEAD-018	Arjun Rao	arjun.rao@email.com	9876543224	\N	BROKER	NEGOTIATION	HIGH	\N	9500000.00	14500000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-05 21:23:36.570729	2025-10-19 21:23:36.570729	DONE	\N	\N	END_USER	DUPLEX	1-3 months	\N	5	t	f	\N
859def30-5a52-40c1-9332-cc8af4b45f8e	LEAD-019	Nisha Bose	nisha.bose@email.com	9876543225	\N	WEBSITE	QUALIFIED	MEDIUM	\N	8500000.00	12500000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-10 21:23:36.570729	2025-10-19 21:23:36.570729	PENDING	\N	\N	BOTH	FLAT	3-6 months	\N	3	t	f	\N
779b0710-0dc8-46ec-9e37-f8e0fb1240fc	LEAD-020	Kiran Shah	kiran.shah@email.com	9876543226	\N	SOCIAL_MEDIA	CONTACTED	MEDIUM	\N	6500000.00	9500000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-14 21:23:36.570729	2025-10-19 21:23:36.570729	NOT_SCHEDULED	\N	\N	END_USER	FLAT	6-12 months	\N	1	t	f	\N
94d7a9e8-cc6b-45cb-bd69-e62bf768ac82	LEAD-021	Manish Agarwal	manish.agarwal@email.com	9876543227	\N	PHONE	NEW	LOW	\N	5000000.00	7000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-18 21:23:36.570729	2025-10-19 21:23:36.570729	NOT_SCHEDULED	\N	\N	END_USER	FLAT	1+ year	\N	0	t	f	\N
30bf0f2c-6bbe-4600-9da3-fc0b601a66ef	LEAD-022	Swati Pillai	swati.pillai@email.com	9876543228	\N	REFERRAL	QUALIFIED	HIGH	\N	10000000.00	15000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-03 21:23:36.570729	2025-10-19 21:23:36.570729	DONE	\N	\N	INVESTOR	DUPLEX	1-3 months	\N	4	t	f	\N
80fa6a21-1932-405d-981c-2ba9169c0a01	LEAD-023	Deepak Sinha	deepak.sinha@email.com	9876543229	\N	WEBSITE	CONTACTED	MEDIUM	\N	7500000.00	11000000.00	\N	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	India	\N	\N	\N	f	\N	t	\N	2025-10-13 21:23:36.570729	2025-10-19 21:23:36.570729	PENDING	\N	\N	END_USER	FLAT	3-6 months	\N	2	t	f	\N
\.


--
-- Data for Name: payment_schedules; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.payment_schedules (id, booking_id, installment_number, installment_type, description, due_date, amount, gst_amount, total_amount, status, paid_amount, balance_amount, paid_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.payments (id, payment_number, booking_id, customer_id, payment_date, amount, payment_mode, payment_type, transaction_id, bank_name, cheque_number, cheque_date, utr_number, payment_status, receipt_number, receipt_date, remarks, is_active, metadata, created_at, updated_at) FROM stdin;
5091c642-2e79-49ff-8853-16df60c3df38	PAY-001	58369ae2-0b5b-4946-aa28-748f0bfc3fb0	f1f70615-f977-4aa7-b448-f5636af8d83b	2025-01-15	500000.00	CHEQUE	BOOKING	\N	\N	\N	\N	\N	COMPLETED	RCP-001	\N	\N	t	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.permissions (id, name, display_name, module, description, created_at) FROM stdin;
03a352cd-2bb5-43ff-98b2-e2f48a790073	users.view	View Users	users	\N	2025-10-16 10:50:02.09914
128d5b63-8ed2-4b80-9d3a-4e5205271ad0	users.create	Create Users	users	\N	2025-10-16 10:50:02.09914
6f0e942d-9f48-4413-9f74-41620386a391	users.update	Update Users	users	\N	2025-10-16 10:50:02.09914
4afc1eb2-07ba-4e66-b3ee-e0e6d1060f10	users.delete	Delete Users	users	\N	2025-10-16 10:50:02.09914
dee2a1af-36c0-4924-a68d-c7a86de8453f	properties.view	View Properties	properties	\N	2025-10-16 10:50:02.09914
594cc978-babd-41ff-9f24-0f50a3288f41	properties.create	Create Properties	properties	\N	2025-10-16 10:50:02.09914
69ae5c8d-6ad1-4504-8167-c9d48df58a09	properties.update	Update Properties	properties	\N	2025-10-16 10:50:02.09914
6e2048bb-5b66-444c-8d17-a315e46ecde1	properties.delete	Delete Properties	properties	\N	2025-10-16 10:50:02.09914
bbb94c2b-d86b-4395-9722-46f5ed7ff96b	inventory.view	View Inventory	inventory	\N	2025-10-16 10:50:02.09914
04bc6518-8475-4685-8171-f83a2b591a37	inventory.update	Update Inventory	inventory	\N	2025-10-16 10:50:02.09914
dfd5fc01-c1d9-4e98-a445-78e6414dc56f	leads.view	View Leads	sales	\N	2025-10-16 10:50:02.09914
b9c27ee8-151a-47a5-93c9-2880bfa339f4	leads.create	Create Leads	sales	\N	2025-10-16 10:50:02.09914
5861e5b3-3f12-488c-8cc9-8dccb20ce9ac	leads.update	Update Leads	sales	\N	2025-10-16 10:50:02.09914
a775a01e-6884-47a2-8ac0-a6446162f32c	bookings.view	View Bookings	sales	\N	2025-10-16 10:50:02.09914
042fac99-2189-48ab-9154-84221a166639	bookings.create	Create Bookings	sales	\N	2025-10-16 10:50:02.09914
19e42bd3-17c4-4c85-bada-3c70d9582084	bookings.update	Update Bookings	sales	\N	2025-10-16 10:50:02.09914
6088d469-b020-4cea-b231-603c6619b59b	payments.view	View Payments	payments	\N	2025-10-16 10:50:02.09914
3bc857e1-0563-4093-b157-4a7b02adb8cd	payments.create	Create Payments	payments	\N	2025-10-16 10:50:02.09914
c3981bd4-8d4c-4eb9-b4f9-db858eb8647e	payments.update	Update Payments	payments	\N	2025-10-16 10:50:02.09914
992eacf7-2184-4a78-b3be-023d240e73ff	reports.view	View Reports	reports	\N	2025-10-16 10:50:02.09914
6995cb09-fd97-4611-8492-b90de9e43982	reports.export	Export Reports	reports	\N	2025-10-16 10:50:02.09914
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.projects (id, project_code, name, description, address, city, state, country, pincode, status, start_date, end_date, contact_person, contact_email, contact_phone, gst_number, pan_number, finance_entity_name, is_active, created_by, updated_by, created_at, updated_at) FROM stdin;
d2594136-aae6-4351-b234-95dce53a9582	EE-Proj-999	Diamond City	\N	\N	Ranchi	Jharkhand	India	\N	Planning	\N	\N	\N	\N	\N	\N	\N	\N	t	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	2025-10-18 20:43:29.857645+05:30	2025-10-18 20:43:29.857645+05:30
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.properties (id, property_code, name, property_type, status, location, address, city, state, pincode, total_area, built_up_area, total_units, available_units, sold_units, price_per_sqft, amenities, description, rera_number, launch_date, completion_date, is_active, metadata, created_at, updated_at, country, nearby_landmarks, latitude, longitude, area_unit, number_of_towers, number_of_units, floors_per_tower, expected_completion_date, actual_completion_date, rera_status, project_type, price_min, price_max, expected_revenue, bhk_types, images, documents, is_featured, created_by, updated_by, project_id, total_towers_planned, total_units_planned, inventory_checklist, data_completion_pct, data_completeness_status) FROM stdin;
687c13c5-00ab-4e6e-ab5e-b53cc722e2a9	PROP-001	Eastern Heights	RESIDENTIAL	UNDER_CONSTRUCTION	Andheri West	\N	Mumbai	Maharashtra	\N	50000.00	\N	100	75	0	15000.00	\N	\N	\N	2024-01-15	\N	t	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909	\N	\N	\N	\N	sqft	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	0.00	NOT_STARTED
7d74b563-4425-41b5-9f8d-e5cf77f70738	PROP-002	Green Valley Homes	RESIDENTIAL	COMPLETED	Whitefield	\N	Bangalore	Karnataka	\N	75000.00	\N	150	50	0	12000.00	\N	\N	\N	2023-06-01	\N	t	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909	\N	\N	\N	\N	sqft	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	0.00	NOT_STARTED
7457164b-5e11-4381-aea1-5670c89a8df8	PROP-003	Sunrise Villas	RESIDENTIAL	PLANNED	Gachibowli	\N	Hyderabad	Telangana	\N	100000.00	\N	80	80	0	18000.00	\N	\N	\N	2025-03-01	\N	t	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909	\N	\N	\N	\N	sqft	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	0.00	NOT_STARTED
0212c99b-839e-40c0-b50a-e94685f39443	EECD-DCR-999	Diamond City	commercial	Planning	Test	Test	Test	bihar	111111	20.00	20.00	0	0	0	\N	\N	\N	Test	2025-10-18	\N	t	\N	2025-10-18 15:24:57.272884	2025-10-18 15:24:57.272884	India	Test	\N	\N	acres	40	400	G+10	2025-10-25	\N	cnt_free	commercial	2000.00	19998.00	200000.00	Test	\N	\N	f	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	\N	\N	0.00	NOT_STARTED
266d7d6f-e5b1-46a1-9003-c065d803f041	EECD-DCR-990	Test	township	Planning	Test	Test	Test	jharkhand	111111	2.00	2.00	0	0	0	\N	\N	\N	Test	2025-10-18	\N	t	\N	2025-10-18 16:37:58.245444	2025-10-18 16:37:58.245444	India	Test	\N	\N	acres	12	200	G+4	2025-10-25	\N	registered	township	2000.00	19999.00	20000.00	2BHK	\N	\N	f	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	\N	\N	\N	\N	0.00	NOT_STARTED
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.purchase_orders (id, order_number, order_date, supplier_name, supplier_email, supplier_phone, supplier_address, order_status, payment_status, payment_terms, payment_due_date, subtotal, discount_amount, tax_amount, shipping_cost, total_amount, paid_amount, balance_amount, expected_delivery_date, actual_delivery_date, total_items_ordered, total_items_received, is_active, notes, metadata, created_at, updated_at) FROM stdin;
8e0e4670-2bc5-40be-8cfa-395bac12011c	PO-001	2025-01-10	ABC Cement Suppliers	\N	9876500001	\N	APPROVED	PARTIALLY_PAID	\N	\N	175000.00	0.00	0.00	0.00	189000.00	0.00	\N	\N	\N	500	0	t	\N	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909
d7404370-d58a-4a37-a34e-2406d8ea579a	PO-002	2025-01-12	Steel Corporation Ltd	\N	9876500002	\N	ORDERED	UNPAID	\N	\N	650000.00	0.00	0.00	0.00	702000.00	0.00	\N	\N	\N	10000	0	t	\N	\N	2025-10-16 11:49:23.195909	2025-10-16 11:49:23.195909
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.refresh_tokens (id, user_id, token, expires_at, ip_address, user_agent, created_at) FROM stdin;
0c7400a6-9c72-4649-9a07-c37fb74cb734	0e034d20-3aa4-4dff-b90f-126bff07a5c1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZTAzNGQyMC0zYWE0LTRkZmYtYjkwZi0xMjZiZmYwN2E1YzEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MDU5Mjg5NiwiZXhwIjoxNzYxMTk3Njk2fQ.nDfQDQAMAqTRNispO6XLCGuuMMiCWZbnL5asx_HrE7Y	2025-10-23 11:04:56.848	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	2025-10-16 11:04:56.849595
d74eab73-0d38-473f-bbf2-6d6936a12f2c	0e034d20-3aa4-4dff-b90f-126bff07a5c1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZTAzNGQyMC0zYWE0LTRkZmYtYjkwZi0xMjZiZmYwN2E1YzEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MDc4MjIyNiwiZXhwIjoxNzYxMzg3MDI2fQ.C9FkSh7s5HRs9fmXcWAGZRCPHoE3EjvQtSIkVOJZqI4	2025-10-25 15:40:26.43	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-10-18 15:40:26.431129
c9ff3bf3-ef90-4a45-819c-cc490f3ab2db	0e034d20-3aa4-4dff-b90f-126bff07a5c1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZTAzNGQyMC0zYWE0LTRkZmYtYjkwZi0xMjZiZmYwN2E1YzEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MDkwNzQ3MiwiZXhwIjoxNzYxNTEyMjcyfQ.s3F7vuDjFo-T7IafpprkJRXRVzjaM0NzqIAJmK5_LoU	2025-10-27 02:27:52.848	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-10-20 02:27:52.848928
82f2b2c0-a4bd-42f9-b6b3-6102085376e7	0e034d20-3aa4-4dff-b90f-126bff07a5c1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZTAzNGQyMC0zYWE0LTRkZmYtYjkwZi0xMjZiZmYwN2E1YzEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MDkwNzU2NiwiZXhwIjoxNzYxNTEyMzY2fQ.0Z0mlJ6SW-9c77q9s-87azXnWxvuxsk8NPaWw0RnFGI	2025-10-27 02:29:26.778	::1	curl/8.7.1	2025-10-20 02:29:26.779205
f4b9995f-f00b-4058-a83f-fc773ac10605	0e034d20-3aa4-4dff-b90f-126bff07a5c1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZTAzNGQyMC0zYWE0LTRkZmYtYjkwZi0xMjZiZmYwN2E1YzEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MDkwODAwNSwiZXhwIjoxNzYxNTEyODA1fQ.y1qfgINOVivpEXkx--oprhod-Hmi0l8kK_TdSvZJdF8	2025-10-27 02:36:45.162	::1	curl/8.7.1	2025-10-20 02:36:45.163041
572cdd38-46c5-48c2-99e6-46e07269a39d	0e034d20-3aa4-4dff-b90f-126bff07a5c1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZTAzNGQyMC0zYWE0LTRkZmYtYjkwZi0xMjZiZmYwN2E1YzEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MDkwODA4NywiZXhwIjoxNzYxNTEyODg3fQ.stGauUfa-hWOcuvJcghuwxOg-6xmKY8eYXRze6SKd18	2025-10-27 02:38:07.057	::1	curl/8.7.1	2025-10-20 02:38:07.058997
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.roles (id, name, display_name, description, is_system, is_active, created_at, updated_at) FROM stdin;
fdbb55c5-5319-4a67-b8ad-11c423f45a19	super_admin	Super Administrator	Full system access	t	t	2025-10-16 10:50:02.057344	2025-10-16 10:50:02.057344
8a258a6e-063d-46b0-bee1-1906a799bef0	admin	Administrator	Administrative access	t	t	2025-10-16 10:50:02.057344	2025-10-16 10:50:02.057344
5e00117a-93d3-4bc4-8076-68903a5babc4	accountant	Accountant	Accounting and finance access	f	t	2025-10-16 10:50:02.057344	2025-10-16 10:50:02.057344
9002bb71-3b43-4736-a19d-da355422d0a7	sales_manager	Sales Manager	Sales team management	f	t	2025-10-16 10:50:02.057344	2025-10-16 10:50:02.057344
a7f354c5-0dad-48d5-a8e4-e3debc851595	sales_executive	Sales Executive	Sales operations	f	t	2025-10-16 10:50:02.057344	2025-10-16 10:50:02.057344
5cfb965a-074f-40f7-99b3-8e87fbeaad6e	marketing_manager	Marketing Manager	Marketing operations	f	t	2025-10-16 10:50:02.057344	2025-10-16 10:50:02.057344
d3595dd4-15f4-468d-beaa-59bdea3fea42	construction_manager	Construction Manager	Construction management	f	t	2025-10-16 10:50:02.057344	2025-10-16 10:50:02.057344
c0d31e5e-a153-46b5-87dd-42e4c383ced9	store_keeper	Store Keeper	Store and inventory management	f	t	2025-10-16 10:50:02.057344	2025-10-16 10:50:02.057344
ffd996c5-f0fa-4c49-8c75-19687d110256	hr_manager	HR Manager	HR operations	f	t	2025-10-16 10:50:02.057344	2025-10-16 10:50:02.057344
001fc636-5e91-4bc7-b25e-381cff99e50f	customer	Customer	Customer portal access	t	t	2025-10-16 10:50:02.057344	2025-10-16 10:50:02.057344
473bb99f-60f6-4223-b214-3ee185ce6d81	broker	Broker	Broker portal access	t	t	2025-10-16 10:50:02.057344	2025-10-16 10:50:02.057344
\.


--
-- Data for Name: sales_targets; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.sales_targets (id, sales_person_id, target_period, start_date, end_date, target_leads, target_site_visits, target_conversions, target_bookings, target_revenue, self_target_bookings, self_target_revenue, self_target_notes, achieved_leads, achieved_site_visits, achieved_conversions, achieved_bookings, achieved_revenue, leads_achievement_pct, site_visits_achievement_pct, conversions_achievement_pct, bookings_achievement_pct, revenue_achievement_pct, overall_achievement_pct, base_incentive, earned_incentive, bonus_incentive, total_incentive, incentive_paid, incentive_paid_date, motivational_message, missed_by, status, set_by, notes, is_active, created_at, updated_at, updated_by) FROM stdin;
c8fbd94c-d666-42ed-b066-325e02ca48f3	0e034d20-3aa4-4dff-b90f-126bff07a5c1	MONTHLY	2025-10-01	2025-10-31	50	25	10	5	50000000.00	6	60000000.00	\N	38	18	7	3	37500000.00	76.00	72.00	70.00	60.00	75.00	70.60	50000.00	35300.00	0.00	85300.00	f	\N	🎯 Great progress! You're at 70.6% achievement. Just 2 more bookings to hit your target!	0	IN_PROGRESS	\N	\N	t	2025-10-19 21:23:36.570729	2025-10-19 21:23:36.570729	\N
\.


--
-- Data for Name: sales_tasks; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.sales_tasks (id, title, description, task_type, priority, status, assigned_to, assigned_by, due_date, due_time, estimated_duration_minutes, completed_at, lead_id, customer_id, property_id, location, location_details, attendees, meeting_link, send_reminder, reminder_before_minutes, reminder_sent, reminder_sent_at, outcome, notes, attachments, is_recurring, recurrence_pattern, parent_task_id, is_active, created_at, updated_at, created_by) FROM stdin;
fceb935b-7eb5-470a-aff5-4026b6597ac2	Follow up with Rajesh Kumar	Discuss final pricing and payment plan	FOLLOWUP_CALL	HIGH	PENDING	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	2025-10-19	10:00:00	60	\N	\N	\N	\N	\N	\N	\N	\N	t	1440	f	\N	\N	\N	\N	f	\N	\N	t	2025-10-19 21:23:36.570729	2025-10-19 21:23:36.570729	\N
6bb69263-18f3-4cb0-b3ff-34dcfe880298	Client Meeting - Priya Sharma	Site visit and unit finalization	CLIENT_MEETING	HIGH	PENDING	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	2025-10-19	14:30:00	60	\N	\N	\N	\N	\N	\N	\N	\N	t	1440	f	\N	\N	\N	\N	f	\N	\N	t	2025-10-19 21:23:36.570729	2025-10-19 21:23:36.570729	\N
2e69923d-5bc4-4049-8227-5af24cb8ecef	Call Amit Patel	Confirm site visit appointment for tomorrow	FOLLOWUP_CALL	HIGH	PENDING	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	2025-10-19	16:00:00	60	\N	\N	\N	\N	\N	\N	\N	\N	t	1440	f	\N	\N	\N	\N	f	\N	\N	t	2025-10-19 21:23:36.570729	2025-10-19 21:23:36.570729	\N
a23638e6-de81-44f7-a247-d79f4105fb1e	Send brochures to Sneha Reddy	Email property brochures and pricing	EMAIL_FOLLOWUP	MEDIUM	PENDING	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	2025-10-20	11:00:00	60	\N	\N	\N	\N	\N	\N	\N	\N	t	1440	f	\N	\N	\N	\N	f	\N	\N	t	2025-10-19 21:23:36.570729	2025-10-19 21:23:36.570729	\N
a689e951-812b-458a-80e0-51a512a1fe11	Site Visit - Vikram Singh	Show penthouse units at Tower A	SITE_VISIT	MEDIUM	PENDING	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	2025-10-21	10:30:00	60	\N	\N	\N	\N	\N	\N	\N	\N	t	1440	f	\N	\N	\N	\N	f	\N	\N	t	2025-10-19 21:23:36.570729	2025-10-19 21:23:36.570729	\N
1dd3a0fb-31f1-470c-9d9d-19b5d587964a	Follow up - Anita Desai	Discuss home loan assistance	FOLLOWUP_CALL	MEDIUM	PENDING	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	2025-10-22	15:00:00	60	\N	\N	\N	\N	\N	\N	\N	\N	t	1440	f	\N	\N	\N	\N	f	\N	\N	t	2025-10-19 21:23:36.570729	2025-10-19 21:23:36.570729	\N
f4604f36-44cf-41a2-a8fd-6344e7327db7	Team Meeting	Weekly sales review and strategy discussion	INTERNAL_MEETING	LOW	PENDING	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	2025-10-23	09:00:00	60	\N	\N	\N	\N	\N	\N	\N	\N	t	1440	f	\N	\N	\N	\N	f	\N	\N	t	2025-10-19 21:23:36.570729	2025-10-19 21:23:36.570729	\N
df1acb84-f406-4ee7-af8f-521bfe324821	Site visit with Rohan Malhotra	Showed luxury penthouses	SITE_VISIT	HIGH	COMPLETED	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	2025-10-17	11:00:00	60	\N	\N	\N	\N	\N	\N	\N	\N	t	1440	f	\N	\N	\N	\N	f	\N	\N	t	2025-10-17 21:23:36.570729	2025-10-19 21:23:36.570729	\N
f0c1821f-e4dc-4aac-ae16-1b86f2b65d3e	Follow up with Arjun Rao	Negotiated final price	NEGOTIATION	HIGH	COMPLETED	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	2025-10-18	14:00:00	60	\N	\N	\N	\N	\N	\N	\N	\N	t	1440	f	\N	\N	\N	\N	f	\N	\N	t	2025-10-18 21:23:36.570729	2025-10-19 21:23:36.570729	\N
f748c6cf-ea92-44e0-9a50-d2237a0c7563	Prepare monthly report	Sales and pipeline analysis	OTHER	MEDIUM	COMPLETED	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N	2025-10-16	16:00:00	60	\N	\N	\N	\N	\N	\N	\N	\N	t	1440	f	\N	\N	\N	\N	f	\N	\N	t	2025-10-16 21:23:36.570729	2025-10-19 21:23:36.570729	\N
\.


--
-- Data for Name: towers; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.towers (id, property_id, tower_code, name, description, total_floors, flats_per_floor, total_flats, tower_size, facing, "position", has_lift, number_of_lifts, lift_capacity, has_stairs, number_of_stairs, parking_type, parking_capacity, has_gym, has_garden, has_security_alarm, has_fire_alarm, is_vastu_compliant, has_central_ac, has_intercom, layout_images, arial_view_images, amenities, surrounding_description, status, is_active, created_at, updated_at, created_by, updated_by, tower_number, total_units, basement_levels, units_per_floor, construction_status, construction_start_date, completion_date, rera_number, built_up_area, carpet_area, ceiling_height, vastu_compliant, special_features, display_order, floor_plans, images, units_planned, units_defined, tower_checklist, data_completion_pct, data_completeness_status, issues_count) FROM stdin;
b1437242-cc66-4122-8d8f-df337bf8a851	266d7d6f-e5b1-46a1-9003-c065d803f041	B2	B2	Test	9	\N	\N	\N	North	\N	f	2	\N	t	1	\N	\N	f	f	f	f	f	f	f	\N	\N	\N	\N	Active	t	2025-10-19 00:51:15.180858	2025-10-19 10:54:14.579449	\N	\N	B2	36	1	4	PLANNED	2025-10-19	2025-10-26	Test	200.00	200.00	20.00	t	TestTestTestTest	1	\N	\N	0	37	\N	\N	NOT_STARTED	0
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.user_roles (user_id, role_id, assigned_at, assigned_by) FROM stdin;
0e034d20-3aa4-4dff-b90f-126bff07a5c1	fdbb55c5-5319-4a67-b8ad-11c423f45a19	2025-10-16 11:04:30.026093	\N
1beb5592-de61-4dd4-88f5-8eec08277afd	fdbb55c5-5319-4a67-b8ad-11c423f45a19	2025-10-18 16:28:11.179976	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: eastern_estate
--

COPY public.users (id, email, username, password_hash, first_name, last_name, phone, alternate_phone, date_of_birth, gender, profile_image, is_active, is_verified, email_verified_at, last_login_at, failed_login_attempts, locked_until, created_at, updated_at, created_by, updated_by) FROM stdin;
1beb5592-de61-4dd4-88f5-8eec08277afd	arnav@easternestate.in	arnavsinha	$2b$12$ReY0ffrsn5Ed/HY/b9m5U.KehHtspRYGFq9uW7F53FSJyKwIdlng2	Arnav	Sinha	+919939366036	\N	\N	Male	\N	t	f	\N	\N	0	\N	2025-10-18 16:28:11.179976	2025-10-18 16:28:11.179976	0e034d20-3aa4-4dff-b90f-126bff07a5c1	\N
0e034d20-3aa4-4dff-b90f-126bff07a5c1	superadmin@easternestates.com	superadmin	$2b$10$CHruEmWgawVwIHie3yu7muklLUj/8UjJMrOfIoyEu1eWwwdpVzkB6	Super	Admin	\N	\N	\N	\N	\N	t	t	\N	2025-10-20 02:38:07.044	0	\N	2025-10-16 11:04:17.91049	2025-10-20 02:38:07.050007	\N	\N
\.


--
-- Name: bookings bookings_booking_number_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_booking_number_key UNIQUE (booking_number);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_campaign_code_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_campaign_code_key UNIQUE (campaign_code);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: construction_projects construction_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.construction_projects
    ADD CONSTRAINT construction_projects_pkey PRIMARY KEY (id);


--
-- Name: construction_projects construction_projects_project_code_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.construction_projects
    ADD CONSTRAINT construction_projects_project_code_key UNIQUE (project_code);


--
-- Name: customers customers_customer_code_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_customer_code_key UNIQUE (customer_code);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: employees employees_employee_code_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_code_key UNIQUE (employee_code);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: flats flats_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.flats
    ADD CONSTRAINT flats_pkey PRIMARY KEY (id);


--
-- Name: flats flats_property_id_flat_number_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.flats
    ADD CONSTRAINT flats_property_id_flat_number_key UNIQUE (property_id, flat_number);


--
-- Name: floors floors_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.floors
    ADD CONSTRAINT floors_pkey PRIMARY KEY (id);


--
-- Name: floors floors_tower_id_floor_number_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.floors
    ADD CONSTRAINT floors_tower_id_floor_number_key UNIQUE (tower_id, floor_number);


--
-- Name: followups followups_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.followups
    ADD CONSTRAINT followups_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_item_code_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_item_code_key UNIQUE (item_code);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: leads leads_lead_code_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_lead_code_key UNIQUE (lead_code);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: payment_schedules payment_schedules_booking_id_installment_number_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.payment_schedules
    ADD CONSTRAINT payment_schedules_booking_id_installment_number_key UNIQUE (booking_id, installment_number);


--
-- Name: payment_schedules payment_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.payment_schedules
    ADD CONSTRAINT payment_schedules_pkey PRIMARY KEY (id);


--
-- Name: payments payments_payment_number_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_number_key UNIQUE (payment_number);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: projects projects_project_code_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_code_key UNIQUE (project_code);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: properties properties_property_code_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_property_code_key UNIQUE (property_code);


--
-- Name: purchase_orders purchase_orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_order_number_key UNIQUE (order_number);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sales_targets sales_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.sales_targets
    ADD CONSTRAINT sales_targets_pkey PRIMARY KEY (id);


--
-- Name: sales_tasks sales_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.sales_tasks
    ADD CONSTRAINT sales_tasks_pkey PRIMARY KEY (id);


--
-- Name: towers towers_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.towers
    ADD CONSTRAINT towers_pkey PRIMARY KEY (id);


--
-- Name: towers towers_property_id_tower_code_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.towers
    ADD CONSTRAINT towers_property_id_tower_code_key UNIQUE (property_id, tower_code);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_bookings_customer; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_bookings_customer ON public.bookings USING btree (customer_id);


--
-- Name: idx_bookings_number; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_bookings_number ON public.bookings USING btree (booking_number);


--
-- Name: idx_bookings_property; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_bookings_property ON public.bookings USING btree (property_id);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_campaigns_code; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_campaigns_code ON public.campaigns USING btree (campaign_code);


--
-- Name: idx_campaigns_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_campaigns_status ON public.campaigns USING btree (status);


--
-- Name: idx_campaigns_type; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_campaigns_type ON public.campaigns USING btree (campaign_type);


--
-- Name: idx_construction_code; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_construction_code ON public.construction_projects USING btree (project_code);


--
-- Name: idx_construction_property; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_construction_property ON public.construction_projects USING btree (property_id);


--
-- Name: idx_construction_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_construction_status ON public.construction_projects USING btree (status);


--
-- Name: idx_customers_active; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_customers_active ON public.customers USING btree (is_active);


--
-- Name: idx_customers_code; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_customers_code ON public.customers USING btree (customer_code);


--
-- Name: idx_customers_email; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_customers_email ON public.customers USING btree (email);


--
-- Name: idx_customers_phone; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_customers_phone ON public.customers USING btree (phone_number);


--
-- Name: idx_customers_property_preference; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_customers_property_preference ON public.customers USING btree (property_preference);


--
-- Name: idx_customers_requirement_type; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_customers_requirement_type ON public.customers USING btree (requirement_type);


--
-- Name: idx_employees_department; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_employees_department ON public.employees USING btree (department);


--
-- Name: idx_employees_email; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_employees_email ON public.employees USING btree (email);


--
-- Name: idx_employees_employee_code; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_employees_employee_code ON public.employees USING btree (employee_code);


--
-- Name: idx_employees_employment_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_employees_employment_status ON public.employees USING btree (employment_status);


--
-- Name: idx_employees_is_active; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_employees_is_active ON public.employees USING btree (is_active);


--
-- Name: idx_employees_phone_number; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_employees_phone_number ON public.employees USING btree (phone_number);


--
-- Name: idx_flats_active; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_flats_active ON public.flats USING btree (is_active);


--
-- Name: idx_flats_property; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_flats_property ON public.flats USING btree (property_id);


--
-- Name: idx_flats_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_flats_status ON public.flats USING btree (status);


--
-- Name: idx_floors_tower_id; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_floors_tower_id ON public.floors USING btree (tower_id);


--
-- Name: idx_followups_follow_up_date; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_followups_follow_up_date ON public.followups USING btree (follow_up_date);


--
-- Name: idx_followups_lead_date; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_followups_lead_date ON public.followups USING btree (lead_id, follow_up_date);


--
-- Name: idx_followups_lead_id; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_followups_lead_id ON public.followups USING btree (lead_id);


--
-- Name: idx_followups_next_follow_up_date; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_followups_next_follow_up_date ON public.followups USING btree (next_follow_up_date);


--
-- Name: idx_followups_performed_by; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_followups_performed_by ON public.followups USING btree (performed_by);


--
-- Name: idx_followups_user_date; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_followups_user_date ON public.followups USING btree (performed_by, follow_up_date);


--
-- Name: idx_inventory_category; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_inventory_category ON public.inventory_items USING btree (category);


--
-- Name: idx_inventory_code; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_inventory_code ON public.inventory_items USING btree (item_code);


--
-- Name: idx_inventory_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_inventory_status ON public.inventory_items USING btree (stock_status);


--
-- Name: idx_leads_active; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_leads_active ON public.leads USING btree (is_active);


--
-- Name: idx_leads_code; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_leads_code ON public.leads USING btree (lead_code);


--
-- Name: idx_leads_phone; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_leads_phone ON public.leads USING btree (phone_number);


--
-- Name: idx_leads_property_preference; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_leads_property_preference ON public.leads USING btree (property_preference);


--
-- Name: idx_leads_requirement_type; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_leads_requirement_type ON public.leads USING btree (requirement_type);


--
-- Name: idx_leads_site_visit_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_leads_site_visit_status ON public.leads USING btree (site_visit_status);


--
-- Name: idx_leads_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_leads_status ON public.leads USING btree (status);


--
-- Name: idx_payment_schedules_booking_id; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_payment_schedules_booking_id ON public.payment_schedules USING btree (booking_id);


--
-- Name: idx_payment_schedules_due_date; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_payment_schedules_due_date ON public.payment_schedules USING btree (due_date);


--
-- Name: idx_payment_schedules_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_payment_schedules_status ON public.payment_schedules USING btree (status);


--
-- Name: idx_payments_booking; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_payments_booking ON public.payments USING btree (booking_id);


--
-- Name: idx_payments_customer; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_payments_customer ON public.payments USING btree (customer_id);


--
-- Name: idx_payments_number; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_payments_number ON public.payments USING btree (payment_number);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_payments_status ON public.payments USING btree (payment_status);


--
-- Name: idx_po_number; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_po_number ON public.purchase_orders USING btree (order_number);


--
-- Name: idx_po_payment_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_po_payment_status ON public.purchase_orders USING btree (payment_status);


--
-- Name: idx_po_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_po_status ON public.purchase_orders USING btree (order_status);


--
-- Name: idx_projects_is_active; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_projects_is_active ON public.projects USING btree (is_active);


--
-- Name: idx_projects_project_code; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE UNIQUE INDEX idx_projects_project_code ON public.projects USING btree (project_code);


--
-- Name: idx_properties_active; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_properties_active ON public.properties USING btree (is_active);


--
-- Name: idx_properties_code; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_properties_code ON public.properties USING btree (property_code);


--
-- Name: idx_properties_project_id; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_properties_project_id ON public.properties USING btree (project_id);


--
-- Name: idx_properties_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_properties_status ON public.properties USING btree (status);


--
-- Name: idx_sales_targets_period; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_sales_targets_period ON public.sales_targets USING btree (target_period);


--
-- Name: idx_sales_targets_person_period; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_sales_targets_person_period ON public.sales_targets USING btree (sales_person_id, target_period, start_date);


--
-- Name: idx_sales_targets_sales_person; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_sales_targets_sales_person ON public.sales_targets USING btree (sales_person_id);


--
-- Name: idx_sales_targets_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_sales_targets_status ON public.sales_targets USING btree (status);


--
-- Name: idx_sales_tasks_assigned_due; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_sales_tasks_assigned_due ON public.sales_tasks USING btree (assigned_to, due_date);


--
-- Name: idx_sales_tasks_assigned_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_sales_tasks_assigned_status ON public.sales_tasks USING btree (assigned_to, status);


--
-- Name: idx_sales_tasks_assigned_to; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_sales_tasks_assigned_to ON public.sales_tasks USING btree (assigned_to);


--
-- Name: idx_sales_tasks_due_date; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_sales_tasks_due_date ON public.sales_tasks USING btree (due_date);


--
-- Name: idx_sales_tasks_due_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_sales_tasks_due_status ON public.sales_tasks USING btree (due_date, status);


--
-- Name: idx_sales_tasks_lead_id; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_sales_tasks_lead_id ON public.sales_tasks USING btree (lead_id);


--
-- Name: idx_sales_tasks_status; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_sales_tasks_status ON public.sales_tasks USING btree (status);


--
-- Name: idx_sales_tasks_task_type; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_sales_tasks_task_type ON public.sales_tasks USING btree (task_type);


--
-- Name: idx_towers_number; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_towers_number ON public.towers USING btree (tower_number);


--
-- Name: idx_towers_property_id; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_towers_property_id ON public.towers USING btree (property_id);


--
-- Name: idx_towers_tower_code; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_towers_tower_code ON public.towers USING btree (tower_code);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_is_active; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_users_is_active ON public.users USING btree (is_active);


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: eastern_estate
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: followups update_followups_updated_at; Type: TRIGGER; Schema: public; Owner: eastern_estate
--

CREATE TRIGGER update_followups_updated_at BEFORE UPDATE ON public.followups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sales_targets update_sales_targets_updated_at; Type: TRIGGER; Schema: public; Owner: eastern_estate
--

CREATE TRIGGER update_sales_targets_updated_at BEFORE UPDATE ON public.sales_targets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sales_tasks update_sales_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: eastern_estate
--

CREATE TRIGGER update_sales_tasks_updated_at BEFORE UPDATE ON public.sales_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bookings bookings_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: bookings bookings_flat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(id);


--
-- Name: bookings bookings_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: construction_projects construction_projects_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.construction_projects
    ADD CONSTRAINT construction_projects_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: properties fk_properties_project; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT fk_properties_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: flats flats_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.flats
    ADD CONSTRAINT flats_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: floors floors_tower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.floors
    ADD CONSTRAINT floors_tower_id_fkey FOREIGN KEY (tower_id) REFERENCES public.towers(id) ON DELETE CASCADE;


--
-- Name: followups followups_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.followups
    ADD CONSTRAINT followups_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: followups followups_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.followups
    ADD CONSTRAINT followups_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: leads leads_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: payments payments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: sales_targets sales_targets_sales_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.sales_targets
    ADD CONSTRAINT sales_targets_sales_person_id_fkey FOREIGN KEY (sales_person_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sales_targets sales_targets_set_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.sales_targets
    ADD CONSTRAINT sales_targets_set_by_fkey FOREIGN KEY (set_by) REFERENCES public.users(id);


--
-- Name: sales_tasks sales_tasks_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.sales_tasks
    ADD CONSTRAINT sales_tasks_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: sales_tasks sales_tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.sales_tasks
    ADD CONSTRAINT sales_tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sales_tasks sales_tasks_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.sales_tasks
    ADD CONSTRAINT sales_tasks_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eastern_estate
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict sv3wogApdJDw2vI9eVF6f1NezPqMxHkegQLnpevYvI3HRBEWdqN67HHOTxnRL5Q

