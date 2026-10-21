import React from 'react';
import {BrowserRouter,Routes,Route} from 'react-router';
import {ShopProvider} from './contexts/ShopContext';
import {Layout} from './components/SiteLayout';
import Home from './pages/Home';
import {Catalog,ProductDetail} from './pages/ShopPages';
import {Cart,Checkout,PurchaseResult} from './pages/CartCheckout';
import {Login,Register,MyAccount,Admin,ProtectedAdmin} from './pages/AccountAdmin';
import {About,Blog,BlogDetail,Contact,NotFound} from './pages/InfoPages';
export default function App(){return <BrowserRouter><ShopProvider><Routes><Route element={<Layout/>}>
 <Route index element={<Home/>}/>
 <Route path="catalogo" element={<Catalog/>}/><Route path="categorias/:category" element={<Catalog/>}/><Route path="ofertas" element={<Catalog onlyOffers/>}/>
 <Route path="producto/:id" element={<ProductDetail/>}/>
 <Route path="carrito" element={<Cart/>}/><Route path="checkout" element={<Checkout/>}/><Route path="compra-exitosa/:id" element={<PurchaseResult success/>}/><Route path="compra-rechazada" element={<PurchaseResult success={false}/>}/>
 <Route path="login" element={<Login/>}/><Route path="registro" element={<Register/>}/><Route path="mi-cuenta" element={<MyAccount/>}/><Route path="admin" element={<ProtectedAdmin><Admin/></ProtectedAdmin>}/>
 <Route path="nosotros" element={<About/>}/><Route path="blog" element={<Blog/>}/><Route path="blog/:slug" element={<BlogDetail/>}/><Route path="contacto" element={<Contact/>}/><Route path="*" element={<NotFound/>}/>
 </Route></Routes></ShopProvider></BrowserRouter>}
