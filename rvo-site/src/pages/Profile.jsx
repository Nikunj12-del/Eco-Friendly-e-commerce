import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();

  return (
    <div className="section-padding py-32 bg-ivory-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif text-forest-green mb-8">My Profile</h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-forest-green/10 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif text-forest-green">{currentUser?.displayName || 'User'}</h2>
            <p className="text-forest-green/70">{currentUser?.email}</p>
          </div>
          <button onClick={logout} className="px-6 py-2 border border-red-200 text-red-500 rounded-full hover:bg-red-50 transition-colors">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-forest-green/10">
            <h3 className="text-xl font-serif text-forest-green mb-4">Account Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-forest-green/70">Items in Cart</span>
                <span className="font-semibold text-forest-green">{cartItems.length}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-forest-green/70">Items in Wishlist</span>
                <span className="font-semibold text-forest-green">{wishlistItems.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-forest-green/70">Total Orders</span>
                <span className="font-semibold text-forest-green">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
