import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const { currentUser } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial wishlist
  useEffect(() => {
    const loadWishlist = async () => {
      setIsLoading(true);
      try {
        if (currentUser) {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().wishlist) {
            setWishlistItems(docSnap.data().wishlist);
          } else {
            const localWishlist = JSON.parse(localStorage.getItem('rvo_wishlist')) || [];
            if(localWishlist.length > 0) {
              setWishlistItems(localWishlist);
            }
          }
        } else {
          const localWishlist = JSON.parse(localStorage.getItem('rvo_wishlist')) || [];
          setWishlistItems(localWishlist);
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
      setIsLoading(false);
    };

    if (currentUser !== undefined) {
      loadWishlist();
    }
  }, [currentUser]);

  // Save wishlist on change
  useEffect(() => {
    if (isLoading) return;

    localStorage.setItem('rvo_wishlist', JSON.stringify(wishlistItems));

    if (currentUser) {
      const syncToFirestore = async () => {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          await setDoc(docRef, { wishlist: wishlistItems }, { merge: true });
        } catch (error) {
          console.error("Failed to sync wishlist", error);
        }
      };
      syncToFirestore();
    }
  }, [wishlistItems, currentUser, isLoading]);

  const toggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };
  
  const isInWishlist = (id) => {
    return wishlistItems.some(item => item.id === id);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      toggleWishlist,
      removeFromWishlist,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}
