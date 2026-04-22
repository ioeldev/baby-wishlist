import { BrowserRouter, Route, Routes } from "react-router";
import { AdminWishlistPage } from "./pages/AdminWishlistPage";
import { PublicItemDetailPage } from "./pages/PublicItemDetailPage";
import { PublicWishlistPage } from "./pages/PublicWishlistPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicWishlistPage />} />
        <Route path="/item/:id" element={<PublicItemDetailPage />} />
        <Route path="/admin" element={<AdminWishlistPage />} />
        <Route path="*" element={<PublicWishlistPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
