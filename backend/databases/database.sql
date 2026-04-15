--
-- PostgreSQL database dump
--

\restrict Jt6Q0i0cNwnbXVSYwtvzDN4yCpmqdGfnJGIYslgB42jdLgq5a020OyKRlr3farc

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-01 14:56:33

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3 (class 3079 OID 16616)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 2 (class 3079 OID 16391)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 938 (class 1247 OID 16655)
-- Name: enum_Bookings_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Bookings_status" AS ENUM (
    'pending',
    'confirmed',
    'done',
    'cancel'
);


ALTER TYPE public."enum_Bookings_status" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 231 (class 1259 OID 16664)
-- Name: Bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Bookings" (
    id integer NOT NULL,
    datetime timestamp with time zone NOT NULL,
    status public."enum_Bookings_status" DEFAULT 'pending'::public."enum_Bookings_status",
    fee numeric(10,2) NOT NULL,
    tutor_id integer NOT NULL,
    learner_id integer NOT NULL,
    subject_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Bookings" OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16663)
-- Name: Bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Bookings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Bookings_id_seq" OWNER TO postgres;

--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 230
-- Name: Bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Bookings_id_seq" OWNED BY public."Bookings".id;


--
-- TOC entry 225 (class 1259 OID 16501)
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    learner_id uuid,
    tutor_id uuid,
    subject_id uuid,
    datetime timestamp without time zone NOT NULL,
    status character varying(20),
    fee numeric(10,2),
    meeting_link text,
    CONSTRAINT bookings_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16576)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sender_id uuid,
    receiver_id uuid,
    content text,
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_read boolean DEFAULT false
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16550)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    booking_id uuid,
    payer_id uuid,
    receiver_id uuid,
    amount numeric(12,2) NOT NULL,
    type character varying(20),
    status character varying(20),
    provider character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'success'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT payments_type_check CHECK (((type)::text = ANY ((ARRAY['lesson'::character varying, 'withdraw'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16527)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    booking_id uuid,
    reviewer_id uuid,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16474)
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(255)
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16459)
-- Name: tutor_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tutor_profiles (
    user_id uuid NOT NULL,
    bio text,
    hourly_fee numeric(10,2),
    rating_avg double precision DEFAULT 0,
    verified boolean DEFAULT false
);


ALTER TABLE public.tutor_profiles OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16484)
-- Name: tutor_subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tutor_subjects (
    tutor_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    price numeric(10,2)
);


ALTER TABLE public.tutor_subjects OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16443)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(20),
    role character varying(20),
    avatar text,
    verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['learner'::character varying, 'tutor'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16597)
-- Name: video_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.video_sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    booking_id uuid,
    room_id character varying(255),
    provider character varying(50),
    start_time timestamp without time zone,
    end_time timestamp without time zone
);


ALTER TABLE public.video_sessions OWNER TO postgres;

--
-- TOC entry 4959 (class 2604 OID 16667)
-- Name: Bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Bookings" ALTER COLUMN id SET DEFAULT nextval('public."Bookings_id_seq"'::regclass);


--
-- TOC entry 5168 (class 0 OID 16664)
-- Dependencies: 231
-- Data for Name: Bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Bookings" (id, datetime, status, fee, tutor_id, learner_id, subject_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5162 (class 0 OID 16501)
-- Dependencies: 225
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, learner_id, tutor_id, subject_id, datetime, status, fee, meeting_link) FROM stdin;
ad98a8f2-ba5b-4205-8375-0938a7f4db80	fe503b3d-9dac-4743-a7fa-eec8f41ed80a	49ec8f58-ebfd-458b-87ea-9b48963f55f5	900b2ea5-16ea-4c80-93b1-0f1cc50b4adf	2026-04-02 15:31:00	completed	200000.00	https://meet.com
\.


--
-- TOC entry 5165 (class 0 OID 16576)
-- Dependencies: 228
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, receiver_id, content, sent_at, is_read) FROM stdin;
\.


--
-- TOC entry 5164 (class 0 OID 16550)
-- Dependencies: 227
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, booking_id, payer_id, receiver_id, amount, type, status, provider, created_at) FROM stdin;
\.


