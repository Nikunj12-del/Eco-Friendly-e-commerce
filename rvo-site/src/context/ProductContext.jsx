import { createContext, useContext, useState } from 'react';
import { products as dummyProducts } from '../data/products';

const ProductContext = createContext();

export function useProduct() {
  return useContext(ProductContext);
}

export function ProductProvider({ children }) {
  const [products] = useState(dummyProducts);

  const getProductById = (id) => {
    return products.find(p => p.id === parseInt(id));
  };

  return (
    <ProductContext.Provider value={{ products, getProductById }}>
      {children}
    </ProductContext.Provider>
  );
}
