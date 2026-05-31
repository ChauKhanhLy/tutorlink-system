import sequelize from '../config/database.js';
import User from './user.model.js';
import TutorProfile from './tutor_profile.model.js';
import Booking from './booking.model.js';
import Review from './review.model.js';
import Payment from './payment.model.js';
import Wallet from './wallet.model.js';
import Transaction from './transaction.model.js';
import Settlement from './settlement.model.js';
import VideoRoom from './videoRoom.model.js';

// Define associations
const models = {
  User,
  TutorProfile,
  Booking,
  Review,
  Payment,
  Wallet,
  Transaction,
  Settlement,
  VideoRoom
};

// User associations
User.hasOne(TutorProfile, { foreignKey: 'user_id', as: 'tutorProfile' });
User.hasMany(Booking, { foreignKey: 'learner_id', as: 'learnerBookings' });
User.hasMany(Booking, { foreignKey: 'tutor_id', as: 'tutorBookings' });
User.hasOne(Wallet, { foreignKey: 'user_id', as: 'wallet' });
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
User.hasMany(Settlement, { foreignKey: 'user_id', as: 'settlements' });

// TutorProfile associations
TutorProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Booking associations
Booking.belongsTo(User, { foreignKey: 'learner_id', as: 'learner' });
Booking.belongsTo(User, { foreignKey: 'tutor_id', as: 'tutor' });
Booking.hasMany(Review, { foreignKey: 'booking_id', as: 'reviews' });
Booking.hasMany(Payment, { foreignKey: 'booking_id', as: 'payments' });
Booking.hasOne(VideoRoom, { foreignKey: 'booking_id', as: 'videoRoom' });

// Review associations
Review.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Payment associations
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// Wallet associations
Wallet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Wallet.hasMany(Transaction, { foreignKey: 'wallet_id', as: 'transactions' });

// Transaction associations
Transaction.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Settlement associations
Settlement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// VideoRoom associations
VideoRoom.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

const db = {
  ...models,
  sequelize
};

export default db;