--
-- TOC entry 5163 (class 0 OID 16527)
-- Dependencies: 226
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, booking_id, reviewer_id, rating, comment, created_at) FROM stdin;
\.


--
-- TOC entry 5160 (class 0 OID 16474)
-- Dependencies: 223
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (id, name, category) FROM stdin;
900b2ea5-16ea-4c80-93b1-0f1cc50b4adf	Toán	Khoa học tự nhiên
\.


--
-- TOC entry 5159 (class 0 OID 16459)
-- Dependencies: 222
-- Data for Name: tutor_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tutor_profiles (user_id, bio, hourly_fee, rating_avg, verified) FROM stdin;
49ec8f58-ebfd-458b-87ea-9b48963f55f5	Gia sư Toán	200000.00	9.7	t
\.


--
-- TOC entry 5161 (class 0 OID 16484)
-- Dependencies: 224
-- Data for Name: tutor_subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tutor_subjects (tutor_id, subject_id, price) FROM stdin;
49ec8f58-ebfd-458b-87ea-9b48963f55f5	900b2ea5-16ea-4c80-93b1-0f1cc50b4adf	200000.00
\.


--
-- TOC entry 5158 (class 0 OID 16443)
-- Dependencies: 221
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, name, phone, role, avatar, verified, created_at) FROM stdin;
fe503b3d-9dac-4743-a7fa-eec8f41ed80a	12345@gmail.com	LeNgoc	012534366	learner	https://www.google.com/search?q=%E1%BA%A3nh+pikachu+meme&rlz=1C1VDKB_viVN1207VN1207&oq=%E1%BA%A3nh+pikachu&gs_lcrp=EgZjaHJvbWUqBwgAEAAYgAQyBwgAEAAYgAQyBggBEEUYOTIHCAIQABiABDIHCAMQABiABDIHCAQQABiABDIHCAUQABiABDIHCAYQABiABDIHCAcQABiABDIHCAgQABiABDIHCAkQABiABNIBCDgyMjJqMGo3qAIIsAIB8QW9IGLQOBNewA&sourceid=chrome&ie=UTF-8#sv=CAMSZxowKg5Qd2h6TEVXR3BhU3RCTTIOUHdoekxFV0dwYVN0Qk06DjE2OUlCdjN3LTZDWS1NIAQqLwobX3NNRE1hZGlPQzhIZjJyb1BzdmE5d0FrXzY1Eg5Qd2h6TEVXR3BhU3RCTRgAMAEYByC8qs7yDUoIEAEYASABKAE	t	2026-04-01 15:30:00
49ec8f58-ebfd-458b-87ea-9b48963f55f5	6789@gmail.com	BichNgoc	098765432	tutor	https://www.google.com/search?q=%E1%BA%A3nh+pikachu+meme&rlz=1C1VDKB_viVN1207VN1207&oq=%E1%BA%A3nh+pikachu&gs_lcrp=EgZjaHJvbWUqBwgAEAAYgAQyBwgAEAAYgAQyBggBEEUYOTIHCAIQABiABDIHCAMQABiABDIHCAQQABiABDIHCAUQABiABDIHCAYQABiABDIHCAcQABiABDIHCAgQABiABDIHCAkQABiABNIBCDgyMjJqMGo3qAIIsAIB8QW9IGLQOBNewA&sourceid=chrome&ie=UTF-8#sv=CAMSZxowKg52bXVQZl9kQ2JnMnBXTTIOdm11UGZfZENiZzJwV006DlBPNkloS09nWk5seUVNIAQqLwobX3NNRE1hZGlPQzhIZjJyb1BzdmE5d0FrXzY1Eg52bXVQZl9kQ2JnMnBXTRgAMAEYByDOzY-YCEoIEAEYASABKAE	t	2026-04-07 15:31:00
\.


--
-- TOC entry 5166 (class 0 OID 16597)
-- Dependencies: 229
-- Data for Name: video_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.video_sessions (id, booking_id, room_id, provider, start_time, end_time) FROM stdin;
\.


