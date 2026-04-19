import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial cart
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        if (currentUser) {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().cart) {
            setCartItems(docSnap.data().cart);
          } else {
            const localCart = JSON.parse(localStorage.getItem('rvo_cart')) || [];
            if(localCart.length > 0) {
              setCartItems(localCart);
            }
          }
        } else {
          const localCart = JSON.parse(localStorage.getItem('rvo_cart')) || [];
          setCartItems(localCart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
      setIsLoading(false);
    };

    if (currentUser !== undefined) {
      loadCart();
    }
  }, [currentUser]);

  // Save cart on change
  useEffect(() => {
    if (isLoading) return;

    localStorage.setItem('rvo_cart', JSON.stringify(cartItems));

    if (currentUser) {
      const syncToFirestore = async () => {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          await setDoc(docRef, { cart: cartItems }, { merge: true });
        } catch (error) {
          console.error("Failed to sync cart", error);
        }
      };
      syncToFirestore();
    }
  }, [cartItems, currentUser, isLoading]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
          ? { ...item, qty: item.qty + quantity }
          : item
        );
      }
      return [...prev, { ...product, qty: quantity }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}
