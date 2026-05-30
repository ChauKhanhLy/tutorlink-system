import React from "react";

import {
  Calendar,
  Clock,
  Wallet,
  Users,
  Trash2,
  DollarSign,
  Loader2,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { tutorApi } from "../api/tutorApi";

import { bookingApi } from "../api/bookingApi";

import { ImageWithFallback }
  from "../components/Image/ImageWithFallback";

import { WalletPage }
  from "./Wallet.jsx";

import { toast } from "sonner";