--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 230
-- Name: Bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Bookings_id_seq"', 1, false);


--
-- TOC entry 4996 (class 2606 OID 16678)
-- Name: Bookings Bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Bookings"
    ADD CONSTRAINT "Bookings_pkey" PRIMARY KEY (id);


--
-- TOC entry 4977 (class 2606 OID 16511)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 4990 (class 2606 OID 16586)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4988 (class 2606 OID 16560)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4981 (class 2606 OID 16539)
-- Name: reviews reviews_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_key UNIQUE (booking_id);


--
-- TOC entry 4983 (class 2606 OID 16537)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4973 (class 2606 OID 16483)
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 16468)
-- Name: tutor_profiles tutor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor_profiles
    ADD CONSTRAINT tutor_profiles_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4975 (class 2606 OID 16490)
-- Name: tutor_subjects tutor_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor_subjects
    ADD CONSTRAINT tutor_subjects_pkey PRIMARY KEY (tutor_id, subject_id);


--
-- TOC entry 4967 (class 2606 OID 16458)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4969 (class 2606 OID 16456)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4992 (class 2606 OID 16605)
-- Name: video_sessions video_sessions_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_sessions
    ADD CONSTRAINT video_sessions_booking_id_key UNIQUE (booking_id);


--
-- TOC entry 4994 (class 2606 OID 16603)
-- Name: video_sessions video_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_sessions
    ADD CONSTRAINT video_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 1259 OID 16611)
-- Name: idx_booking_learner; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_booking_learner ON public.bookings USING btree (learner_id);


--
-- TOC entry 4979 (class 1259 OID 16612)
-- Name: idx_booking_tutor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_booking_tutor ON public.bookings USING btree (tutor_id);


--
-- TOC entry 4984 (class 1259 OID 16613)
-- Name: idx_payment_booking; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_booking ON public.payments USING btree (booking_id);


--
-- TOC entry 4985 (class 1259 OID 16614)
-- Name: idx_payment_payer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_payer ON public.payments USING btree (payer_id);


--
-- TOC entry 4986 (class 1259 OID 16615)
-- Name: idx_payment_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_receiver ON public.payments USING btree (receiver_id);


--
-- TOC entry 5000 (class 2606 OID 16512)
-- Name: bookings bookings_learner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5001 (class 2606 OID 16522)
-- Name: bookings bookings_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- TOC entry 5002 (class 2606 OID 16517)
-- Name: bookings bookings_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutor_profiles(user_id) ON DELETE CASCADE;


--
-- TOC entry 5008 (class 2606 OID 16592)
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5009 (class 2606 OID 16587)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5005 (class 2606 OID 16561)
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- TOC entry 5006 (class 2606 OID 16566)
-- Name: payments payments_payer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payer_id_fkey FOREIGN KEY (payer_id) REFERENCES public.users(id);


--
-- TOC entry 5007 (class 2606 OID 16571)
-- Name: payments payments_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id);


--
-- TOC entry 5003 (class 2606 OID 16540)
-- Name: reviews reviews_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- TOC entry 5004 (class 2606 OID 16545)
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- TOC entry 4997 (class 2606 OID 16469)
-- Name: tutor_profiles tutor_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor_profiles
    ADD CONSTRAINT tutor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4998 (class 2606 OID 16496)
-- Name: tutor_subjects tutor_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor_subjects
    ADD CONSTRAINT tutor_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- TOC entry 4999 (class 2606 OID 16491)
-- Name: tutor_subjects tutor_subjects_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor_subjects
    ADD CONSTRAINT tutor_subjects_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutor_profiles(user_id) ON DELETE CASCADE;


--
-- TOC entry 5010 (class 2606 OID 16606)
-- Name: video_sessions video_sessions_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_sessions
    ADD CONSTRAINT video_sessions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


-- Completed on 2026-04-01 14:56:33

--
-- PostgreSQL database dump complete
--

\unrestrict Jt6Q0i0cNwnbXVSYwtvzDN4yCpmqdGfnJGIYslgB42jdLgq5a020OyKRlr3farc

