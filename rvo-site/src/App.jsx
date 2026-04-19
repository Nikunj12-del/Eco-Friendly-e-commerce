import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layout & Protection
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';

function App() {
  return (
    <ProductProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="flex flex-col min-h-screen bg-ivory-white selection:bg-premium-gold/30 selection:text-forest-green pt-[90px]">
              <Toaster 
                 position="bottom-right" 
                 toastOptions={{
                   style: {
                     background: '#1F4D36',
                     color: '#FAF9F6',
                     border: '1px solid #C8A96B'
                   }
                 }} 
              />
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/about" element={<About />} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Protected Routes */}
                  <Route 
                    path="/profile" 
                    element={<ProtectedRoute><Profile /></ProtectedRoute>} 
                  />
                  <Route 
                    path="/checkout" 
                    element={<ProtectedRoute><Checkout /></ProtectedRoute>} 
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ProductProvider>
  );
}

export default App;
